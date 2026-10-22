$sourceDir = "d:\Source\PE_Practice\BookShelf"
$destDir = "d:\Source\PE_Practice\QE190108"
$staging = "d:\Source\PE_Practice\staging_QE190108"
$zipPath = "$destDir\QE190108.zip"
$docxReport = "$destDir\QE190108.docx"

if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir }
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

New-Item -ItemType Directory -Force -Path $staging | Out-Null

# 1. Copy root project files
$files = @(
  "package.json",
  "package-lock.json",
  "app.json",
  "App.js",
  "index.js",
  "eas.json",
  "eslint.config.js",
  "LICENSE",
  "AGENTS.md",
  "firestore.rules",
  ".env.example",
  ".gitignore"
)

foreach ($f in $files) {
  $p = Join-Path $sourceDir $f
  if (Test-Path $p) {
    Copy-Item $p (Join-Path $staging $f)
  }
}

# 2. Copy source directories
$dirs = @("src", "assets", "scripts")
foreach ($d in $dirs) {
  $p = Join-Path $sourceDir $d
  if (Test-Path $p) {
    Copy-Item -Recurse $p (Join-Path $staging $d)
  }
}

# 3. Include Word report (QE190108.docx) for "2-in-1" submission package
if (Test-Path $docxReport) {
  Copy-Item $docxReport (Join-Path $staging "QE190108.docx")
  Write-Output "[+] Attached report: QE190108.docx into submission root"
} else {
  Write-Warning "Report file not found at: $docxReport"
}

# 4. Strict check: ensure NO forbidden/secret/heavy files in staging
$forbidden = @(".env", ".git", "node_modules", ".expo")
foreach ($bad in $forbidden) {
  $badPath = Join-Path $staging $bad
  if (Test-Path $badPath) {
    throw "Forbidden file/dir found in staging: $badPath"
  }
}

# 5. Create zip with normalized forward-slash paths (cross-platform compatible)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$tempZip = Join-Path $destDir "temp_build.zip"
if (Test-Path $tempZip) { Remove-Item -Force $tempZip }

$zipStream = [System.IO.File]::Create($tempZip)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

$allFiles = Get-ChildItem -Path $staging -Recurse -File
foreach ($file in $allFiles) {
  $relPath = $file.FullName.Substring($staging.Length + 1).Replace('\', '/')
  $entry = $archive.CreateEntry($relPath, [System.IO.Compression.CompressionLevel]::Optimal)
  $fs = $file.OpenRead()
  $es = $entry.Open()
  $fs.CopyTo($es)
  $es.Close()
  $fs.Close()
}

$archive.Dispose()
$zipStream.Close()

Move-Item -Force $tempZip $zipPath

# Clean up staging directory
Remove-Item -Recurse -Force $staging

Write-Output "`n[SUCCESS] Package created: $zipPath"
$checkZip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
Write-Output "Total entries: $($checkZip.Entries.Count)"
Write-Output "`n--- Root level contents in zip: ---"
$checkZip.Entries | Where-Object { $_.FullName -notmatch '/' } | ForEach-Object {
  Write-Output " - $($_.FullName) ($($_.Length) bytes)"
}
$checkZip.Dispose()
