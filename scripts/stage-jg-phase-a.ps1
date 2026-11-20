
$ErrorActionPreference = 'Stop'
Set-Location C:\rlcc

$store = 'sz5dnk-nf.myshopify.com'
$productionId = '158579622085'
$previewId = '158631198917'
$stagingId = '169509912773'

$releaseRoot = Join-Path $env:LOCALAPPDATA `
  'RhinoLapidary\jg-production\20261119T150005'

$productionRoot = Join-Path $releaseRoot 'production-before'
$previewRoot = Join-Path $releaseRoot 'accepted-preview'
$candidateRoot = Join-Path $releaseRoot 'english-v4\candidate'

$preReadback = Join-Path $releaseRoot 'staging-selected-before-upload'
$postReadback = Join-Path $releaseRoot 'staging-phase-a-readback'
$attemptMarker = Join-Path $releaseRoot 'staging-phase-a-upload-attempted.txt'
$idFile = Join-Path $releaseRoot 'jg-staging-theme-id.txt'
$manifestFile = Join-Path $releaseRoot `
  'english-v4\jg-production-derived-manifest.json'

function Assert-JG($condition, $message) {
    if (-not $condition) {
        throw $message
    }
}

function Invoke-JGShopify {
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
    -Wait `
    -NoNewWindow `
    -PassThru

    if ($process.ExitCode -ne 0) {
        Write-Host "Failed: $Label"
        Get-Content $stderr -Tail 25
        throw "$Label exited $($process.ExitCode)"
    }

    Write-Host "PASS: $Label"
    return $stdout
}

function Get-ThemeFingerprint($root) {
    $base = (Resolve-Path $root).Path.TrimEnd('\')

    @(
    Get-ChildItem $root -Recurse -File |
            ForEach-Object {
                $relative = $_.FullName.Substring($base.Length + 1).
                        Replace('\', '/')

                $hash = (Get-FileHash $_.FullName -Algorithm SHA256).
                Hash.ToLowerInvariant()

                "$relative`t$hash"
            } |
            Sort-Object
    )
}

# 1. Validate target identity and local release evidence.

Assert-JG (Test-Path $idFile) 'Staging ID file missing'

$recordedId = (Get-Content $idFile -Raw).Trim()

Assert-JG ($recordedId -eq $stagingId) `
  "Recorded staging ID differs: $recordedId"

Assert-JG ($stagingId -ne $productionId) 'Staging points to production'
Assert-JG ($stagingId -ne $previewId) 'Staging points to preview'

foreach ($required in @(
    $productionRoot,
    $previewRoot,
    $candidateRoot,
    $manifestFile
)) {
    Assert-JG (Test-Path $required) "Missing: $required"
}

Assert-JG (-not (Test-Path $preReadback)) `
  'Preupload snapshot already exists; inspect before retrying'

Assert-JG (-not (Test-Path $postReadback)) `
  'Postupload snapshot already exists; inspect before retrying'

Assert-JG (-not (Test-Path $attemptMarker)) `
  'An upload was already attempted; inspect before retrying'

$manifest = Get-Content $manifestFile -Raw | ConvertFrom-Json

Assert-JG ($manifest.result -eq 'PASS') 'Manifest did not pass'
Assert-JG ($manifest.files -eq 407) 'Unexpected V4 file count'
Assert-JG ($manifest.acceptedClosure -eq 28) 'Unexpected closure'
Assert-JG ($manifest.originalProductionFiles -eq 443) `
  'Unexpected production inventory'

Assert-JG (
$manifest.successorCorrection.path -eq
        'snippets/rhino-machine-specification-row.liquid'
) 'Incorrect corrective file'

node .\scripts\prepare-jg-production-candidate.js `
  verify $productionRoot $previewRoot $candidateRoot english-only

Assert-JG ($LASTEXITCODE -eq 0) 'V4 integrity failed'

# 2. Prepare CLI invocation.

$shopifyDirectory = Split-Path `
  (Get-Command shopify.cmd -ErrorAction Stop).Source -Parent

$shopifyEntry = Join-Path $shopifyDirectory `
  'node_modules\@shopify\cli\bin\run.js'

$nodeExe = (Get-Command node.exe -ErrorAction Stop).Source

Assert-JG (Test-Path $shopifyEntry) 'Shopify CLI missing'

# 3. Pull selected unpublished staging theme before modifying it.

New-Item -ItemType Directory $preReadback | Out-Null

$null = Invoke-JGShopify `
  -Label 'stage-selected-baseline-pull' `
  -CliArguments @(
    'theme', 'pull',
    '--store', $store,
    '--theme', $stagingId,
    '--path', $preReadback,
    '--no-input', '--no-color'
)

$baseline = @(Get-ThemeFingerprint $productionRoot)
$remote = @(Get-ThemeFingerprint $preReadback)

Assert-JG ($baseline.Count -eq 443) 'Wrong production file count'
Assert-JG ($remote.Count -eq 443) 'Wrong staging file count'

$differences = @(
    Compare-Object -ReferenceObject $baseline -DifferenceObject $remote
)

if ($differences.Count -gt 0) {
    $differences |
            Out-File (Join-Path $releaseRoot 'staging-baseline-drift.txt')

    throw 'Staging duplicate does not exactly match production'
}

Write-Host 'PASS: unpublished staging matches 443 production files'

# 4. Build the exact selective upload scope.

$releaseFiles = @(
$manifest.source | ForEach-Object { $_.path }
) + @($manifest.successorCorrection.path)

Assert-JG ($releaseFiles.Count -eq 29) `
  'Expected exactly 29 release files'

Assert-JG (
@($releaseFiles | Sort-Object -Unique).Count -eq 29
) 'Duplicate release paths'

$onlyArguments = @()

foreach ($file in $releaseFiles) {
    Assert-JG (Test-Path (Join-Path $candidateRoot $file)) `
    "Missing candidate file: $file"

    $onlyArguments += @('--only', $file)
}

# 5. Require explicit authorization for the unpublished upload.

$approval = Read-Host `
  "Type I APPROVE STAGING PATCH $stagingId"

Assert-JG (
$approval -ceq "I APPROVE STAGING PATCH $stagingId"
) 'Selective staging upload not approved'

Set-Content $attemptMarker `
  "Target=$stagingId; Files=29; Candidate=$($manifest.candidateInventoryDigest)"

$pushOutput = Invoke-JGShopify `
  -Label 'stage-selected-v4-upload' `
  -CliArguments (@(
    'theme', 'push',
    '--store', $store,
    '--theme', $stagingId,
    '--path', $candidateRoot,
    '--nodelete',
    '--strict',
    '--json',
    '--no-input'
) + $onlyArguments)

$pushResult = Get-Content $pushOutput -Raw | ConvertFrom-Json

Assert-JG (
[string]$pushResult.theme.id -eq $stagingId
) 'Push result has unexpected target identity'

Assert-JG (
[string]$pushResult.theme.role -ieq 'unpublished'
) 'Push result does not confirm an unpublished theme'

# 6. Pull back and independently verify.

New-Item -ItemType Directory $postReadback | Out-Null

$null = Invoke-JGShopify `
  -Label 'stage-selected-v4-readback' `
  -CliArguments @(
    'theme', 'pull',
    '--store', $store,
    '--theme', $stagingId,
    '--path', $postReadback,
    '--no-input', '--no-color'
)

node .\scripts\prepare-jg-production-candidate.js `
  verify $productionRoot $previewRoot $postReadback keep

Assert-JG ($LASTEXITCODE -eq 0) `
  'Remote staging readback failed'

Write-Host ''
Write-Host 'STAGING PHASE A: PASS'
Write-Host "Unpublished theme: $stagingId"
Write-Host 'Expected inventory: 456 files'
Write-Host 'Production theme was not targeted'
