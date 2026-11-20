
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
$phaseARoot = Join-Path $releaseRoot 'staging-phase-a-readback'

$manifestPath = Join-Path $releaseRoot `
  'english-v4\jg-production-derived-manifest.json'

$planPath = Join-Path $releaseRoot 'jg-phase-b-locale-plan.json'
$idPath = Join-Path $releaseRoot 'jg-staging-theme-id.txt'
$originalAttempt = Join-Path $releaseRoot `
  'staging-phase-b-attempted.txt'

function Assert-JG($condition, [string]$message) {
    if (-not $condition) {
        throw $message
    }
}

# These 20 paths were independently observed in Shopify Admin.
# This list MUST NOT be expanded or replaced by a wildcard.

$remaining = @(
    'locales/ja.schema.json'
    'locales/ko.json'
    'locales/ko.schema.json'
    'locales/lt.json'
    'locales/nb.json'
    'locales/nb.schema.json'
    'locales/nl.json'
    'locales/nl.schema.json'
    'locales/pl.json'
    'locales/pl.schema.json'
    'locales/pt-BR.json'
    'locales/pt-BR.schema.json'
    'locales/pt-PT.json'
    'locales/pt-PT.schema.json'
    'locales/ro.json'
    'locales/ru.json'
    'locales/sk.json'
    'locales/sl.json'
    'locales/sv.json'
    'locales/sv.schema.json'
)

# Validate local authority and source evidence.

foreach ($path in @(
    $productionRoot, $previewRoot, $candidateRoot,
    $phaseARoot, $manifestPath, $planPath,
    $idPath, $originalAttempt
)) {
    Assert-JG (Test-Path -LiteralPath $path) `
      "Missing required evidence: $path"
}

$recordedId = (Get-Content $idPath -Raw).Trim()

Assert-JG ($recordedId -ceq $stagingId) `
  'Unexpected staging ID'

Assert-JG ($stagingId -ne $productionId) `
  'Production target prohibited'

Assert-JG ($stagingId -ne $previewId) `
  'Preview target prohibited'

$manifest = Get-Content $manifestPath -Raw |
        ConvertFrom-Json

$plan = Get-Content $planPath -Raw |
        ConvertFrom-Json

Assert-JG ($manifest.files -eq 407) `
  'Incorrect V4 file count'

Assert-JG ($manifest.result -eq 'PASS') `
  'V4 release manifest is not valid'

Assert-JG ($plan.stagingThemeId -eq $stagingId) `
  'Deletion plan targets another theme'

Assert-JG ($plan.deletionCount -eq 49) `
  'Original deletion plan is invalid'

$approved = @($plan.files)

Assert-JG ($approved.Count -eq 49) `
  'Expected 49 originally approved files'

Assert-JG ($remaining.Count -eq 20) `
  'Expected 20 recovery files'

Assert-JG (
@($remaining | Sort-Object -Unique).Count -eq 20
) 'Recovery paths are duplicated'

foreach ($file in $remaining) {
    Assert-JG ($file -cin $approved) `
      "File not approved for deletion: $file"

    Assert-JG (
    $file -cmatch '^locales/[^/]+\.json$'
    ) "Unsafe path: $file"

    Assert-JG (
    -not (Test-Path (Join-Path $candidateRoot $file))
    ) "Recovery target exists in V4: $file"

    Assert-JG (
    Test-Path (Join-Path $phaseARoot $file)
    ) "Original remote file evidence missing: $file"
}

# Construct the exact expected final inventory from V4.

function Get-RelativePaths([string]$root) {
    $base = (Resolve-Path -LiteralPath $root).Path.TrimEnd('\')

    @(
    Get-ChildItem -LiteralPath $root -Recurse -File |
            ForEach-Object {
                $_.FullName.Substring($base.Length + 1).
                        Replace('\', '/')
            } |
            Sort-Object
    )
}

$candidatePaths = @(Get-RelativePaths $candidateRoot)

Assert-JG ($candidatePaths.Count -eq 407) `
  'Candidate file count changed'

$expectedHashes = @{}

foreach ($relative in $candidatePaths) {
    $hash = Get-FileHash `
      -LiteralPath (Join-Path $candidateRoot $relative) `
      -Algorithm SHA256

    $expectedHashes[$relative] = $hash.Hash
}

foreach ($relative in $remaining) {
    $hash = Get-FileHash `
      -LiteralPath (Join-Path $phaseARoot $relative) `
      -Algorithm SHA256

    $expectedHashes[$relative] = $hash.Hash
}

function Assert-RemoteInventory {
    param(
        [string]$Root,
        [string[]]$RemainingLocales
    )

    $actualPaths = @(Get-RelativePaths $Root)
    $expectedPaths = @($candidatePaths) + @($RemainingLocales)

    Assert-JG (
    $actualPaths.Count -eq $expectedPaths.Count
    ) "Inventory count mismatch at $Root"

    $difference = @(
        Compare-Object `
          -ReferenceObject @($expectedPaths | Sort-Object) `
          -DifferenceObject @($actualPaths | Sort-Object)
    )

    Assert-JG ($difference.Count -eq 0) `
      "Unexpected additions or deletions at $Root"

    foreach ($relative in $actualPaths) {
        $hash = (Get-FileHash `
          -LiteralPath (Join-Path $Root $relative) `
          -Algorithm SHA256).Hash

        Assert-JG (
        $hash -eq $expectedHashes[$relative]
        ) "Content mismatch: $relative"
    }

    Write-Host "PASS: exact inventory ($($actualPaths.Count) files)"
}

# Use the same direct Node invocation previously proven reliable.

$shopifyDirectory = Split-Path `
  (Get-Command shopify.cmd -ErrorAction Stop).Source -Parent

$shopifyEntry = Join-Path $shopifyDirectory `
  'node_modules\@shopify\cli\bin\run.js'

$nodeExe = (Get-Command node.exe -ErrorAction Stop).Source

Assert-JG (Test-Path $shopifyEntry) 'Shopify CLI missing'

function Invoke-JGCLI {
    param(
        [string]$Label,
        [string[]]$CliArguments
    )

    $stdout = Join-Path $releaseRoot "$Label.stdout.txt"
    $stderr = Join-Path $releaseRoot "$Label.stderr.txt"

    $argsForProcess = @("`"$shopifyEntry`"") + @(
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
      -ArgumentList $argsForProcess `
      -RedirectStandardOutput $stdout `
      -RedirectStandardError $stderr `
      -NoNewWindow `
      -Wait `
      -PassThru

    if ($process.ExitCode -ne 0) {
        Write-Host "FAILED: $Label (exit $($process.ExitCode))"

        Get-Content $stdout -Encoding UTF8 -Tail 20
        Get-Content $stderr -Encoding UTF8 -Tail 20

        throw "Stop recovery; inspect remote state before retrying."
    }

    Write-Host "PASS: $Label"
}

function Pull-JGTheme {
    param(
        [string]$Label,
        [string]$Destination
    )

    Assert-JG (-not (Test-Path $Destination)) `
      "Readback directory already exists: $Destination"

    New-Item -ItemType Directory -Path $Destination |
            Out-Null

    Invoke-JGCLI -Label $Label -CliArguments @(
        'theme', 'pull',
        '--store', $store,
        '--theme', $stagingId,
        '--path', $Destination,
        '--no-input',
        '--no-color'
    )
}

# A fresh pull establishes the exact current remote state.

$before = Join-Path $releaseRoot 'phase-b-recovery-before'

Pull-JGTheme `
  -Label 'phase-b-recovery-initial-pull' `
  -Destination $before

Assert-RemoteInventory `
  -Root $before `
  -RemainingLocales $remaining

Write-Host 'PASS: recovery preflight, 427 exact files'

# Four bounded batches of five deletions.
# Each batch is independently verified before the next begins.

for ($batch = 1; $batch -le 4; $batch++) {
    $batchFiles = @($remaining | Select-Object -First 5)

    Assert-JG ($batchFiles.Count -eq 5) `
      "Unexpected batch size: $batch"

    $marker = Join-Path $releaseRoot `
      ("phase-b-recovery-batch-{0:00}-attempted.txt" -f $batch)

    $after = Join-Path $releaseRoot `
      ("phase-b-recovery-after-{0:00}" -f $batch)

    Assert-JG (-not (Test-Path $marker)) `
      "Batch $batch was already attempted"

    Assert-JG (-not (Test-Path $after)) `
      "Batch $batch readback already exists"

    Write-Host ''
    Write-Host "=== Recovery batch $batch / 4 ==="

    $batchFiles | ForEach-Object {
        Write-Host "Delete: $_"
    }

    $onlyArgs = @()

    foreach ($file in $batchFiles) {
        $onlyArgs += @('--only', $file)
    }

    # Persist the attempt BEFORE initiating the remote operation.

    @(
        "Theme=$stagingId"
        "Batch=$batch"
        "Files=$($batchFiles -join ',')"
        "CandidateDigest=$($manifest.candidateInventoryDigest)"
    ) | Set-Content $marker -Encoding UTF8

    # Only these five missing local files are selected.
    # No publication or live-theme flags.

    Invoke-JGCLI `
      -Label ("phase-b-recovery-delete-{0:00}" -f $batch) `
      -CliArguments (@(
        'theme', 'push',
        '--store', $store,
        '--theme', $stagingId,
        '--path', $candidateRoot,
        '--strict',
        '--json',
        '--no-input'
    ) + $onlyArgs)

    $remaining = @(
    $remaining | Where-Object {
        $_ -notin $batchFiles
    }
    )

    Pull-JGTheme `
      -Label ("phase-b-recovery-pull-{0:00}" -f $batch) `
      -Destination $after

    Assert-RemoteInventory `
      -Root $after `
      -RemainingLocales $remaining
}

# Final independent verification against the original V4 digest.

$finalRoot = Join-Path $releaseRoot 'phase-b-recovery-after-04'

$resultText = & node `
  .\scripts\prepare-jg-production-candidate.js `
  verify $productionRoot $previewRoot $finalRoot english-only

Assert-JG ($LASTEXITCODE -eq 0) `
  'Final English candidate verification failed'

$result = $resultText | Out-String | ConvertFrom-Json

Assert-JG ($result.files -eq 407) `
  'Final inventory is not 407 files'

Assert-JG (
$result.candidateInventoryDigest -eq
        $manifest.candidateInventoryDigest
) 'Final remote digest differs from V4'

Write-Host ''
Write-Host 'STAGING PHASE B RECOVERY: PASS'
Write-Host "Unpublished theme: $stagingId"
Write-Host 'Deleted during recovery: 20'
Write-Host 'Total approved locale deletions: 49'
Write-Host 'Final inventory: 407 files'
Write-Host "Verified digest: $($result.candidateInventoryDigest)"
Write-Host 'Production theme not targeted'
