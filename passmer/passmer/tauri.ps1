param(
    [Parameter(Mandatory=$false)]
    [string]$Environment
)

if (-not $Environment) {
    Write-Host "Please specify 'dev' or 'build' as the environment parameter."
    exit 1
}

if ($Environment -eq "dev") {
    Copy-Item -Recurse -Force src-tauri/src/languages ./target/debug
    npx tauri dev
} elseif ($Environment -eq "build") {
    Copy-Item -Recurse -Force src-tauri/src/languages ./target/release
    npx tauri build
} else {
    Write-Host "Invalid parameter. Please specify 'dev' or 'build'."
    exit 1
}