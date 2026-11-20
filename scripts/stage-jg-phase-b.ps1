
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Set-Location C:\rlcc

$store = 'sz5dnk-nf.myshopify.com'
$stagingId = '169509912773'
$productionId = '158579622085'
$previewId = '158631198917'

$releaseRoot = Join-Path $env:LOCALAPPDATA `
  'RhinoLapidary\jg-production\20261119T150005'

$productionRoot = Join-Path $releaseRoot 'production-before'
$previewRoot = Join-Path $releaseRoot 'accepted-preview'
$candidateRoot = Join-Path $releaseRoot 'english-v4\candidate'

$manifestFile = Join-Path $releaseRoot `
  'english-v4\jg-production-derived-manifest.json'

$planFile = Join-Path $releaseRoot 'jg-phase-b-locale-plan.json'
$idFile = Join-Path $releaseRoot 'jg-staging-theme-id.txt'

$beforeRoot = Join-Path $releaseRoot 'staging-phase-b-before'
$afterRoot = Join-Path $releaseRoot 'staging-phase-b-readback'
$attemptFile = Join-Path $releaseRoot 'staging-phase-b-attempted.txt'

function Assert-JG($condition, [string]$message) {
    if (-not $condition) {
        throw $message
    }
}

$shopifyDirectory = Split-Path `
  (Get-Command shopify.cmd -ErrorAction Stop).Source -Parent

$shopifyEntry = Join-Path $shopifyDirectory `
  'node_modules\@shopify\cli\bin\run.js'

$nodeExe = (Get-Command node.exe -ErrorAction Stop).Source

function Invoke-JGCLI {
    param(
        [string]$Label,
        [string[]]$CliArguments
    )

    $stdout = Join-Path $releaseRoot "$Label.stdout.txt"
    $stderr = Join-Path $releaseRoot "$Label.stderr.txt"

    $arguments = @("`"$shopifyEntry`"") + @(
    $CliArguments | ForEach-Object {
        if ($_ -match '\s') {
            '"' + $_.Replace('"', '\"') + '"'
        } else {
            $_
        }
    }
    )

    $process = Start-Process `
      -FilePath $nodeExe `
      -ArgumentList $arguments `
      -RedirectStandardOutput $stdout `
      -RedirectStandardError $stderr `
      -NoNewWindow `
      -Wait `
      -PassThru

    if ($process.ExitCode -ne 0) {
        Get-Content $stderr -Tail 30
        throw "$Label failed: exit $($process.ExitCode)"
    }

    Write-Host "PASS: $Label"
    return $stdout
}

# Validate release identity and previous approvals.

Assert-JG (Test-Path $idFile) 'Staging ID record missing'

$recordedId = (Get-Content $idFile -Raw).Trim()

Assert-JG ($recordedId -eq $stagingId) `
  'Staging ID mismatch'

Assert-JG ($stagingId -ne $productionId) `
  'Refusing production theme'

Assert-JG ($stagingId -ne $previewId) `
  'Refusing accepted preview theme'

foreach ($file in @($manifestFile, $planFile, $shopifyEntry)) {
    Assert-JG (Test-Path $file) "Required file missing: $file"
}

foreach ($directory in @(
    $productionRoot,
    $previewRoot,
    $candidateRoot
)) {
    Assert-JG (Test-Path $directory) `
      "Required directory missing: $directory"
}

Assert-JG (-not (Test-Path $attemptFile)) `
  'Phase B already attempted. Inspect remote state before retrying.'

Assert-JG (-not (Test-Path $beforeRoot)) `
  'Phase B preflight directory already exists'

Assert-JG (-not (Test-Path $afterRoot)) `
  'Phase B readback directory already exists'

$manifest = Get-Content $manifestFile -Raw | ConvertFrom-Json
$plan = Get-Content $planFile -Raw | ConvertFrom-Json

$files = @($plan.files)

Assert-JG ($manifest.result -eq 'PASS') `
  'Candidate manifest invalid'

Assert-JG ($manifest.files -eq 407) `
  'Candidate inventory mismatch'

Assert-JG ($plan.stagingThemeId -eq $stagingId) `
  'Deletion plan targets another theme'

Assert-JG ($plan.operation -eq 'DELETE_EXACT_LIST') `
  'Unexpected operation'

Assert-JG ($plan.beforeCount -eq 456) `
  'Wrong expected initial inventory'

Assert-JG ($plan.expectedAfterCount -eq 407) `
  'Wrong expected final inventory'

Assert-JG ($files.Count -eq 49) `
  'Expected exactly 49 deletion targets'

Assert-JG (
@($files | Sort-Object -Unique).Count -eq 49
) 'Duplicate deletion paths'

$manifestFiles = @($manifest.intentionalLocaleRemovals | Sort-Object)
$plannedFiles = @($files | Sort-Object)

Assert-JG (
($manifestFiles -join "`n") -ceq ($plannedFiles -join "`n")
) 'Deletion plan differs from approved V4 manifest'

foreach ($file in $files) {
    Assert-JG (
    $file -cmatch '^locales/[^/]+\.json$'
    ) "Invalid locale path: $file"

    Assert-JG (
    $file -notin @(
        'locales/en.default.json',
        'locales/en.default.schema.json'
    )
    ) "Protected English locale: $file"

    Assert-JG (
    -not (Test-Path (Join-Path $candidateRoot $file))
    ) "Deletion target still exists locally: $file"
}

# Confirm the candidate has not changed.

$verification = & node `
  .\scripts\prepare-jg-production-candidate.js `
  verify $productionRoot $previewRoot $candidateRoot english-only

Assert-JG ($LASTEXITCODE -eq 0) `
  'Candidate verification failed'

$candidateResult = $verification | Out-String | ConvertFrom-Json

Assert-JG (
$candidateResult.candidateInventoryDigest -eq
        $manifest.candidateInventoryDigest
) 'Candidate digest changed'

Write-Host 'PASS: V4 manifest and deletion scope'

# Pull remote staging again immediately before deletion.

New-Item -ItemType Directory $beforeRoot | Out-Null

$null = Invoke-JGCLI `
  -Label 'phase-b-before-pull' `
  -CliArguments @(
    'theme', 'pull',
    '--store', $store,
    '--theme', $stagingId,
    '--path', $beforeRoot,
    '--no-input', '--no-color'
)

$preVerification = & node `
  .\scripts\prepare-jg-production-candidate.js `
  verify $productionRoot $previewRoot $beforeRoot keep

Assert-JG ($LASTEXITCODE -eq 0) `
  'Remote staging differs from approved Phase A'

$preResult = $preVerification | Out-String | ConvertFrom-Json

Assert-JG ($preResult.files -eq 456) `
  'Staging inventory changed before deletion'

foreach ($file in $files) {
    Assert-JG (
    Test-Path (Join-Path $beforeRoot $file)
    ) "Remote deletion target missing: $file"
}

Write-Host 'PASS: remote staging baseline, 456 files'

# Remote deletion requires an explicit final confirmation.

$approval = Read-Host `
  "Type I APPROVE 49 LOCALE DELETIONS ON $stagingId"

Assert-JG (
$approval -ceq "I APPROVE 49 LOCALE DELETIONS ON $stagingId"
) 'Remote deletion not approved'

# Persist an attempt marker before making changes.
# Do not remove this marker to retry after any failure.

Set-Content $attemptFile `
  "Theme=$stagingId; Count=49; Digest=$($manifest.candidateInventoryDigest)"

$onlyArguments = @()

foreach ($file in $files) {
    $onlyArguments += @('--only', $file)
}

# Intentionally NO --nodelete.
# Intentionally NO --publish, --live, or --allow-live.
# The --only list restricts this transaction to 49 locale paths.

$null = Invoke-JGCLI `
  -Label 'phase-b-locale-delete' `
  -CliArguments (@(
    'theme', 'push',
    '--store', $store,
    '--theme', $stagingId,
    '--path', $candidateRoot,
    '--strict',
    '--json',
    '--no-input'
) + $onlyArguments)

# Independent readback.

New-Item -ItemType Directory $afterRoot | Out-Null

$null = Invoke-JGCLI `
  -Label 'phase-b-after-pull' `
  -CliArguments @(
    'theme', 'pull',
    '--store', $store,
    '--theme', $stagingId,
    '--path', $afterRoot,
    '--no-input', '--no-color'
)

$postVerification = & node `
  .\scripts\prepare-jg-production-candidate.js `
  verify $productionRoot $previewRoot $afterRoot english-only

Assert-JG ($LASTEXITCODE -eq 0) `
  'Phase B staging readback failed'

$postResult = $postVerification | Out-String | ConvertFrom-Json

Assert-JG ($postResult.files -eq 407) `
  'Expected 407 files after deletion'

Assert-JG (
$postResult.candidateInventoryDigest -eq
        $manifest.candidateInventoryDigest
) 'Staging differs from the approved V4 candidate digest'

Write-Host ''
Write-Host 'STAGING PHASE B: PASS'
Write-Host "Theme: $stagingId"
Write-Host 'Removed: 49 non-English locale files'
Write-Host 'Remaining theme files: 407'
Write-Host 'English default locales preserved'
Write-Host 'Production was not targeted'
