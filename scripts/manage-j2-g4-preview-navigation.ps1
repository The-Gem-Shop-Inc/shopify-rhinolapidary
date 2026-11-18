[CmdletBinding()]
param(
  [ValidateSet('Plan', 'Apply', 'Verify', 'Rollback')]
  [string]$Mode = 'Plan',
  [Parameter(Mandatory = $true)]
  [string]$LiveEvidencePath,
  [string]$AuthorizationValue = '',
  [string]$RollbackAuthorizationValue = '',
  [switch]$ConfirmMenuMutation,
  [string]$AdminAccessTokenEnvironmentVariable = 'SHOPIFY_ACCESS_TOKEN',
  [int]$MaxLiveEvidenceAgeMinutes = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$TransitionPath = Join-Path $RepositoryRoot 'data\j2-g4-preview-menu-transition.json'
$ValidatorPath = Join-Path $RepositoryRoot 'scripts\validate-j2-g4-preview-menu-transition.js'
$ExpectedBranch = 'integration/catalog-cart-preview'
$ExpectedShop = 'sz5dnk-nf.myshopify.com'
$ExpectedMenuGid = 'gid://shopify/Menu/257402405061'
$ProtectedProductionMenuGid = 'gid://shopify/Menu/254120886469'

function Assert-Gate([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw "STOP: $Message" }
}

function Invoke-NativeChecked([string]$File, [string[]]$Arguments) {
  $output = & $File @Arguments 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) { throw "STOP: $File $($Arguments -join ' ') failed ($LASTEXITCODE).`n$output" }
  $output.Trim()
}

function Convert-MenuItem([object]$Item) {
  $converted = [ordered]@{}
  if ($Item.PSObject.Properties.Name -contains 'id' -and $Item.id) { $converted.id = $Item.id }
  $converted.title = $Item.title
  $converted.type = $Item.type
  if ($null -ne $Item.url) { $converted.url = $Item.url }
  if ($null -ne $Item.resourceId) { $converted.resourceId = $Item.resourceId }
  $converted.tags = @($Item.tags)
  $converted.items = @($Item.items | ForEach-Object { Convert-MenuItem $_ })
  $converted
}

function Get-Variables([object]$Transition, [object[]]$Tree) {
  [ordered]@{
    id = $Transition.target.previewMenu.gid
    title = $Transition.target.previewMenu.title
    handle = $Transition.target.previewMenu.handle
    items = @($Tree | ForEach-Object { Convert-MenuItem $_ })
  }
}

function Assert-RepositoryState {
  Push-Location $RepositoryRoot
  try {
    Assert-Gate ((Invoke-NativeChecked 'git' @('branch', '--show-current')) -eq $ExpectedBranch) 'Wrong Git branch'
    $head = Invoke-NativeChecked 'git' @('rev-parse', 'HEAD')
    $upstream = Invoke-NativeChecked 'git' @('rev-parse', '@{u}')
    Assert-Gate ($head -eq $upstream) 'Local and upstream HEAD differ'
    Assert-Gate ([string]::IsNullOrWhiteSpace((Invoke-NativeChecked 'git' @('status', '--porcelain')))) 'Working tree must be clean'
    & git merge-base --is-ancestor 64ddfaadbcea98175940fd54d9cf198c443e39c3 HEAD
    Assert-Gate ($LASTEXITCODE -eq 0) 'Immutable integration ancestor is missing'
  } finally {
    Pop-Location
  }
}

function Assert-LiveEvidence([string]$ExpectedState) {
  $resolved = (Resolve-Path -LiteralPath $LiveEvidencePath).Path
  Assert-Gate (-not $resolved.StartsWith($RepositoryRoot, [StringComparison]::OrdinalIgnoreCase)) 'Live Shopify evidence must remain outside Git'
  $arguments = @(
    $ValidatorPath,
    "--live-evidence=$resolved",
    "--expected-state=$ExpectedState",
    "--max-age-minutes=$MaxLiveEvidenceAgeMinutes"
  )
  $validation = Invoke-NativeChecked 'node' $arguments | ConvertFrom-Json -Depth 100
  Assert-Gate ($validation.result -eq 'PASS' -and $validation.liveEvidence -eq 'PASS') 'Live evidence validation failed'
  $resolved
}

function Invoke-MenuMutation([object]$Transition, [object]$Variables) {
  Assert-Gate ($Variables.id -eq $ExpectedMenuGid) 'Mutation target is not the approved preview menu'
  Assert-Gate ($Variables.id -ne $ProtectedProductionMenuGid) 'Production main-menu is forbidden'
  $token = [Environment]::GetEnvironmentVariable($AdminAccessTokenEnvironmentVariable)
  Assert-Gate (-not [string]::IsNullOrWhiteSpace($token)) "Missing Admin access token environment variable $AdminAccessTokenEnvironmentVariable"
  $endpoint = "https://$ExpectedShop/admin/api/$($Transition.api.apiVersion)/graphql.json"
  $payload = [ordered]@{ query = $Transition.api.mutationDocument; variables = $Variables } | ConvertTo-Json -Depth 100 -Compress
  $response = Invoke-RestMethod -Method Post -Uri $endpoint -Headers @{ 'X-Shopify-Access-Token' = $token } -ContentType 'application/json' -Body $payload
  $hasTopLevelErrors = $response.PSObject.Properties.Name -contains 'errors' -and @($response.errors).Count -gt 0
  Assert-Gate (-not $hasTopLevelErrors) 'Admin GraphQL returned top-level errors'
  $result = $response.data.menuUpdate
  Assert-Gate ($null -ne $result) 'menuUpdate returned no payload'
  Assert-Gate (@($result.userErrors).Count -eq 0) "menuUpdate userErrors: $(@($result.userErrors | ForEach-Object message) -join '; ')"
  Assert-Gate ($result.menu.id -eq $ExpectedMenuGid) 'menuUpdate returned the wrong menu'
  $result.menu
}

Assert-Gate (Test-Path -LiteralPath $TransitionPath -PathType Leaf) 'Transition artifact is missing'
$transition = Get-Content -LiteralPath $TransitionPath -Raw | ConvertFrom-Json -Depth 100
Assert-Gate ($transition.mutationAuthorized -eq $false) 'Planning artifact must not claim mutation authorization'
Assert-Gate ($transition.target.previewMenu.gid -eq $ExpectedMenuGid) 'Transition targets the wrong menu'
Assert-Gate ($transition.target.protectedProductionMenu.gid -eq $ProtectedProductionMenuGid) 'Protected production menu identity changed'
Assert-Gate ($transition.target.productionMutationAllowed -eq $false) 'Production mutation must remain forbidden'

Assert-RepositoryState

$proposedVariables = Get-Variables $transition $transition.recommendation.approvedProposedTree
$rollbackVariables = Get-Variables $transition $transition.rollback.tree
$mutationJson = $transition.api.mutationDocument

if ($Mode -eq 'Plan') {
  Assert-Gate ([string]::IsNullOrWhiteSpace($AuthorizationValue)) 'Plan rejects Apply authorization values'
  Assert-Gate ([string]::IsNullOrWhiteSpace($RollbackAuthorizationValue)) 'Plan rejects rollback authorization values'
  Assert-Gate (-not $ConfirmMenuMutation.IsPresent) 'Plan rejects mutation confirmation'
  $evidence = Assert-LiveEvidence 'predecessor'
  Write-Output 'PLAN PASS'
  Write-Output "Live evidence: $evidence"
  Write-Output "Transition digest: $($transition.digests.transitionSha256)"
  Write-Output "Future Apply authorization: $($transition.authorization.futureApplyAuthorizationValue)"
  Write-Output 'Exact proposed GraphQL operation:'
  Write-Output $mutationJson
  Write-Output 'Exact proposed variables:'
  Write-Output ($proposedVariables | ConvertTo-Json -Depth 100)
  Write-Output 'Exact rollback variables (separate authorization required):'
  Write-Output ($rollbackVariables | ConvertTo-Json -Depth 100)
  Write-Output 'No Shopify mutation executed.'
  return
}

if ($Mode -eq 'Verify') {
  Assert-Gate ([string]::IsNullOrWhiteSpace($AuthorizationValue)) 'Verify rejects Apply authorization values'
  Assert-Gate ([string]::IsNullOrWhiteSpace($RollbackAuthorizationValue)) 'Verify rejects rollback authorization values'
  Assert-Gate (-not $ConfirmMenuMutation.IsPresent) 'Verify rejects mutation confirmation'
  $evidence = Assert-LiveEvidence 'proposed'
  Write-Output 'VERIFY PASS: exact proposed menu semantics, one All Products destination, preview assignment, roles, resources, and routes verified read-only.'
  Write-Output "Live evidence: $evidence"
  Write-Output 'Future live browser verification remains required for desktop/mobile keyboard and touch disclosure.'
  return
}

if ($Mode -eq 'Apply') {
  Assert-Gate ([string]::IsNullOrWhiteSpace($RollbackAuthorizationValue)) 'Apply rejects rollback authorization values'
  Assert-Gate ($ConfirmMenuMutation.IsPresent) 'Apply requires -ConfirmMenuMutation'
  Assert-Gate ($AuthorizationValue -eq $transition.authorization.futureApplyAuthorizationValue) 'Apply authorization does not match the exact transition binding'
  Assert-LiveEvidence 'predecessor' | Out-Null
  $menu = Invoke-MenuMutation $transition $proposedVariables
  Write-Output "APPLY COMPLETE: preview menu $($menu.id) updated. Production main-menu was excluded. Run Verify with fresh evidence."
  return
}

Assert-Gate ($Mode -eq 'Rollback') 'Unsupported mode'
Assert-Gate ([string]::IsNullOrWhiteSpace($AuthorizationValue)) 'Rollback rejects Apply authorization values'
Assert-Gate ($ConfirmMenuMutation.IsPresent) 'Rollback requires -ConfirmMenuMutation'
Assert-Gate ($RollbackAuthorizationValue -eq $transition.rollback.futureAuthorizationValue) 'Rollback authorization does not match the exact rollback binding'
Assert-LiveEvidence 'proposed' | Out-Null
$menu = Invoke-MenuMutation $transition $rollbackVariables
Write-Output "ROLLBACK COMPLETE: exact predecessor restored to preview menu $($menu.id). Production main-menu was excluded."
