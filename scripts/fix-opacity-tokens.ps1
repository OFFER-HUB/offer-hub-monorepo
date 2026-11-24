#!/usr/bin/env pwsh
# fix-opacity-tokens.ps1
# Replaces all opacity-suffixed theme token classes with color-mix equivalents.
# Token → CSS variable map from tailwind.config.ts

param([string]$SrcRoot = "src")

$tokenMap = @{
  "theme-primary"       = "--color-primary"
  "theme-primary-hover" = "--color-primary-hover"
  "theme-secondary"     = "--color-secondary"
  "theme-accent"        = "--color-accent"
  "theme-success"       = "--color-success"
  "theme-warning"       = "--color-warning"
  "theme-error"         = "--color-error"
  "theme-border"        = "--color-border"
  "bg-base"             = "--color-bg-base"
  "bg-elevated"         = "--color-bg-elevated"
  "bg-sunken"           = "--color-bg-sunken"
  "content-primary"     = "--color-text-primary"
  "content-secondary"   = "--color-text-secondary"
  "content-muted"       = "--color-text-muted"
}

$prefixes = @("bg", "text", "border", "ring", "from", "to", "via", "divide", "outline", "fill", "stroke")

$files = Get-ChildItem -Recurse -Path $SrcRoot -Include "*.tsx","*.ts","*.css" |
  Where-Object { $_.FullName -notmatch "node_modules" }

$totalReplacements = 0

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -Encoding UTF8
  $original = $content

  foreach ($token in $tokenMap.Keys) {
    $cssVar = $tokenMap[$token]
    foreach ($prefix in $prefixes) {
      # Match with optional Tailwind variant prefix like hover:, focus:, md:, etc.
      # Pattern: (variants:)?prefix-token/NN
      $pattern = "(?<![a-zA-Z0-9_-])(?<variants>(?:[a-zA-Z0-9_-]+:)*)${prefix}-${token}/(?<pct>[0-9]+)"
      $matches = [regex]::Matches($content, $pattern)
      foreach ($m in $matches) {
        $pct = $m.Groups["pct"].Value
        $variants = $m.Groups["variants"].Value
        $old = "${variants}${prefix}-${token}/${pct}"
        $new = "${variants}${prefix}-[color-mix(in_srgb,var(${cssVar})_${pct}%,transparent)]"
        $content = $content.Replace($old, $new)
        $totalReplacements++
      }
    }
  }

  if ($content -ne $original) {
    Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Updated: $($file.FullName.Replace((Get-Location).Path+'\',''))"
  }
}

Write-Host ""
Write-Host "Total replacements: $totalReplacements"
