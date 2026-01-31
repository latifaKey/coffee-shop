<#
PowerShell setup script for creating PostgreSQL database and user, running Prisma migrations, and seeding the DB.
Run as: .\scripts\setup-postgresql.ps1
#>

param (
  [string]$Host = 'localhost',
  [int]$Port = 5432,
  [string]$DbName = 'barizta',
  [string]$AdminUser = 'postgres',
  [string]$AdminPassword,
  [string]$AppUser = 'barizta_user',
  [string]$AppPassword
)

function Prompt-SecureInput([string]$Message) {
  Write-Host -NoNewline "$Message: " -ForegroundColor Yellow
  return Read-Host -AsSecureString | ConvertFrom-SecureString
}

if (-not $AdminPassword) {
  Write-Host "Please enter your PostgreSQL admin password (used only for this command):"
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

# Check for 'psql' binary
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
  Write-Host "psql client not found in PATH. Please ensure PostgreSQL is installed and psql is in PATH before running this script." -ForegroundColor Red
  Write-Host "Common PostgreSQL client path example: 'C:\Program Files\PostgreSQL\16\bin\psql.exe'"
  exit 1
}

# Set PGPASSWORD environment variable for psql commands
$env:PGPASSWORD = $AdminPasswordPlain

Write-Host "Creating PostgreSQL database and user..." -ForegroundColor Cyan

# Create database
$createDbSql = "CREATE DATABASE $DbName WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE template0;"
$checkDbSql = "SELECT 1 FROM pg_database WHERE datname = '$DbName';"

Write-Host "Checking if database exists..." -ForegroundColor Yellow
$dbExists = psql -h $Host -p $Port -U $AdminUser -d postgres -t -c $checkDbSql 2>$null

if (-not $dbExists) {
  Write-Host "Creating database '$DbName'..." -ForegroundColor Yellow
  psql -h $Host -p $Port -U $AdminUser -d postgres -c $createDbSql
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Database '$DbName' created successfully." -ForegroundColor Green
  } else {
    Write-Host "Failed to create database." -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "Database '$DbName' already exists." -ForegroundColor Yellow
}

# Create user if not exists
$createUserSql = "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$AppUser') THEN CREATE USER $AppUser WITH PASSWORD '$AppPasswordPlain'; END IF; END `$`$;"

Write-Host "Creating user '$AppUser' (if not exists)..." -ForegroundColor Yellow
psql -h $Host -p $Port -U $AdminUser -d postgres -c $createUserSql

# Grant privileges
$grantSql = "GRANT ALL PRIVILEGES ON DATABASE $DbName TO $AppUser;"
Write-Host "Granting privileges to '$AppUser'..." -ForegroundColor Yellow
psql -h $Host -p $Port -U $AdminUser -d postgres -c $grantSql

# Grant schema privileges
$grantSchemaSql = "GRANT ALL ON SCHEMA public TO $AppUser;"
Write-Host "Granting schema privileges..." -ForegroundColor Yellow
psql -h $Host -p $Port -U $AdminUser -d $DbName -c $grantSchemaSql

# Clear PGPASSWORD
$env:PGPASSWORD = $null

Write-Host "`nDatabase setup complete!" -ForegroundColor Green
Write-Host "Connection string for .env file:" -ForegroundColor Cyan
Write-Host "DATABASE_URL=`"postgresql://$AppUser:$AppPasswordPlain@$Host:$Port/$DbName`"" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env file with the connection string above"
Write-Host "2. Run: npm install (to install pg package)"
Write-Host "3. Run: npx prisma generate"
Write-Host "4. Run: npx prisma migrate deploy (or prisma migrate dev)"
Write-Host "5. Run: npm run seed:all (if you want to seed data)"
