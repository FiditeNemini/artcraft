# This runs Artcraft Rust in dev mode on Windows

Write-Host "Running Artcraft Rust in Dev Mode..."
Write-Host ""
Write-Host "You'll need to launch the frontend dev server as a second script!"  -ForegroundColor red -BackgroundColor white
Write-Host ""

$env:TAURI_FRONTEND_PATH=".\frontend"
$env:TAURI_APP_PATH=".\crates\desktop\artcraft"

cargo tauri dev --config ".\crates\desktop\artcraft\tauri.artcraft_3d.no_dev.conf.json"
