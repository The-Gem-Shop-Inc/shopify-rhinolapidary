[CmdletBinding()]
param(
  [ValidateSet('Plan', 'Apply', 'VerifyExistingDeployment')]
  [string]$Mode = 'Plan',
  [string]$AuthorizationValue = '',
  [switch]$ApproveThemeCheckException,
  [string]$RollbackArchive = 'C:\Users\dajem\AppData\Local\RhinoLapidary\rollback\shop-79279947973\theme-158631198917\2026-11-16T18-31-49.6370986Z',
  [string]$LiveEvidencePath = '',
  [string]$ExistingReadbackRoot = '',
  [string]$PreUploadInventoryPath = 'C:\Users\dajem\AppData\Local\RhinoLapidary\deployment-evidence\shop-79279947973\theme-158631198917\2026-11-16T22-39-36.2351367Z\pre-upload-inventory.json',
  [string]$FailureRecordPath = 'C:\Users\dajem\AppData\Local\RhinoLapidary\deployment-evidence\shop-79279947973\theme-158631198917\2026-11-16T22-39-36.2351367Z\phase-b-failure.json',
  [int]$MaxLiveEvidenceAgeMinutes = 15
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ManifestPath = Join-Path $RepositoryRoot 'data\j2-g4-preview-deployment-manifest.json'
$ExceptionPath = Join-Path $RepositoryRoot 'data\j2-g4-preview-theme-check-exception.json'
$ExpectedBranch = 'integration/catalog-cart-preview'
$IntegrationCommit = '64ddfaadbcea98175940fd54d9cf198c443e39c3'
$ShopGid = 'gid://shopify/Shop/79279947973'
$Store = 'sz5dnk-nf.myshopify.com'
$PreviewThemeGid = 'gid://shopify/OnlineStoreTheme/158631198917'
$PreviewThemeId = '158631198917'
$PreviewThemeName = 'Rhino Lapidary - Preview'
$ProductionThemeId = '158579622085'
$AuthorizedQuote = "The email alternative uses Shopify's contact form and security check. It does not create a Draft Order. Use it deliberately when automated submission is unavailable or cannot preserve the cart's purchasing terms."

function Assert-Gate([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw "STOP: $Message" }
}

function Get-Sha256([string]$Path) {
  (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-TextSha256([string]$Text) {
  $bytes = [Text.Encoding]::UTF8.GetBytes($Text)
  [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
}

function Invoke-NativeChecked([string]$File, [string[]]$Arguments) {
  $output = & $File @Arguments 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) { throw "STOP: $File $($Arguments -join ' ') failed ($LASTEXITCODE).`n$output" }
  $output.Trim()
}

function Get-ThemeFileMap([string]$Root) {
  $map = @{}
  foreach ($file in Get-ChildItem -LiteralPath $Root -Recurse -File) {
    $relative = [IO.Path]::GetRelativePath($Root, $file.FullName).Replace('\', '/')
    $map[$relative] = Get-Sha256 $file.FullName
  }
  $map
}

function Remove-SafePlanTemp([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $resolved = (Resolve-Path -LiteralPath $Path).Path
  $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
  Assert-Gate ($resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) "Refusing to remove a non-temporary path: $resolved"
  Assert-Gate ((Split-Path -Leaf $resolved).StartsWith('rhino-j2-g4-', [StringComparison]::OrdinalIgnoreCase)) "Unexpected temporary directory name: $resolved"
  Remove-Item -LiteralPath $resolved -Recurse -Force
}

function Read-Json([string]$Path) {
  Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json -Depth 100
}

Push-Location $RepositoryRoot
$planTemp = $null
try {
  Assert-Gate ((Get-Location).Path -eq 'C:\rlcc') "Repository path must be C:\rlcc"
  Assert-Gate ((git branch --show-current) -eq $ExpectedBranch) "Wrong Git branch"
  $head = git rev-parse HEAD
  git merge-base --is-ancestor $IntegrationCommit HEAD
  Assert-Gate ($LASTEXITCODE -eq 0) "Immutable integration commit is not an ancestor of HEAD"
  Assert-Gate (@(git diff --cached --name-only).Count -eq 0) "Staged changes are not permitted"

  Invoke-NativeChecked 'node' @('scripts/validate-j2-g4-catalog-cart-integration.js') | Out-Null

  $manifest = Read-Json $ManifestPath
  Assert-Gate ($manifest.schemaVersion -eq 2) "Unexpected manifest schema"
  Assert-Gate ($manifest.source.originalIntegrationCommit -eq $IntegrationCommit) "Manifest provenance anchor mismatch"
  Assert-Gate ($manifest.themeFiles.Count -eq 17) "Manifest must contain exactly 17 files"
  Assert-Gate (($manifest.themeFiles.path | Select-Object -Unique).Count -eq 17) "Manifest contains duplicate paths"
  Assert-Gate ($manifest.unchangedRuntimeDependencies.Count -eq 5) "Manifest must contain five unchanged dependencies"

  $digestRows = @()
  foreach ($record in $manifest.themeFiles) {
    $candidate = Join-Path $RepositoryRoot ($record.path.Replace('/', '\'))
    Assert-Gate (Test-Path -LiteralPath $candidate -PathType Leaf) "$($record.path): candidate missing"
    Assert-Gate ((Get-Sha256 $candidate) -eq $record.sha256) "$($record.path): candidate hash mismatch"
    Assert-Gate ((Get-Item -LiteralPath $candidate).Length -eq $record.size) "$($record.path): candidate size mismatch"
    $digestRows += [ordered]@{ path = $record.path; sha256 = $record.sha256; size = [int64]$record.size }
  }
  $candidateDigest = Get-TextSha256 ($digestRows | ConvertTo-Json -Compress -Depth 5)
  Assert-Gate ($candidateDigest -eq $manifest.deploymentCandidate.digest) "Deployment candidate digest mismatch"

  $exception = Read-Json $ExceptionPath
  Assert-Gate ($exception.status -eq 'PREPARED_REQUIRES_SEPARATE_PRODUCT_OWNER_AUTHORIZATION') "Theme Check exception status changed"
  Assert-Gate ($exception.target.shopGid -eq $ShopGid) "Exception shop mismatch"
  Assert-Gate ($exception.target.themeGid -eq $PreviewThemeGid) "Exception preview theme mismatch"
  Assert-Gate ($exception.candidate.digest -eq $candidateDigest) "Exception candidate digest mismatch"
  Assert-Gate ($exception.candidate.manifestFileSha256 -eq (Get-Sha256 $ManifestPath)) "Exception manifest hash mismatch"
  Assert-Gate ($exception.themeCheck.status -eq 'FAIL_RETAINED_NOT_PASSED') "Theme Check failure status must be retained"
  Assert-Gate ($exception.themeCheck.errors -eq 2100) "Theme Check error count changed"
  Assert-Gate ((Get-Sha256 $exception.themeCheck.completeReportPath) -eq $exception.themeCheck.completeReportSha256) "Complete Theme Check report hash mismatch"
  $scopeInput = "$($exception.deploymentScope.mode)|$($exception.deploymentScope.themeFileCount)|$($exception.candidate.digest)|nodelete=$($exception.deploymentScope.nodeleteRequired.ToString().ToLowerInvariant())|remoteDeletionAllowed=$($exception.deploymentScope.remoteDeletionAllowed.ToString().ToLowerInvariant())|productionThemeAllowed=$($exception.deploymentScope.productionThemeAllowed.ToString().ToLowerInvariant())"
  $scopeDigest = Get-TextSha256 $scopeInput
  Assert-Gate ($scopeDigest -eq $exception.deploymentScope.digest) "Deployment scope digest mismatch"
  Assert-Gate ($exception.deploymentScope.nodeleteRequired -and -not $exception.deploymentScope.remoteDeletionAllowed -and -not $exception.deploymentScope.productionThemeAllowed) "No-delete or production exclusion binding changed"
  $bindingInput = "$($exception.identity)|$($exception.target.shopGid)|$($exception.target.themeGid)|$($exception.candidate.digest)|$($exception.candidate.manifestFileSha256)|$($exception.rollback.inventorySha256)|$($exception.themeCheck.completeReportSha256)|$scopeDigest"
  $bindingDigest = Get-TextSha256 $bindingInput
  Assert-Gate ($bindingDigest -eq $exception.binding.digest) "Theme Check exception binding digest mismatch"
  Assert-Gate ($exception.binding.authorizationValue -eq "J2G4-PREVIEW-APPLY-$bindingDigest") "Apply authorization binding value mismatch"
  Assert-Gate (-not $exception.authorized) "Repository evidence must not pre-authorize Apply mode"

  if ($Mode -eq 'VerifyExistingDeployment') {
    Assert-Gate ([string]::IsNullOrWhiteSpace($AuthorizationValue)) "Verify Existing Deployment rejects Apply authorization values"
    Assert-Gate (-not $ApproveThemeCheckException.IsPresent) "Verify Existing Deployment does not consume the Apply Theme Check exception"
    Assert-Gate (-not [string]::IsNullOrWhiteSpace($LiveEvidencePath)) "Verify Existing Deployment requires fresh external read-only Admin GraphQL evidence"
    $resolvedVerifyEvidence = (Resolve-Path -LiteralPath $LiveEvidencePath).Path
    Assert-Gate (-not $resolvedVerifyEvidence.StartsWith($RepositoryRoot, [StringComparison]::OrdinalIgnoreCase)) "Identity evidence must be external to the Git repository"
    $verifyEvidence = Read-Json $resolvedVerifyEvidence
    $verifyAge = [DateTimeOffset]::UtcNow - [DateTimeOffset]$verifyEvidence.observedAt
    $verifyAllowedAge = [Math]::Min($MaxLiveEvidenceAgeMinutes, 15)
    Assert-Gate ($verifyAge.TotalMinutes -ge 0 -and $verifyAge.TotalMinutes -le $verifyAllowedAge) "Verify Existing Deployment identity evidence is stale"
    Assert-Gate ($verifyEvidence.readOnly -and $verifyEvidence.shopifyMutations -eq 0) "Verify Existing Deployment identity evidence is not read-only"

    $verifyThemeList = Invoke-NativeChecked 'shopify' @('theme', 'list', '--store', $Store, '--json', '--no-input') | ConvertFrom-Json -Depth 20
    $verifyPreview = @($verifyThemeList | Where-Object { [string]$_.id -eq $PreviewThemeId })
    $verifyProduction = @($verifyThemeList | Where-Object { [string]$_.id -eq $ProductionThemeId })
    Assert-Gate ($verifyPreview.Count -eq 1 -and $verifyPreview[0].name -eq $PreviewThemeName -and $verifyPreview[0].role -eq 'unpublished') "CLI preview theme selector mismatch"
    Assert-Gate ($verifyProduction.Count -eq 1 -and $verifyProduction[0].role -eq 'live') "CLI production identity mismatch"

    if ([string]::IsNullOrWhiteSpace($ExistingReadbackRoot)) {
      $planTemp = Join-Path ([IO.Path]::GetTempPath()) ("rhino-j2-g4-{0}" -f [Guid]::NewGuid().ToString('N'))
      New-Item -ItemType Directory -Path $planTemp | Out-Null
      Invoke-NativeChecked 'shopify' @('theme', 'pull', '--store', $Store, '--theme', $PreviewThemeId, '--path', $planTemp, '--nodelete', '--no-input') | Out-Null
      $resolvedReadbackRoot = $planTemp
    } else {
      $resolvedReadbackRoot = (Resolve-Path -LiteralPath $ExistingReadbackRoot).Path
    }

    $successorArguments = @(
      'scripts/validate-j2-g4-theme-readback-successor.js',
      $resolvedReadbackRoot,
      "--identity-evidence=$resolvedVerifyEvidence",
      "--pre-upload-inventory=$((Resolve-Path -LiteralPath $PreUploadInventoryPath).Path)",
      "--rollback-archive=$((Resolve-Path -LiteralPath $RollbackArchive).Path)",
      "--failure-record=$((Resolve-Path -LiteralPath $FailureRecordPath).Path)"
    )
    $successorResult = Invoke-NativeChecked 'node' $successorArguments
    Write-Output 'VERIFY EXISTING DEPLOYMENT PASS (successor contract; proposed policy only)'
    Write-Output $successorResult
    Write-Output 'Historical Phase B result remains FAILED_EXACT_READBACK. No Shopify changes were made.'
    return
  }

  if ([string]::IsNullOrWhiteSpace($LiveEvidencePath)) {
    $liveDirectory = Join-Path $env:LOCALAPPDATA 'RhinoLapidary\evidence\j2-g4-preview\live'
    $latest = Get-ChildItem -LiteralPath $liveDirectory -Filter 'validated-*.json' -File | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    Assert-Gate ($null -ne $latest) "No external validated live evidence snapshot exists"
    $resolvedLiveEvidence = $latest.FullName
  } else {
    $candidateEvidencePath = if ([IO.Path]::IsPathRooted($LiveEvidencePath)) { $LiveEvidencePath } else { Join-Path $RepositoryRoot $LiveEvidencePath }
    $resolvedLiveEvidence = (Resolve-Path -LiteralPath $candidateEvidencePath).Path
  }
  Assert-Gate (-not $resolvedLiveEvidence.StartsWith($RepositoryRoot, [StringComparison]::OrdinalIgnoreCase)) "Live evidence must be external to the Git repository"
  $live = Read-Json $resolvedLiveEvidence
  $evidenceAge = [DateTimeOffset]::UtcNow - [DateTimeOffset]$live.observedAt
  $allowedAge = [Math]::Min($MaxLiveEvidenceAgeMinutes, 15)
  Assert-Gate ($evidenceAge.TotalMinutes -ge 0 -and $evidenceAge.TotalMinutes -le $allowedAge) "Live read evidence is stale"
  Assert-Gate ($live.shop.id -eq $ShopGid -and $live.shop.myshopifyDomain -eq $Store) "Live shop identity mismatch"
  Assert-Gate ($live.previewTheme.id -eq $PreviewThemeGid -and $live.previewTheme.role -eq 'UNPUBLISHED') "Live preview identity or role mismatch"
  Assert-Gate ($live.productionTheme.numericId -eq $ProductionThemeId -and $live.productionTheme.role -eq 'MAIN') "Production identity verification mismatch"
  Assert-Gate ($live.publishedLocales.Count -eq 1 -and $live.publishedLocales[0].locale -eq 'en' -and $live.publishedLocales[0].published) "English is no longer the only published locale"
  Assert-Gate ($live.remoteEnglishLocale.quoteExplanation -eq $AuthorizedQuote) "Remote quote explanation changed"

  $themeListJson = Invoke-NativeChecked 'shopify' @('theme', 'list', '--store', $Store, '--json', '--no-input')
  $themeList = $themeListJson | ConvertFrom-Json -Depth 20
  $preview = @($themeList | Where-Object { [string]$_.id -eq $PreviewThemeId })
  $production = @($themeList | Where-Object { [string]$_.id -eq $ProductionThemeId })
  Assert-Gate ($preview.Count -eq 1 -and $preview[0].name -eq $PreviewThemeName -and $preview[0].role -eq 'unpublished') "CLI preview theme selector mismatch"
  Assert-Gate ($production.Count -eq 1 -and $production[0].role -eq 'live') "CLI production identity mismatch"
  Assert-Gate ([string]$preview[0].id -ne [string]$production[0].id) "Preview resolves to production theme"

  Invoke-NativeChecked 'node' @('scripts/validate-j2-g4-rollback-archive.js', $RollbackArchive) | Out-Null
  $rollbackInventoryPath = Join-Path $RollbackArchive 'inventory.json'
  $rollback = Read-Json $rollbackInventoryPath
  Assert-Gate ((Get-Sha256 $rollbackInventoryPath) -eq $exception.rollback.inventorySha256) "Rollback inventory hash mismatch"
  Assert-Gate ($rollback.shop.id -eq $ShopGid -and $rollback.theme.numericId -eq $PreviewThemeId) "Rollback identity mismatch"

  $planTemp = Join-Path ([IO.Path]::GetTempPath()) ("rhino-j2-g4-{0}" -f [Guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $planTemp | Out-Null
  Invoke-NativeChecked 'shopify' @('theme', 'pull', '--store', $Store, '--theme', $PreviewThemeId, '--path', $planTemp, '--nodelete', '--no-input') | Out-Null
  $remoteMap = Get-ThemeFileMap $planTemp

  $existingRecords = @{}; foreach ($record in $rollback.existingFiles) { $existingRecords[$record.path] = $record }
  $absentRecords = @{}; foreach ($record in $rollback.absentFiles) { $absentRecords[$record.path] = $record }
  $additions = 0; $replacements = 0
  foreach ($record in $manifest.themeFiles) {
    if ($existingRecords.ContainsKey($record.path)) {
      Assert-Gate ($remoteMap.ContainsKey($record.path)) "$($record.path): expected remote predecessor is missing"
      Assert-Gate ($remoteMap[$record.path] -eq $existingRecords[$record.path].sha256) "$($record.path): remote predecessor changed after rollback preservation"
      $replacements += 1
    } elseif ($absentRecords.ContainsKey($record.path)) {
      Assert-Gate (-not $remoteMap.ContainsKey($record.path)) "$($record.path): expected addition now exists remotely"
      $additions += 1
    } else {
      throw "STOP: $($record.path) is not represented by the rollback archive"
    }
  }
  Assert-Gate ($replacements -eq 10 -and $additions -eq 7) "Remote classification is not ten replacements and seven additions"

  foreach ($dependency in $manifest.unchangedRuntimeDependencies) {
    Assert-Gate ($remoteMap.ContainsKey($dependency.path)) "$($dependency.path): remote dependency missing"
    Assert-Gate ($remoteMap[$dependency.path] -eq $dependency.sha256) "$($dependency.path): remote dependency hash mismatch"
  }
  $remoteLocale = Join-Path $planTemp 'locales\en.default.json'
  Invoke-NativeChecked 'node' @('scripts/validate-j2-g4-locale-reconciliation.js', $remoteLocale) | Out-Null

  $uploadArgs = @('theme', 'push', '--store', $Store, '--theme', $PreviewThemeId, '--path', $RepositoryRoot)
  foreach ($record in $manifest.themeFiles) { $uploadArgs += @('--only', $record.path) }
  $uploadArgs += @('--nodelete', '--json', '--no-input')
  foreach ($forbidden in @('--allow-live', '--live', '--publish', '--unpublished', '--strict')) {
    Assert-Gate (-not ($uploadArgs -contains $forbidden)) "Forbidden upload flag present: $forbidden"
  }

  $printableCommand = 'shopify ' + (($uploadArgs | ForEach-Object { if ($_ -match '\s') { '"' + $_ + '"' } else { $_ } }) -join ' ')
  Write-Output "PLAN PASS"
  Write-Output "Branch: $ExpectedBranch"
  Write-Output "HEAD: $head"
  Write-Output "Candidate digest: $candidateDigest"
  Write-Output "Target: $PreviewThemeGid ($PreviewThemeName / UNPUBLISHED)"
  Write-Output "Remote transaction: $replacements replacements, $additions additions, 0 deletions"
  Write-Output "Unchanged dependencies: 5/5"
  Write-Output "Theme Check: FAIL retained (2100 MatchingTranslations errors); --strict omission is exception-bound and not yet authorized"
  Write-Output "Proposed upload: $printableCommand"

  if ($Mode -eq 'Plan') {
    Write-Output 'No Shopify changes were made.'
    return
  }

  Assert-Gate ($AuthorizationValue -eq $exception.binding.authorizationValue) "Apply authorization value does not match the exact bound candidate"
  Assert-Gate ($ApproveThemeCheckException.IsPresent) "Apply requires explicit approval of the exact Theme Check exception"
  Assert-Gate ($preview[0].role -ne 'live' -and [string]$preview[0].id -ne $ProductionThemeId) "Apply refuses a MAIN theme"

  $evidenceRoot = Join-Path $env:LOCALAPPDATA ("RhinoLapidary\deployment-evidence\shop-79279947973\theme-158631198917\{0}" -f [DateTimeOffset]::UtcNow.ToString('yyyy-MM-ddTHH-mm-ss.fffffffZ'))
  New-Item -ItemType Directory -Path $evidenceRoot -Force | Out-Null
  $preInventoryPath = Join-Path $evidenceRoot 'pre-upload-inventory.json'
  $remoteMap.GetEnumerator() | Sort-Object Name | ForEach-Object { [ordered]@{ path = $_.Name; sha256 = $_.Value } } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $preInventoryPath -Encoding utf8NoBOM

  $uploadOutput = Invoke-NativeChecked 'shopify' $uploadArgs
  Set-Content -LiteralPath (Join-Path $evidenceRoot 'shopify-theme-push.json') -Value $uploadOutput -Encoding utf8NoBOM

  $postRoot = Join-Path $evidenceRoot 'post-upload-theme'
  New-Item -ItemType Directory -Path $postRoot | Out-Null
  Invoke-NativeChecked 'shopify' @('theme', 'pull', '--store', $Store, '--theme', $PreviewThemeId, '--path', $postRoot, '--nodelete', '--no-input') | Out-Null
  Invoke-NativeChecked 'node' @('scripts/validate-j2-g4-theme-readback.js', $postRoot) | Out-Null
  $postMap = Get-ThemeFileMap $postRoot
  $candidatePaths = @($manifest.themeFiles.path)
  foreach ($path in $remoteMap.Keys) {
    if ($candidatePaths -contains $path) { continue }
    Assert-Gate ($postMap.ContainsKey($path) -and $postMap[$path] -eq $remoteMap[$path]) "${path}: unrelated remote asset changed"
  }
  foreach ($path in $postMap.Keys) {
    Assert-Gate (($candidatePaths -contains $path) -or $remoteMap.ContainsKey($path)) "${path}: unexpected unrelated remote asset appeared"
  }

  $afterListJson = Invoke-NativeChecked 'shopify' @('theme', 'list', '--store', $Store, '--json', '--no-input')
  $afterList = $afterListJson | ConvertFrom-Json -Depth 20
  $afterPreview = @($afterList | Where-Object { [string]$_.id -eq $PreviewThemeId })
  Assert-Gate ($afterPreview.Count -eq 1 -and $afterPreview[0].role -eq 'unpublished') "Theme identity or role changed after upload"

  [ordered]@{
    completedAt = [DateTimeOffset]::UtcNow.ToString('o')
    shopGid = $ShopGid
    themeGid = $PreviewThemeGid
    candidateDigest = $candidateDigest
    uploadedFilesVerified = 17
    unchangedDependenciesVerified = 5
    unrelatedRemoteAssetsUnchanged = $true
    published = $false
    menuMutated = $false
  } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $evidenceRoot 'verification.json') -Encoding utf8NoBOM
  Write-Output "APPLY AND READBACK PASS: $evidenceRoot"
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
  Write-Output $_.ScriptStackTrace
  Write-Output "Controlled rollback option only: restore the ten exact archived bodies and delete only the seven proven-absent paths after separate rollback authorization, then independently read back SHA-256/absence. Archive: $RollbackArchive"
  exit 1
} finally {
  if (($Mode -eq 'Plan' -or $Mode -eq 'VerifyExistingDeployment') -and $planTemp) { Remove-SafePlanTemp $planTemp }
  Pop-Location
}
