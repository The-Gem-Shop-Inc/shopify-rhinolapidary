
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repo = 'C:\rlcc'
Set-Location $repo

$releaseRoot = Join-Path $env:LOCALAPPDATA `
  'RhinoLapidary\jg-production\20261119T150005'

$v4 = Join-Path $releaseRoot 'english-v4\candidate'
$v5 = Join-Path $releaseRoot 'english-v5\candidate'
$gitRoot = Join-Path $releaseRoot 'github-theme-v5'

$production = Join-Path $releaseRoot 'production-before'
$preview = Join-Path $releaseRoot 'accepted-preview'

$branch = 'shopify/live'
$folders = @(
    'assets', 'config', 'layout', 'locales',
    'sections', 'snippets', 'templates'
)

function Require($condition, $message) {
    if (-not $condition) { throw $message }
}

Require (Test-Path $v4) 'V4 candidate not found'
Require (-not (Test-Path $v5)) 'V5 candidate already exists'
Require (-not (Test-Path $gitRoot)) 'Deployment worktree already exists'

$origin = (& git -C $repo remote get-url origin | Out-String).Trim()

Require ($LASTEXITCODE -eq 0) 'Unable to read Git origin'
Require ($origin -match 'github\.com[:/]') `
  "Unexpected remote: $origin"

Write-Host "Source repository: $origin"
Write-Host "Development branch: $(& git -C $repo branch --show-current)"
Write-Host "Deployment branch: $branch"

# Verify immutable V4 against the independently verified Shopify
# staging readback, not against the evolving development repository.

$v4ManifestPath = Join-Path $releaseRoot `
  'english-v4\jg-production-derived-manifest.json'

$v4Readback = Join-Path $releaseRoot `
  'phase-b-recovery-after-04'

Require (Test-Path -LiteralPath $v4ManifestPath) `
  'V4 release manifest missing'

Require (Test-Path -LiteralPath $v4Readback) `
  'Verified Shopify V4 readback missing'

$manifest = Get-Content $v4ManifestPath -Raw |
        ConvertFrom-Json

Require ($manifest.result -eq 'PASS') `
  'V4 manifest is not approved'

Require ($manifest.files -eq 407) `
  'Unexpected V4 inventory count'

Require (
$manifest.candidateInventoryDigest -ceq
        'd9f231936cbdf322a558bcfe2e1ebcd2dd95908176fa53716035506c12e3895f'
) 'V4 manifest digest differs from the approved release'

function Get-VerifiedThemeInventory {
    param([string]$Root)

    $base = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\')

    @(
    Get-ChildItem -LiteralPath $Root -Recurse -File |
            ForEach-Object {
                $relative = $_.FullName.Substring($base.Length + 1).
                        Replace('\', '/')

                $hash = (Get-FileHash `
                -LiteralPath $_.FullName `
                -Algorithm SHA256).Hash.ToLowerInvariant()

                "$relative`t$hash"
            } |
            Sort-Object
    )
}

$v4Inventory = @(Get-VerifiedThemeInventory $v4)
$readbackInventory = @(Get-VerifiedThemeInventory $v4Readback)

Require ($v4Inventory.Count -eq 407) `
  "V4 contains $($v4Inventory.Count) files instead of 407"

Require ($readbackInventory.Count -eq 407) `
  'Verified Shopify readback has an unexpected inventory'

$drift = @(
    Compare-Object `
      -ReferenceObject $v4Inventory `
      -DifferenceObject $readbackInventory
)

Require ($drift.Count -eq 0) `
  'V4 does not match the independently verified Shopify readback'

$englishLocales = @(
Get-ChildItem -LiteralPath (Join-Path $v4 'locales') -File |
        Select-Object -ExpandProperty Name |
        Sort-Object
)

$expectedLocales = @(
    'en.default.json'
    'en.default.schema.json'
)

Require (
@(
    Compare-Object `
          -ReferenceObject $expectedLocales `
          -DifferenceObject $englishLocales
).Count -eq 0
) 'V4 English locale inventory is incorrect'

Write-Host 'PASS: immutable V4 matches approved Shopify readback'
Write-Host 'Files: 407'
Write-Host 'Locale files: 2'
Write-Host "Approved digest: $($manifest.candidateInventoryDigest)"

# Create V5 without modifying V4.
New-Item -ItemType Directory -Path $v5 -Force | Out-Null

foreach ($folder in $folders) {
    Copy-Item `
      -LiteralPath (Join-Path $v4 $folder) `
      -Destination $v5 `
      -Recurse
}

# Apply the exact reviewed CSS from the development repository.
$css = 'assets/rhino-g-catalog-navigation.css'

Copy-Item `
  -LiteralPath (Join-Path $repo $css) `
  -Destination (Join-Path $v5 $css) `
  -Force

$base = [IO.Path]::GetFullPath($v5).TrimEnd('\')
$v5Files = @(Get-ChildItem $v5 -Recurse -File)

Require ($v5Files.Count -eq 407) `
  "Unexpected V5 file count: $($v5Files.Count)"

$changes = @(
foreach ($file in $v5Files) {
    $relative = $file.FullName.Substring($base.Length + 1).
            Replace('\', '/')

    $old = Join-Path $v4 $relative

    Require (Test-Path $old) "Unexpected addition: $relative"

    $oldHash = (Get-FileHash $old -Algorithm SHA256).Hash
    $newHash = (Get-FileHash $file.FullName -Algorithm SHA256).Hash

    if ($oldHash -ne $newHash) {
        $relative
    }
}
)

Require (
$changes.Count -eq 1 -and
        $changes[0] -ceq $css
) 'V5 must change only the catalog navigation CSS'

Require (
@(Get-ChildItem (Join-Path $v5 'locales') -File).Count -eq 2
) 'V5 must retain only two English locale files'

Write-Host 'PASS: V5 differs from V4 in exactly one CSS file'

# Prepare an isolated repository containing theme files only.
New-Item -ItemType Directory -Path $gitRoot | Out-Null

& git -C $gitRoot init -b $branch
Require ($LASTEXITCODE -eq 0) 'Git initialization failed'

& git -C $gitRoot remote add origin $origin
Require ($LASTEXITCODE -eq 0) 'Could not set origin'

$existing = @(
    & git -C $gitRoot ls-remote --heads origin "refs/heads/$branch"
)

Require ($LASTEXITCODE -eq 0) 'Could not inspect remote branches'
Require ($existing.Count -eq 0) `
  "Remote branch $branch already exists. Do not overwrite it."

foreach ($folder in $folders) {
    Copy-Item `
      -LiteralPath (Join-Path $v5 $folder) `
      -Destination $gitRoot `
      -Recurse
}

& git -C $gitRoot add -- $folders
Require ($LASTEXITCODE -eq 0) 'Git staging failed'

Write-Host ''
Write-Host '=== Files scheduled for GitHub ==='
& git -C $gitRoot diff --cached --stat

$approval = Read-Host `
  "Type PUSH SHOPIFY THEME TO $origin"

Require (
$approval -ceq "PUSH SHOPIFY THEME TO $origin"
) 'Push not approved'

& git -C $gitRoot commit -m `
  'release(rhino): stage verified JG theme with catalog navigation fix'

Require ($LASTEXITCODE -eq 0) 'Commit failed'

& git -C $gitRoot push -u origin $branch
Require ($LASTEXITCODE -eq 0) 'Push failed'

Write-Host ''
Write-Host 'GITHUB THEME BRANCH: READY'
Write-Host "Repository: $origin"
Write-Host "Branch: $branch"
Write-Host "Candidate: $v5"
Write-Host 'Theme files: 407'
Write-Host "Modified relative to V4: $css"
