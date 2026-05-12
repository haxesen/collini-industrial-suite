# Collini Industrial Suite - Backup Script
# Készíti egy tömörített mentést a forráskódról a 'backups' mappába

$projectName = "Collini_Industrial_Suite"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $PSScriptRoot "backups"
$backupFile = Join-Path $backupDir "$($projectName)_$timestamp.zip"

# Mappa létrehozása ha nem létezik
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "Backup indítása..." -ForegroundColor Cyan

# Kizárandó mappák (node_modules, .git, .gemini)
$excludeList = @("node_modules", ".git", ".gemini", "dist", "backups")

# Ideiglenes mappába másolás a zip-eléshez
$tempDir = Join-Path $env:TEMP "collini_temp_$timestamp"
New-Item -ItemType Directory -Path $tempDir | Out-Null

Copy-Item -Path ".\*" -Destination $tempDir -Recurse -Exclude $excludeList

Compress-Archive -Path "$tempDir\*" -DestinationPath $backupFile -Force

Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Backup sikeresen elkészült: $backupFile" -ForegroundColor Green
