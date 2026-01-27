<#
PowerShell setup script for creating MySQL database and user, running Prisma migrations, and seeding the DB.
Run as: .\scripts\setup-mysql.ps1
#>

param (
  [string]$Host = 'localhost',
  [int]$Port = 3306,
  [string]$DbName = 'barizta',
  [string]$AdminUser = 'root',
  [string]$AdminPassword,
  [string]$AppUser = 'barizta_user',
  [string]$AppPassword
)

function Prompt-SecureInput([string]$Message) {
  Write-Host -NoNewline "$Message: " -ForegroundColor Yellow
  return Read-Host -AsSecureString | ConvertFrom-SecureString
}

if (-not $AdminPassword) {
  Write-Host "Please enter your MySQL admin password (used only for this command):"
  $AdminPassword = Read-Host -AsSecureString
  $AdminPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($AdminPassword))
} else {
  $AdminPasswordPlain = $AdminPassword
}

if (-not $AppPassword) {
  Write-Host "Enter a password for the new app DB user ($AppUser):"
  $AppPassword = Read-Host -AsSecureString
  $AppPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($AppPassword))
} else {
  $AppPasswordPlain = $AppPassword
}

# Check for 'mysql' binary
if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
  Write-Host "mysql client not found in PATH. Please ensure mysql is installed and in PATH before running this script." -ForegroundColor Red
  Write-Host "Common MySQL client path example: 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe'"
  exit 1
}

# Build SQL statements
$sql = @"
CREATE DATABASE IF NOT EXISTS `$DbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create app user and grant privileges
CREATE USER IF NOT EXISTS '$AppUser'@'localhost' IDENTIFIED BY '$AppPasswordPlain';
GRANT ALL PRIVILEGES ON `$DbName`.* TO '$AppUser'@'localhost';
FLUSH PRIVILEGES;
"@

# Optionally drop existing DB
$drop = Read-Host "Do you want to drop existing database '$DbName' if it exists? (yes/no) [no]"
if ($drop -eq 'yes') {
  $sql = "DROP DATABASE IF EXISTS `$DbName`;`n$sql"
}

# Execute SQL via mysql
Write-Host "Running SQL to ensure database ($DbName) and user ($AppUser) exist..."
$escapedPassword = $AdminPasswordPlain
$cmd = "mysql -h $Host -P $Port -u $AdminUser --password=$escapedPassword -e \"$sql\""
Write-Host "Running: $cmd"
Invoke-Expression $cmd
if ($LASTEXITCODE -ne 0) {
  Write-Host "mysql command failed; please check credentials and connection." -ForegroundColor Red
  exit 1
}

# Update .env file
$envExample = Join-Path $PSScriptRoot "..\.env.example"
$envFile = Join-Path $PSScriptRoot "..\.env"
$databaseUrl = "DATABASE_URL=\"mysql://$AppUser:$AppPasswordPlain@$Host:$Port/$DbName\""

if (-not (Test-Path $envFile)) {
  Write-Host "Creating .env file from .env.example (if exists) and appending DATABASE_URL"
  if (Test-Path $envExample) {
    Copy-Item $envExample $envFile -Force
  } else {
    New-Item -Path $envFile -ItemType File -Force
  }
}

# replace or add DATABASE_URL
(Get-Content $envFile) -notmatch '^DATABASE_URL=' | Out-File $envFile -Encoding utf8
Add-Content $envFile $databaseUrl
Write-Host ".env updated with DATABASE_URL (credentials created)."

# install deps and run migrations
Write-Host "Installing dependencies (npm install)..."
pnpm_installed = (Get-Command pnpm -ErrorAction SilentlyContinue) -ne $null
if ($pnpm_installed) {
  pnpm install
} else {
  npm install
}

Write-Host "Creating Prisma migration and applying it..."
npx prisma migrate dev --name init --preview-feature

Write-Host "Generating Prisma client"
npx prisma generate

Write-Host "Seeding database (products, team, news)"
npm run seed:all

Write-Host "Done. Your database should be ready. Start dev server with: npm run dev" -ForegroundColor Green

