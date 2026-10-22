$sourceDir = "d:\Source\PE_Practice\BookShelf"
$destDir = "d:\Source\PE_Practice\QE190108"
$staging = "d:\Source\PE_Practice\staging_QE190108"
$zipPath = "$destDir\QE190108.zip"

if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir }
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

New-Item -ItemType Directory -Force -Path $staging | Out-Null

# List of root files to copy
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

# Directories to copy
$dirs = @("src", "assets", "scripts")
foreach ($d in $dirs) {
  $p = Join-Path $sourceDir $d
  if (Test-Path $p) {
    Copy-Item -Recurse $p (Join-Path $staging $d)
  }
}

# Verify NO forbidden files in staging
$forbidden = @(".env", ".git", "node_modules", ".expo")
foreach ($bad in $forbidden) {
  $badPath = Join-Path $staging $bad
  if (Test-Path $badPath) {
    throw "Forbidden file/dir found in staging: $badPath"
  }
}

# Create zip with package.json at root
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($staging, $zipPath)

# Clean up staging
Remove-Item -Recurse -Force $staging

Write-Output "Created: $zipPath"
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
Write-Output "Zip Entries Count: $($zip.Entries.Count)"
$rootEntries = $zip.Entries | Where-Object { $_.FullName -notmatch '/' } | Select-Object -ExpandProperty FullName
Write-Output "Root entries: $($rootEntries -join ', ')"
$zip.Dispose()
