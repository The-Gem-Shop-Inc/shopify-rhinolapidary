[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$AdminEvidencePath,
  [string]$OutputDirectory = "$env:LOCALAPPDATA\RhinoLapidary\evidence\j2-g4-preview\live",
  [int]$MaxAdminEvidenceAgeMinutes = 5
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Store = 'sz5dnk-nf.myshopify.com'
$ShopGid = 'gid://shopify/Shop/79279947973'
$PreviewThemeId = '158631198917'
$PreviewThemeGid = 'gid://shopify/OnlineStoreTheme/158631198917'
$ProductionThemeId = '158579622085'
$AuthorizedQuote = "The email alternative uses Shopify's contact form and security check. It does not create a Draft Order. Use it deliberately when automated submission is unavailable or cannot preserve the cart's purchasing terms."

function Assert-Gate([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw "STOP: $Message" }
}

function Invoke-NativeChecked([string]$File, [string[]]$Arguments) {
  $output = & $File @Arguments 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) { throw "STOP: $File $($Arguments -join ' ') failed ($LASTEXITCODE).`n$output" }
  $output.Trim()
}

function Remove-SafeTemp([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $resolved = (Resolve-Path -LiteralPath $Path).Path
  $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
  Assert-Gate ($resolved.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) "Refusing to remove a non-temporary path"
  Assert-Gate ((Split-Path -Leaf $resolved).StartsWith('rhino-j2-g4-live-', [StringComparison]::OrdinalIgnoreCase)) "Unexpected temporary path"
  Remove-Item -LiteralPath $resolved -Recurse -Force
}

$temp = $null
try {
  $sourcePath = (Resolve-Path -LiteralPath $AdminEvidencePath).Path
  $admin = Get-Content -LiteralPath $sourcePath -Raw | ConvertFrom-Json -Depth 100
  $age = [DateTimeOffset]::UtcNow - [DateTimeOffset]$admin.observedAt
  Assert-Gate ($age.TotalMinutes -ge 0 -and $age.TotalMinutes -le $MaxAdminEvidenceAgeMinutes) "Admin GraphQL evidence is stale"
  Assert-Gate ($admin.readOnly -and $admin.shopifyMutations -eq 0) "Admin evidence is not read-only"
  Assert-Gate ($admin.shop.id -eq $ShopGid -and $admin.shop.myshopifyDomain -eq $Store) "Shop identity mismatch"
  Assert-Gate ($admin.previewTheme.id -eq $PreviewThemeGid -and $admin.previewTheme.numericId -eq $PreviewThemeId -and $admin.previewTheme.role -eq 'UNPUBLISHED') "Preview identity mismatch"
  Assert-Gate ($admin.productionTheme.numericId -eq $ProductionThemeId -and $admin.productionTheme.role -eq 'MAIN') "Production identity mismatch"
  Assert-Gate ($admin.publishedLocales.Count -eq 1 -and $admin.publishedLocales[0].locale -eq 'en' -and $admin.publishedLocales[0].published) "English is not the only published locale"
  Assert-Gate ($admin.remoteEnglishLocale.quoteExplanation -eq $AuthorizedQuote) "Remote quote explanation changed"

  $themes = Invoke-NativeChecked 'shopify' @('theme', 'list', '--store', $Store, '--json', '--no-input') | ConvertFrom-Json -Depth 20
  $preview = @($themes | Where-Object { [string]$_.id -eq $PreviewThemeId })
  $production = @($themes | Where-Object { [string]$_.id -eq $ProductionThemeId })
  Assert-Gate ($preview.Count -eq 1 -and $preview[0].role -eq 'unpublished') "CLI preview role mismatch"
  Assert-Gate ($production.Count -eq 1 -and $production[0].role -eq 'live') "CLI production role mismatch"

  $temp = Join-Path ([IO.Path]::GetTempPath()) ("rhino-j2-g4-live-{0}" -f [Guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $temp | Out-Null
  Invoke-NativeChecked 'shopify' @('theme', 'pull', '--store', $Store, '--theme', $PreviewThemeId, '--path', $temp, '--only', 'locales/en.default.json', '--nodelete', '--no-input') | Out-Null
  $localePath = Join-Path $temp 'locales\en.default.json'
  Assert-Gate (Test-Path -LiteralPath $localePath -PathType Leaf) "Remote English locale pull is missing"
  $localeHash = (Get-FileHash -LiteralPath $localePath -Algorithm SHA256).Hash.ToLowerInvariant()
  Assert-Gate ($localeHash -eq $admin.remoteEnglishLocale.sha256) "Remote locale changed after Admin evidence observation"
  Assert-Gate ((Get-Item -LiteralPath $localePath).Length -eq $admin.remoteEnglishLocale.size) "Remote locale size changed"

  New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
  $validatedAt = [DateTimeOffset]::UtcNow
  $outputPath = Join-Path $OutputDirectory ("validated-{0}.json" -f $validatedAt.ToString('yyyy-MM-ddTHH-mm-ss.fffffffZ'))
  [ordered]@{
    schemaVersion = 1
    identity = 'J2_G4_PREVIEW_LIVE_READ_EXTERNAL_V1'
    observedAt = ([DateTimeOffset]$admin.observedAt).ToUniversalTime().ToString('o')
    validatedAt = $validatedAt.ToUniversalTime().ToString('o')
    sourceAdminEvidencePath = $sourcePath
    readOnly = $true
    shop = $admin.shop
    previewTheme = $admin.previewTheme
    productionTheme = $admin.productionTheme
    publishedLocales = $admin.publishedLocales
    remoteEnglishLocale = $admin.remoteEnglishLocale
    pendingThemeEditsObserved = $admin.pendingThemeEditsObserved
    shopifyMutations = 0
    cliThemeListVerified = $true
    remoteLocaleBodyVerified = $true
  } | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $outputPath -Encoding utf8NoBOM
  Write-Output $outputPath
} finally {
  if ($temp) { Remove-SafeTemp $temp }
}
