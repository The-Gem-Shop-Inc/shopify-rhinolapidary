[CmdletBinding()]
param(
    [string]$BaselineRef = "trade-15.5.0-baseline",
    [string]$OutputPath = "docs/architecture/theme-customization-inventory.md"
)

$ErrorActionPreference = "Stop"

$themeRoots = @(
    "assets",
    "blocks",
    "config",
    "layout",
    "locales",
    "sections",
    "snippets",
    "templates"
)

function Invoke-GitLines {
    param([string[]]$Arguments)

    $result = & git @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $($Arguments -join ' ')"
    }

    return @(
        $result |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            ForEach-Object { $_.Trim() }
    )
}

function Get-Owner {
    param([string]$Path)

    switch -Regex ($Path) {
        '^config/settings_data\.json$' { return "Theme engineering + Shopify admin" }
        '^config/'                     { return "Theme architecture" }
        '^layout/'                     { return "Theme architecture" }
        '^assets/.*\.js$'              { return "Frontend engineering" }
        '^assets/'                     { return "Design + frontend engineering" }
        '^locales/'                    { return "Content + localization" }
        '^templates/'                  { return "Theme engineering + content" }
        '^sections/'                   { return "Theme engineering" }
        '^snippets/'                   { return "Theme engineering" }
        '^blocks/'                     { return "Theme engineering" }
        default                        { return "Theme engineering" }
    }
}

function Get-Risk {
    param(
        [string]$Path,
        [string]$Status
    )

    if ($Status -eq "Upstream unchanged") {
        return "Low"
    }

    switch -Regex ($Path) {
        '^layout/'                     { return "High" }
        '^config/settings_'            { return "High" }
        '^assets/.*cart.*\.js$'        { return "High" }
        '^assets/.*quick-order.*\.js$' { return "High" }
        '^assets/.*\.js$'              { return "Medium" }
        '^templates/product'           { return "High" }
        '^sections/main-product'       { return "High" }
        '^sections/'                   { return "Medium" }
        '^snippets/'                   { return "Medium" }
        '^templates/'                  { return "Medium" }
        '^locales/'                    { return "Low" }
        default                        { return "Medium" }
    }
}

function Get-TestCoverage {
    param(
        [string]$Path,
        [string]$Status,
        [string]$Risk
    )

    if ($Status -eq "Upstream unchanged") {
        return "Inherited Trade; verify during upstream updates"
    }

    if ($Risk -eq "High") {
        return "Theme Check + targeted storefront regression"
    }

    if ($Path -match '\.(json|liquid)$') {
        return "Theme Check + preview verification"
    }

    if ($Path -match '\.js$') {
        return "Theme Check + browser interaction test"
    }

    return "Preview verification"
}

function Escape-Markdown {
    param([string]$Value)

    if ($null -eq $Value) {
        return ""
    }

    return $Value.Replace("|", "\|")
}

& git rev-parse --verify $BaselineRef *> $null

if ($LASTEXITCODE -ne 0) {
    throw "Baseline ref '$BaselineRef' does not exist."
}

$baselineArguments = @(
    "ls-tree",
    "-r",
    "--name-only",
    $BaselineRef,
    "--"
) + $themeRoots

$currentArguments = @(
    "ls-files",
    "--"
) + $themeRoots

$baselineFiles = Invoke-GitLines -Arguments $baselineArguments
$currentFiles = Invoke-GitLines -Arguments $currentArguments

$baselineSet = @{}
$currentSet = @{}

foreach ($file in $baselineFiles) {
    $baselineSet[$file] = $true
}

foreach ($file in $currentFiles) {
    $currentSet[$file] = $true
}

$allFiles = @(
    $baselineFiles + $currentFiles |
        Sort-Object -Unique
)

$rows = foreach ($file in $allFiles) {
    $existsInBaseline = $baselineSet.ContainsKey($file)
    $existsCurrently = $currentSet.ContainsKey($file)

    if ($existsInBaseline -and $existsCurrently) {
        & git diff --quiet $BaselineRef -- $file
        $diffResult = $LASTEXITCODE

        if ($diffResult -eq 0) {
            $status = "Upstream unchanged"
        }
        elseif ($diffResult -eq 1) {
            $status = "Upstream modified"
        }
        else {
            throw "Unable to compare '$file' against '$BaselineRef'."
        }
    }
    elseif ($existsCurrently) {
        $status = "Rhino-added"
    }
    else {
        $status = "Removed from Rhino"
    }

    $risk = Get-Risk -Path $file -Status $status

    [PSCustomObject]@{
        File         = $file
        Status       = $status
        Owner        = Get-Owner -Path $file
        Risk         = $risk
        TestCoverage = Get-TestCoverage -Path $file -Status $status -Risk $risk
    }
}

$outputDirectory = Split-Path -Parent $OutputPath

if ($outputDirectory) {
    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}

$lines = @(
    "# Theme Customization Inventory",
    "",
    "Baseline: ``$BaselineRef``",
    "",
    "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",
    "",
    "This file is generated by ``scripts/update-theme-inventory.ps1``.",
    "Do not edit generated rows manually.",
    "",
    "| File | Classification | Owner | Risk | Test coverage |",
    "|---|---|---|:---:|---|"
)

foreach ($row in $rows) {
    $lines += "| $(Escape-Markdown $row.File) | " +
        "$(Escape-Markdown $row.Status) | " +
        "$(Escape-Markdown $row.Owner) | " +
        "$(Escape-Markdown $row.Risk) | " +
        "$(Escape-Markdown $row.TestCoverage) |"
}

$lines | Set-Content -Path $OutputPath -Encoding utf8

Write-Host "Wrote $($rows.Count) inventory rows to $OutputPath"