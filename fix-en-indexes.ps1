# Fix English module index pages - replace Chinese link text with English titles from frontmatter
$enDir = "docs\en"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Get all module index files (including 总索引)
$indexFiles = Get-ChildItem "$enDir\模块*索引.md"
$indexFiles += Get-ChildItem "$enDir\衡元宙文库*索引.md"

foreach ($idxFile in $indexFiles) {
    Write-Host "Processing: $($idxFile.Name)"
    $content = [System.IO.File]::ReadAllText($idxFile.FullName, $utf8NoBom)
    $changed = 0

    # Match markdown links: [Chinese text](/en/XXXX_filename.html)
    $pattern = '\[([^\]]+)\]\(/en/([^)]+\.html)\)'
    $newContent = [regex]::Replace($content, $pattern, {
        param($m)
        $chineseText = $m.Groups[1].Value
        $htmlFileName = $m.Groups[2].Value
        # Remove .html extension and find corresponding .md file
        $mdFileName = $htmlFileName -replace '\.html$', '.md'
        $mdPath = Join-Path $enDir $mdFileName

        if (Test-Path $mdPath) {
            $mdContent = [System.IO.File]::ReadAllText($mdPath, $utf8NoBom)
            $title = $null

            # Try frontmatter title
            $fmMatch = [regex]::Match($mdContent, '(?ms)^---\s*\r?\n([\s\S]*?)\r?\n---')
            if ($fmMatch.Success) {
                $fmBlock = $fmMatch.Groups[1].Value
                $titleMatch = [regex]::Match($fmBlock, '(?m)^title:\s*(.+)$')
                if ($titleMatch.Success) {
                    $title = $titleMatch.Groups[1].Value.Trim().Trim('"').Trim("'")
                }
            }
            # Fallback to H1
            if (-not $title) {
                $h1Match = [regex]::Match($mdContent, '(?m)^#\s+(.+)$')
                if ($h1Match.Success) {
                    $title = $h1Match.Groups[1].Value.Trim()
                }
            }

            if ($title -and $title -ne $chineseText) {
                $script:changed++
                return "[$title](/en/$htmlFileName)"
            }
        }
        return $m.Value
    })

    if ($changed -gt 0) {
        [System.IO.File]::WriteAllText($idxFile.FullName, $newContent, $utf8NoBom)
        Write-Host "  -> Replaced $changed link texts"
    } else {
        Write-Host "  -> No changes needed"
    }
}
Write-Host "`nDone."
