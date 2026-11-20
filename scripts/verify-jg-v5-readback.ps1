
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$releaseRoot = Join-Path $env:LOCALAPPDATA `
    'RhinoLapidary\jg-production\20261119T150005'

$sourceRoot = Join-Path $releaseRoot 'english-v5\candidate'
$readbackRoot = Join-Path $releaseRoot `
    'github-readback-169544712389'

$expectedCount = 407
$utf8 = [System.Text.UTF8Encoding]::new($false, $true)

# Shopify source files are text. Image and font assets must
# retain exact bytes.
$textExtensions = @(
    '.liquid', '.css', '.js', '.json', '.svg',
    '.html', '.txt', '.xml', '.md', '.scss',
    '.map', '.webmanifest'
)

function Get-ByteHash {
    param([byte[]]$Bytes)

    $sha = [System.Security.Cryptography.SHA256]::Create()

    try {
        return [BitConverter]::ToString(
                $sha.ComputeHash($Bytes)
        ).Replace('-', '').ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }
}

function Get-Inventory {
    param([string]$Root)

    if (-not (Test-Path -LiteralPath $Root -PathType Container)) {
        throw "Directory missing: $Root"
    }

    $base = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\')
    $inventory = @{}

    foreach ($file in Get-ChildItem -LiteralPath $Root -Recurse -File) {
        $relative = $file.FullName.Substring(
                $base.Length + 1
        ).Replace('\', '/')

        if ($inventory.ContainsKey($relative)) {
            throw "Duplicate theme path: $relative"
        }

        [byte[]]$bytes = [IO.File]::ReadAllBytes($file.FullName)
        $rawHash = Get-ByteHash $bytes

        $extension = [IO.Path]::GetExtension(
                $file.Name
        ).ToLowerInvariant()

        if ($textExtensions -contains $extension) {
            # Decode strictly as UTF-8. Do not silently replace
            # invalid characters or change other whitespace.
            $text = $utf8.GetString($bytes)

            # The ONLY permitted normalization is CRLF -> LF.
            $canonicalText = $text.Replace("`r`n", "`n")
            $canonicalBytes = $utf8.GetBytes($canonicalText)
        }
        else {
            # Binary assets require exact byte equality.
            $canonicalBytes = $bytes
        }

        $inventory[$relative] = [pscustomobject]@{
            RawHash = $rawHash
            CanonicalHash = Get-ByteHash $canonicalBytes
        }
    }

    return $inventory
}

Write-Host '=== V5 / SHOPIFY CANONICAL VERIFICATION ==='

$source = Get-Inventory $sourceRoot
$remote = Get-Inventory $readbackRoot

if ($source.Count -ne $expectedCount -or
        $remote.Count -ne $expectedCount) {
    throw "Unexpected inventory: source=$($source.Count), remote=$($remote.Count)"
}

$sourceNames = @($source.Keys | Sort-Object)
$remoteNames = @($remote.Keys | Sort-Object)

$nameDifferences = @(
    Compare-Object $sourceNames $remoteNames
)

if ($nameDifferences.Count -gt 0) {
    $nameDifferences | Format-Table
    throw 'Theme filenames differ'
}

$expectedLocales = @(
    'locales/en.default.json'
    'locales/en.default.schema.json'
)

$actualLocales = @(
$remoteNames | Where-Object { $_ -like 'locales/*' }
)

if (@(
    Compare-Object $expectedLocales $actualLocales
).Count -gt 0) {
    throw 'Unexpected locale inventory'
}

$rawDifferences = @()
$canonicalDifferences = @()

foreach ($name in $sourceNames) {
    if ($source[$name].RawHash -cne $remote[$name].RawHash) {
        $rawDifferences += $name
    }

    if ($source[$name].CanonicalHash -cne
            $remote[$name].CanonicalHash) {
        $canonicalDifferences += $name
    }
}

Write-Host "Files compared: $($source.Count)"
Write-Host "Raw byte differences: $($rawDifferences.Count)"
Write-Host "Canonical differences: $($canonicalDifferences.Count)"

if ($canonicalDifferences.Count -gt 0) {
    Write-Host 'UNACCEPTABLE CONTENT DIFFERENCES:'
    $canonicalDifferences | ForEach-Object {
        Write-Host "  $_"
    }

    throw 'FAIL: V5 and Shopify differ beyond line endings'
}

Write-Host ''
Write-Host 'PASS: EXACT FILENAME INVENTORY'
Write-Host 'PASS: ALL 407 FILES MATCH AFTER CRLF NORMALIZATION'
Write-Host 'PASS: BINARY ASSETS MATCH EXACTLY'
Write-Host 'PASS: TWO ENGLISH LOCALE FILES'
Write-Host 'PASS: NO UNAUTHORIZED CONTENT DRIFT'
