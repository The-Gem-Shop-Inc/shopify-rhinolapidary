[CmdletBinding()]
param(
  [ValidateSet('CaptureRollback', 'Plan', 'Apply', 'Readback')]
  [string]$Mode = 'Plan',
  [string]$AuthorizationValue = '',
  [switch]$AuthorizeStrictOmission,
  [string]$RollbackArchive = 'C:\Users\dajem\AppData\Local\RhinoLapidary\rollback\shop-79279947973\theme-158631198917\2026-11-17T22-21-52.8675553Z',
  [string]$LiveEvidencePath = '',
  [string]$ReadbackRoot = '',
  [int]$MaxLiveEvidenceAgeMinutes = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ManifestPath = Join-Path $RepositoryRoot 'data\j2-g4-phase-c-corrective-manifest.json'
$PhaseBManifestPath = Join-Path $RepositoryRoot 'data\j2-g4-preview-deployment-manifest.json'
$ExpectedBranch = 'integration/catalog-cart-preview'
$IntegrationCommit = '64ddfaadbcea98175940fd54d9cf198c443e39c3'
$Store = 'sz5dnk-nf.myshopify.com'
$ShopGid = 'gid://shopify/Shop/79279947973'
$PreviewThemeId = '158631198917'
$PreviewThemeGid = 'gid://shopify/OnlineStoreTheme/158631198917'
$PreviewThemeName = 'Rhino Lapidary - Preview'
$ProductionThemeId = '158579622085'
$ProductionThemeGid = 'gid://shopify/OnlineStoreTheme/158579622085'
$HistoricalPhaseBCandidate = 'c59f3d8ea6a9c4d62cf477e698ef341845066715b2a1007069c5402d745500ec'
$HistoricalPhaseBAuthorization = 'J2G4-PREVIEW-APPLY-652f19f217978fbaa62c383e468c5d936b94523b9d85f325e807aa64894a3a0c'
$ThemeCheckReportPath = 'C:\Users\dajem\AppData\Local\RhinoLapidary\evidence\j2-g4-preview\2026-11-16-locale-reconciliation\theme-check-2100-errors.json'
$ThemeCheckReportSha256 = 'a45c2c0da3ede5dff2f248c37743e5f19faa0814c94f552a5992c61743ec3785'
$HistoricalRollbackArchive = 'C:\Users\dajem\AppData\Local\RhinoLapidary\rollback\shop-79279947973\theme-158631198917\2026-11-16T18-31-49.6370986Z'
$ExpectedRuntimePaths = @(
  'assets/component-card.css',
  'assets/component-facets.css',
  'assets/component-menu-drawer.css',
  'assets/rhino-quote-mode.js',
  'snippets/card-product.liquid',
  'snippets/rhino-quote-checkout.liquid',
  'snippets/rhino-product-card-media-eligibility.liquid'
)
$AuthorizedSemanticJsonPaths = @(
  'locales/en.default.json',
  'templates/collection.directory.json',
  'templates/collection.json'
)

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

function Read-Json([string]$Path) {
  Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json -Depth 100
}

function Write-Json([string]$Path, [object]$Value) {
  $parent = Split-Path -Parent $Path
  if ($parent) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  $Value | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $Path -Encoding utf8NoBOM
}

function Invoke-NativeChecked([string]$File, [string[]]$Arguments) {
  $output = & $File @Arguments 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) { throw "STOP: $File $($Arguments -join ' ') failed ($LASTEXITCODE).`n$output" }
  $output.Trim()
}

function Get-ThemeRecords([string]$Root) {
  $records = foreach ($file in Get-ChildItem -LiteralPath $Root -Recurse -File) {
    $relative = [IO.Path]::GetRelativePath($Root, $file.FullName).Replace('\', '/')
    [ordered]@{ path = $relative; sha256 = Get-Sha256 $file.FullName; size = [int64]$file.Length }
  }
  @($records | Sort-Object path)
}

function Get-RecordMap([object[]]$Records) {
  $map = @{}
  foreach ($record in $Records) {
    Assert-Gate (-not $map.ContainsKey($record.path)) "Duplicate inventory path: $($record.path)"
    $map[$record.path] = $record
  }
  $map
}

function Get-InventoryDigest([object[]]$Records) {
  $rows = foreach ($record in $Records) { "$($record.path)`0$($record.sha256)`0$($record.size)`n" }
  Get-TextSha256 ($rows -join '')
}

function New-SafeTemp {
  $path = Join-Path ([IO.Path]::GetTempPath()) ("rhino-j2-g4-phase-c-{0}" -f [Guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $path | Out-Null
  $path
}

function Remove-SafeTemp([string]$Path) {
  if (-not $Path -or -not (Test-Path -LiteralPath $Path)) { return }
  $resolved = (Resolve-Path -LiteralPath $Path).Path
  $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
  Assert-Gate ($resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) "Refusing to remove non-temporary path: $resolved"
  Assert-Gate ((Split-Path -Leaf $resolved).StartsWith('rhino-j2-g4-phase-c-', [StringComparison]::OrdinalIgnoreCase)) "Unexpected temporary directory: $resolved"
  Remove-Item -LiteralPath $resolved -Recurse -Force
}

function Get-LiveEvidence {
  Assert-Gate (-not [string]::IsNullOrWhiteSpace($LiveEvidencePath)) 'Fresh external read-only identity evidence is required'
  $resolved = (Resolve-Path -LiteralPath $LiveEvidencePath).Path
  Assert-Gate (-not $resolved.StartsWith($RepositoryRoot, [StringComparison]::OrdinalIgnoreCase)) 'Identity evidence must remain outside Git'
  $evidence = Read-Json $resolved
  $age = [DateTimeOffset]::UtcNow - [DateTimeOffset]$evidence.observedAt
  Assert-Gate ($age.TotalMinutes -ge 0 -and $age.TotalMinutes -le $MaxLiveEvidenceAgeMinutes) 'Identity evidence is stale'
  Assert-Gate ($evidence.readOnly -and $evidence.shopifyMutations -eq 0) 'Identity evidence is not read-only'
  Assert-Gate ($evidence.shop.id -eq $ShopGid -and $evidence.shop.myshopifyDomain -eq $Store) 'Shop identity mismatch'
  Assert-Gate ($evidence.previewTheme.id -eq $PreviewThemeGid -and $evidence.previewTheme.role -eq 'UNPUBLISHED') 'Preview identity or role mismatch'
  Assert-Gate ($evidence.productionTheme.id -eq $ProductionThemeGid -and $evidence.productionTheme.role -eq 'MAIN') 'Production identity or role mismatch'
  Assert-Gate ($evidence.publishedLocales.Count -eq 1 -and $evidence.publishedLocales[0].locale -eq 'en' -and $evidence.publishedLocales[0].published) 'English is not the only published locale'
  $evidence
}

function Assert-LiveThemeSelectors {
  $themes = Invoke-NativeChecked 'shopify' @('theme', 'list', '--store', $Store, '--json', '--no-input') | ConvertFrom-Json -Depth 20
  $preview = @($themes | Where-Object { [string]$_.id -eq $PreviewThemeId })
  $production = @($themes | Where-Object { [string]$_.id -eq $ProductionThemeId })
  Assert-Gate ($preview.Count -eq 1 -and $preview[0].name -eq $PreviewThemeName -and $preview[0].role -eq 'unpublished') 'CLI preview selector mismatch'
  Assert-Gate ($production.Count -eq 1 -and $production[0].role -eq 'live') 'CLI production selector mismatch'
  Assert-Gate ([string]$preview[0].id -ne [string]$production[0].id) 'Preview resolves to production'
}

function Get-VerifiedCandidate {
  $manifest = Read-Json $ManifestPath
  Assert-Gate ($manifest.releaseId -eq 'J2-G4-PHASE-C-CORRECTIVE-RC1') 'Corrective release identity mismatch'
  Assert-Gate ($manifest.historicalEvidence.phaseBTransport -eq 'FAILED_EXACT_READBACK') 'Historical Phase B failure was reclassified'
  Assert-Gate ($manifest.historicalEvidence.successorIntegrity -eq 'PASS_SUCCESSOR_SEMANTIC_READBACK') 'Successor integrity history changed'
  Assert-Gate ($manifest.historicalEvidence.phaseBCandidateDigest -eq $HistoricalPhaseBCandidate) 'Phase B candidate digest changed'
  Assert-Gate (-not $manifest.authorization.uploadAuthorized -and -not $manifest.authorization.phaseBApplyTokenReusable) 'Manifest improperly authorizes Apply or Phase B token reuse'
  Assert-Gate ($manifest.runtimeFiles.Count -eq 7) 'Corrective manifest must contain seven runtime files'
  $paths = @($manifest.runtimeFiles.path | Sort-Object)
  Assert-Gate (($paths -join "`n") -eq (($ExpectedRuntimePaths | Sort-Object) -join "`n")) 'Corrective runtime path scope changed'
  Assert-Gate (@($manifest.runtimeFiles | Where-Object operation -eq 'MODIFY').Count -eq 6) 'Corrective release must contain six replacements'
  Assert-Gate (@($manifest.runtimeFiles | Where-Object operation -eq 'ADD').Count -eq 1) 'Corrective release must contain one addition'
  Assert-Gate ($manifest.newDependencies.Count -eq 1 -and $manifest.newDependencies[0] -eq 'snippets/rhino-product-card-media-eligibility.liquid') 'New dependency scope changed'
  Invoke-NativeChecked 'node' @('scripts/validate-j2-g4-phase-c-corrective-release.js') | Out-Null
  $manifestSha = Get-Sha256 $ManifestPath
  Assert-Gate ($manifestSha -eq '718790ba49f8078ab1d2e3401cf4832923ac2182b5312720356bb4d23f1cbe1c') 'Corrective manifest SHA-256 changed'
  [pscustomobject]@{ manifest = $manifest; manifestSha256 = $manifestSha; candidateDigest = $manifest.candidateDigest }
}

function Assert-RepositoryCommit([object]$Candidate) {
  Assert-Gate ((Get-Location).Path -eq 'C:\rlcc') 'Repository path must be C:\rlcc'
  Assert-Gate ((git branch --show-current) -eq $ExpectedBranch) 'Wrong Git branch'
  git merge-base --is-ancestor $IntegrationCommit HEAD
  Assert-Gate ($LASTEXITCODE -eq 0) 'Immutable integration commit is not an ancestor'
  Assert-Gate (@(git status --porcelain=v1).Count -eq 0) 'Plan/Apply/Readback requires a clean committed candidate'
  $head = git rev-parse HEAD
  Assert-Gate (-not [string]::IsNullOrWhiteSpace($head)) 'Committed candidate HEAD is unavailable'
  Assert-Gate ($Candidate.manifest.repository.baseHead -ne $head) 'Corrective release must be a distinct commit from the Phase B base'
  $head
}

function Assert-RollbackArchive([object]$Candidate) {
  $resolved = (Resolve-Path -LiteralPath $RollbackArchive).Path
  Assert-Gate (-not $resolved.StartsWith($RepositoryRoot, [StringComparison]::OrdinalIgnoreCase)) 'Rollback archive must remain outside Git'
  Assert-Gate ($resolved -ne $HistoricalRollbackArchive) 'Phase C cannot reuse the historical Phase B rollback archive'
  $inventoryPath = Join-Path $resolved 'inventory.json'
  Assert-Gate (Test-Path -LiteralPath $inventoryPath -PathType Leaf) 'Phase C rollback inventory is missing'
  $inventory = Read-Json $inventoryPath
  Assert-Gate ($inventory.archiveKind -eq 'J2_G4_PHASE_C_CURRENT_PREVIEW_ROLLBACK') 'Rollback archive identity mismatch'
  Assert-Gate ($inventory.readOnly -and $inventory.shopifyMutations -eq 0) 'Rollback evidence is not read-only'
  Assert-Gate ($inventory.shop.id -eq $ShopGid -and $inventory.theme.id -eq $PreviewThemeGid -and $inventory.theme.role -eq 'UNPUBLISHED') 'Rollback target identity mismatch'
  Assert-Gate ($inventory.productionTheme.id -eq $ProductionThemeGid -and $inventory.productionTheme.role -eq 'MAIN') 'Rollback production identity mismatch'
  Assert-Gate ($inventory.completeTheme.fileCount -eq 463) 'Rollback archive must contain all 463 current theme files'
  $themeRoot = Join-Path $resolved 'theme'
  $records = Get-ThemeRecords $themeRoot
  Assert-Gate ($records.Count -eq 463) 'Rollback theme body count changed'
  Assert-Gate ((Get-InventoryDigest $records) -eq $inventory.completeTheme.digest) 'Rollback complete-theme digest mismatch'
  $storedMap = Get-RecordMap @($inventory.completeTheme.files)
  foreach ($record in $records) {
    Assert-Gate ($storedMap.ContainsKey($record.path)) "$($record.path): missing rollback inventory entry"
    Assert-Gate ($storedMap[$record.path].sha256 -eq $record.sha256 -and $storedMap[$record.path].size -eq $record.size) "$($record.path): rollback body mismatch"
  }
  Assert-Gate ($inventory.correctiveScope.replacements.Count -eq 6 -and $inventory.correctiveScope.additions.Count -eq 1) 'Rollback corrective scope mismatch'
  foreach ($record in $Candidate.manifest.runtimeFiles) {
    if ($record.operation -eq 'MODIFY') {
      $saved = @($inventory.correctiveScope.replacements | Where-Object path -eq $record.path)
      Assert-Gate ($saved.Count -eq 1 -and $saved[0].sha256 -eq $record.deployedSha256 -and $saved[0].size -eq $record.deployedBytes) "$($record.path): rollback predecessor mismatch"
    } else {
      $saved = @($inventory.correctiveScope.additions | Where-Object path -eq $record.path)
      Assert-Gate ($saved.Count -eq 1 -and $saved[0].status -eq 'ABSENT') "$($record.path): rollback absence marker mismatch"
      Assert-Gate (-not (Test-Path -LiteralPath (Join-Path $themeRoot ($record.path.Replace('/', '\'))))) "$($record.path): expected addition already exists in rollback theme"
    }
  }
  [pscustomobject]@{ root = $resolved; inventory = $inventory; inventoryPath = $inventoryPath; inventorySha256 = Get-Sha256 $inventoryPath; records = $records }
}

function Assert-RemoteMatchesRollback([object]$Rollback, [object]$Candidate, [string]$RemoteRoot) {
  $remoteRecords = Get-ThemeRecords $RemoteRoot
  Assert-Gate ($remoteRecords.Count -eq 463) 'Current remote inventory is not 463 files'
  $remoteMap = Get-RecordMap $remoteRecords
  $rollbackMap = Get-RecordMap @($Rollback.inventory.completeTheme.files)
  Assert-Gate (($remoteMap.Keys | Sort-Object) -join "`n" -eq (($rollbackMap.Keys | Sort-Object) -join "`n")) 'Current remote inventory path set differs from fresh rollback baseline'
  foreach ($path in $rollbackMap.Keys) {
    Assert-Gate ($remoteMap[$path].sha256 -eq $rollbackMap[$path].sha256 -and $remoteMap[$path].size -eq $rollbackMap[$path].size) "${path}: current remote predecessor drift"
  }
  foreach ($record in $Candidate.manifest.runtimeFiles) {
    if ($record.operation -eq 'MODIFY') {
      Assert-Gate ($remoteMap.ContainsKey($record.path) -and $remoteMap[$record.path].sha256 -eq $record.deployedSha256) "$($record.path): replacement predecessor mismatch"
    } else {
      Assert-Gate (-not $remoteMap.ContainsKey($record.path)) "$($record.path): expected addition already exists remotely"
    }
  }
  $phaseB = Read-Json $PhaseBManifestPath
  foreach ($dependency in $phaseB.unchangedRuntimeDependencies) {
    Assert-Gate ($remoteMap.ContainsKey($dependency.path) -and $remoteMap[$dependency.path].sha256 -eq $dependency.sha256) "$($dependency.path): unchanged dependency drift"
  }
  $remoteRecords
}

function Get-Transaction([object]$Candidate, [object]$Rollback, [string]$Head) {
  Assert-Gate ((Get-Sha256 $ThemeCheckReportPath) -eq $ThemeCheckReportSha256) 'Retained Theme Check report changed'
  $scopeInput = "$ShopGid|$PreviewThemeGid|$Head|$($Candidate.candidateDigest)|$($Candidate.manifestSha256)|$($Rollback.inventorySha256)|paths=7|nodelete=true|production=false|strictOmitted=true|$ThemeCheckReportSha256"
  $scopeDigest = Get-TextSha256 $scopeInput
  $bindingInput = "J2_G4_PHASE_C_PREVIEW_APPLY_V1|$scopeDigest"
  $bindingDigest = Get-TextSha256 $bindingInput
  $authorization = "J2G4-PHASE-C-PREVIEW-APPLY-$bindingDigest"
  Assert-Gate ($authorization -ne $HistoricalPhaseBAuthorization) 'Phase C authorization collided with the consumed Phase B value'
  $arguments = @('theme', 'push', '--store', $Store, '--theme', $PreviewThemeId, '--path', $RepositoryRoot)
  foreach ($path in $ExpectedRuntimePaths) { $arguments += @('--only', $path) }
  $arguments += @('--nodelete', '--json', '--no-input')
  foreach ($forbidden in @('--allow-live', '--live', '--publish', '--unpublished', '--strict')) {
    Assert-Gate (-not ($arguments -contains $forbidden)) "Forbidden upload flag present: $forbidden"
  }
  $printable = 'shopify ' + (($arguments | ForEach-Object { if ($_ -match '\s') { '"' + $_ + '"' } else { $_ } }) -join ' ')
  [pscustomobject]@{ scopeDigest = $scopeDigest; bindingDigest = $bindingDigest; authorizationValue = $authorization; arguments = $arguments; command = $printable }
}

function Capture-Rollback([object]$Candidate, [object]$LiveEvidence) {
  Assert-LiveThemeSelectors
  $resolved = (Resolve-Path -LiteralPath $RollbackArchive).Path
  Assert-Gate (-not $resolved.StartsWith($RepositoryRoot, [StringComparison]::OrdinalIgnoreCase)) 'Rollback archive must remain outside Git'
  Assert-Gate ($resolved -ne $HistoricalRollbackArchive) 'Historical rollback archive cannot be overwritten'
  $themeRoot = Join-Path $resolved 'theme'
  Assert-Gate (Test-Path -LiteralPath $themeRoot -PathType Container) 'Complete pulled theme is missing from rollback archive'
  $records = Get-ThemeRecords $themeRoot
  Assert-Gate ($records.Count -eq 463) 'Fresh rollback pull must contain exactly 463 current files'
  $map = Get-RecordMap $records
  $replacements = @()
  $additions = @()
  foreach ($record in $Candidate.manifest.runtimeFiles) {
    if ($record.operation -eq 'MODIFY') {
      Assert-Gate ($map.ContainsKey($record.path)) "$($record.path): rollback predecessor missing"
      Assert-Gate ($map[$record.path].sha256 -eq $record.deployedSha256 -and $map[$record.path].size -eq $record.deployedBytes) "$($record.path): rollback predecessor differs from corrective manifest"
      $replacements += [ordered]@{ path = $record.path; sha256 = $map[$record.path].sha256; size = [int64]$map[$record.path].size }
    } else {
      Assert-Gate (-not $map.ContainsKey($record.path)) "$($record.path): expected new snippet already exists"
      $markerRelative = 'absence-markers/' + ($record.path -replace '[^A-Za-z0-9._-]', '_') + '.json'
      $marker = [ordered]@{ shopId = $ShopGid; themeId = $PreviewThemeGid; path = $record.path; status = 'ABSENT'; observedAt = $LiveEvidence.observedAt }
      Write-Json (Join-Path $resolved ($markerRelative.Replace('/', '\'))) $marker
      $additions += [ordered]@{ path = $record.path; status = 'ABSENT'; marker = $markerRelative }
    }
  }
  $phaseB = Read-Json $PhaseBManifestPath
  foreach ($dependency in $phaseB.unchangedRuntimeDependencies) {
    Assert-Gate ($map.ContainsKey($dependency.path) -and $map[$dependency.path].sha256 -eq $dependency.sha256) "$($dependency.path): rollback dependency mismatch"
  }
  $inventory = [ordered]@{
    schemaVersion = 1
    archiveKind = 'J2_G4_PHASE_C_CURRENT_PREVIEW_ROLLBACK'
    capturedAt = [DateTimeOffset]::UtcNow.ToString('o')
    observedAt = $LiveEvidence.observedAt
    readOnly = $true
    shopifyMutations = 0
    shop = $LiveEvidence.shop
    theme = $LiveEvidence.previewTheme
    productionTheme = $LiveEvidence.productionTheme
    publishedLocales = $LiveEvidence.publishedLocales
    completeTheme = [ordered]@{ fileCount = $records.Count; digestAlgorithm = 'SHA-256(path + NUL + sha256 + NUL + size + LF), sorted by path'; digest = Get-InventoryDigest $records; files = $records }
    correctiveScope = [ordered]@{ replacements = $replacements; additions = $additions; restoreSemantics = 'Restore exactly six saved bodies and remove only the one addition after separate authorization.' }
    dependencies = $phaseB.unchangedRuntimeDependencies
    historicalRollbackArchive = $HistoricalRollbackArchive
    historicalRollbackModified = $false
    productionExcluded = $true
  }
  $inventoryPath = Join-Path $resolved 'inventory.json'
  Write-Json $inventoryPath $inventory
  Write-Output "ROLLBACK CAPTURE PASS"
  Write-Output "Archive: $resolved"
  Write-Output "Files: $($records.Count); replacements: 6; absence markers: 1"
  Write-Output "Complete inventory digest: $($inventory.completeTheme.digest)"
  Write-Output "Inventory SHA-256: $(Get-Sha256 $inventoryPath)"
  Write-Output 'No Shopify changes were made.'
}

function Invoke-Readback([object]$Candidate, [object]$Rollback, [string]$Root) {
  $temp = $null
  try {
    if ([string]::IsNullOrWhiteSpace($Root)) {
      $temp = New-SafeTemp
      Invoke-NativeChecked 'shopify' @('theme', 'pull', '--store', $Store, '--theme', $PreviewThemeId, '--path', $temp, '--no-input', '--no-color') | Out-Null
      $resolved = $temp
    } else {
      $resolved = (Resolve-Path -LiteralPath $Root).Path
    }
    $records = Get-ThemeRecords $resolved
    $map = Get-RecordMap $records
    $candidatePaths = @($Candidate.manifest.runtimeFiles.path)
    foreach ($record in $Candidate.manifest.runtimeFiles) {
      Assert-Gate ($map.ContainsKey($record.path)) "$($record.path): post-upload readback missing"
      Assert-Gate ($map[$record.path].sha256 -eq $record.candidateSha256 -and $map[$record.path].size -eq $record.candidateBytes) "$($record.path): exact Phase C readback mismatch"
    }
    $baseline = Get-RecordMap @($Rollback.inventory.completeTheme.files)
    foreach ($path in $baseline.Keys) {
      if ($candidatePaths -contains $path) { continue }
      Assert-Gate ($map.ContainsKey($path)) "${path}: unrelated remote file deleted"
      Assert-Gate ($map[$path].sha256 -eq $baseline[$path].sha256 -and $map[$path].size -eq $baseline[$path].size) "${path}: unrelated remote file changed"
    }
    foreach ($path in $map.Keys) {
      Assert-Gate (($candidatePaths -contains $path) -or $baseline.ContainsKey($path)) "${path}: unexpected remote file appeared"
    }
    foreach ($jsonPath in $AuthorizedSemanticJsonPaths) {
      Assert-Gate ($map[$jsonPath].sha256 -eq $baseline[$jsonPath].sha256) "${jsonPath}: unrelated Shopify JSON changed; semantic exception is not needed for this non-JSON release and was not broadened"
    }
    Assert-LiveThemeSelectors
    Write-Output 'READBACK PASS: 7/7 exact Phase C hashes; all unrelated assets exact; 0 deletions; preview remains unpublished.'
    Write-Output 'Historical FAILED_EXACT_READBACK and PASS_SUCCESSOR_SEMANTIC_READBACK remain unchanged. No automatic rollback was executed.'
  } finally {
    Remove-SafeTemp $temp
  }
}

Push-Location $RepositoryRoot
$planTemp = $null
try {
  $candidate = Get-VerifiedCandidate
  $liveEvidence = Get-LiveEvidence

  if ($Mode -eq 'CaptureRollback') {
    Assert-Gate ([string]::IsNullOrWhiteSpace($AuthorizationValue)) 'Rollback capture rejects Apply authorization values'
    Assert-Gate (-not $AuthorizeStrictOmission.IsPresent) 'Rollback capture rejects the Apply strict-omission switch'
    Capture-Rollback $candidate $liveEvidence
    return
  }

  $head = Assert-RepositoryCommit $candidate
  Assert-LiveThemeSelectors
  $rollback = Assert-RollbackArchive $candidate

  if ($Mode -eq 'Readback') {
    Assert-Gate ([string]::IsNullOrWhiteSpace($AuthorizationValue)) 'Readback rejects Apply authorization values'
    Assert-Gate (-not $AuthorizeStrictOmission.IsPresent) 'Readback rejects the Apply strict-omission switch'
    Invoke-Readback $candidate $rollback $ReadbackRoot
    return
  }

  $planTemp = New-SafeTemp
  Invoke-NativeChecked 'shopify' @('theme', 'pull', '--store', $Store, '--theme', $PreviewThemeId, '--path', $planTemp, '--no-input', '--no-color') | Out-Null
  $remoteRecords = Assert-RemoteMatchesRollback $rollback $candidate $planTemp
  $transaction = Get-Transaction $candidate $rollback $head

  $planEvidence = [ordered]@{
    schemaVersion = 1
    identity = 'J2_G4_PHASE_C_SELECTIVE_PREVIEW_PLAN_V1'
    plannedAt = [DateTimeOffset]::UtcNow.ToString('o')
    mode = 'PLAN_ONLY'
    repository = [ordered]@{ branch = $ExpectedBranch; commit = $head; integrationAncestor = $IntegrationCommit; clean = $true }
    target = [ordered]@{ shopGid = $ShopGid; store = $Store; themeGid = $PreviewThemeGid; themeId = $PreviewThemeId; requiredRole = 'UNPUBLISHED'; productionThemeId = $ProductionThemeId; productionExcluded = $true }
    candidate = [ordered]@{ releaseId = $candidate.manifest.releaseId; digest = $candidate.candidateDigest; manifestSha256 = $candidate.manifestSha256; paths = $ExpectedRuntimePaths; replacements = 6; additions = 1; deletions = 0 }
    rollback = [ordered]@{ root = $rollback.root; inventorySha256 = $rollback.inventorySha256; completeThemeDigest = $rollback.inventory.completeTheme.digest; fileCount = $rollback.inventory.completeTheme.fileCount }
    remote = [ordered]@{ fileCount = $remoteRecords.Count; predecessorMatches = 6; additionAbsent = 1; unchangedDependencies = 5; unrelatedFilesPreserved = 457 }
    localization = [ordered]@{ publishedLocales = @('en'); themeCheckStatus = 'FAIL_RETAINED_NOT_PASSED'; matchingTranslationsErrors = 2100; strictOmissionRequiresSeparateAuthorization = $true; reportSha256 = $ThemeCheckReportSha256 }
    authorization = [ordered]@{ bindingDigest = $transaction.bindingDigest; authorizationValue = $transaction.authorizationValue; phaseBAuthorizationRejected = $HistoricalPhaseBAuthorization }
    proposedUpload = $transaction.command
    shopifyMutations = 0
  }
  Write-Json (Join-Path $rollback.root 'phase-c-plan.json') $planEvidence

  Write-Output 'PLAN PASS'
  Write-Output "Commit: $head"
  Write-Output "Candidate digest: $($candidate.candidateDigest)"
  Write-Output "Manifest SHA-256: $($candidate.manifestSha256)"
  Write-Output "Rollback inventory SHA-256: $($rollback.inventorySha256)"
  Write-Output 'Remote transaction: 6 replacements, 1 addition, 0 deletions; 5 dependencies exact; 457 unrelated assets exact.'
  Write-Output 'Theme Check: FAIL retained (2100 MatchingTranslations); Apply additionally requires -AuthorizeStrictOmission.'
  Write-Output "Apply authorization binding: $($transaction.authorizationValue)"
  Write-Output "Proposed upload: $($transaction.command)"

  if ($Mode -eq 'Plan') {
    Assert-Gate ([string]::IsNullOrWhiteSpace($AuthorizationValue)) 'Plan rejects Apply authorization values'
    Assert-Gate (-not $AuthorizeStrictOmission.IsPresent) 'Plan rejects the Apply strict-omission switch'
    Write-Output 'No Shopify changes were made.'
    return
  }

  Assert-Gate ($Mode -eq 'Apply') 'Unknown execution mode'
  Assert-Gate ($AuthorizationValue -eq $transaction.authorizationValue) 'Apply authorization is not bound to this exact Phase C transaction'
  Assert-Gate ($AuthorizationValue -ne $HistoricalPhaseBAuthorization) 'Consumed Phase B authorization is forbidden'
  Assert-Gate ($AuthorizeStrictOmission.IsPresent) 'Apply requires separate authorization to omit --strict for the retained translation errors'
  $pushOutput = Invoke-NativeChecked 'shopify' $transaction.arguments
  $applyEvidence = Join-Path $rollback.root ("phase-c-apply-{0}.json" -f [DateTimeOffset]::UtcNow.ToString('yyyy-MM-ddTHH-mm-ss.fffffffZ'))
  Set-Content -LiteralPath $applyEvidence -Value $pushOutput -Encoding utf8NoBOM
  Invoke-Readback $candidate $rollback ''
  Write-Output "APPLY COMPLETE: evidence $applyEvidence"
} finally {
  Remove-SafeTemp $planTemp
  Pop-Location
}
