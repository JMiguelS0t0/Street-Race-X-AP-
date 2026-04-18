#!/usr/bin/env pwsh
# =============================================================================
# 🏎️  Street Race X — Git Branch Creator
# =============================================================================
# Interactive script to create Git branches following best practices
# and naming conventions (Git Flow / GitHub Flow hybrid).
#
# Usage:
#   .\scripts\create-branch.ps1
#   .\scripts\create-branch.ps1 -Type feature -Description "add user avatars"
#   .\scripts\create-branch.ps1 -Type bugfix -Ticket "SRX-42" -Description "fix rank calculation"
# =============================================================================

param(
    [ValidateSet("feature", "bugfix", "hotfix", "release", "docs", "refactor", "test", "chore")]
    [string]$Type,

    [string]$Ticket,

    [string]$Description,

    [string]$BaseBranch,

    [switch]$DryRun,

    [switch]$Help
)

# ─── Colors & Helpers ────────────────────────────────────────────────────────

function Write-Header {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║        🏎️  Street Race X — Branch Creator               ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$StepNum, [string]$Message)
    Write-Host "  [$StepNum] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message -ForegroundColor White
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "  ❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ️  $Message" -ForegroundColor DarkCyan
}

function Write-BranchGuide {
    Write-Host ""
    Write-Host "  ┌─────────────────────────────────────────────────────────────────┐" -ForegroundColor DarkGray
    Write-Host "  │  Branch Type Guide                                              │" -ForegroundColor DarkGray
    Write-Host "  ├─────────────────────────────────────────────────────────────────┤" -ForegroundColor DarkGray
    Write-Host "  │  " -ForegroundColor DarkGray -NoNewline
    Write-Host "feature  " -ForegroundColor Green -NoNewline
    Write-Host " → New functionality or enhancement                   │" -ForegroundColor Gray
    Write-Host "  │  " -ForegroundColor DarkGray -NoNewline
    Write-Host "bugfix   " -ForegroundColor Yellow -NoNewline
    Write-Host " → Fix a bug found in development/staging             │" -ForegroundColor Gray
    Write-Host "  │  " -ForegroundColor DarkGray -NoNewline
    Write-Host "hotfix   " -ForegroundColor Red -NoNewline
    Write-Host " → Critical fix for production (from main)            │" -ForegroundColor Gray
    Write-Host "  │  " -ForegroundColor DarkGray -NoNewline
    Write-Host "release  " -ForegroundColor Magenta -NoNewline
    Write-Host " → Prepare a new release version                      │" -ForegroundColor Gray
    Write-Host "  │  " -ForegroundColor DarkGray -NoNewline
    Write-Host "docs     " -ForegroundColor Cyan -NoNewline
    Write-Host " → Documentation changes only                         │" -ForegroundColor Gray
    Write-Host "  │  " -ForegroundColor DarkGray -NoNewline
    Write-Host "refactor " -ForegroundColor Blue -NoNewline
    Write-Host " → Code refactoring (no new features/fixes)           │" -ForegroundColor Gray
    Write-Host "  │  " -ForegroundColor DarkGray -NoNewline
    Write-Host "test     " -ForegroundColor DarkYellow -NoNewline
    Write-Host " → Adding or updating tests                           │" -ForegroundColor Gray
    Write-Host "  │  " -ForegroundColor DarkGray -NoNewline
    Write-Host "chore    " -ForegroundColor DarkGreen -NoNewline
    Write-Host " → Maintenance, dependencies, configs                 │" -ForegroundColor Gray
    Write-Host "  └─────────────────────────────────────────────────────────────────┘" -ForegroundColor DarkGray
    Write-Host ""
}

function Show-Help {
    Write-Header
    Write-Host "  USAGE:" -ForegroundColor Yellow
    Write-Host "    .\scripts\create-branch.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "  OPTIONS:" -ForegroundColor Yellow
    Write-Host "    -Type <type>         Branch type (feature|bugfix|hotfix|release|docs|refactor|test|chore)" -ForegroundColor White
    Write-Host "    -Ticket <id>         Ticket/issue ID (e.g., SRX-42, #15)" -ForegroundColor White
    Write-Host "    -Description <text>  Short description of the branch purpose" -ForegroundColor White
    Write-Host "    -BaseBranch <name>   Base branch to create from (default: auto-detected)" -ForegroundColor White
    Write-Host "    -DryRun              Show what would be created without executing" -ForegroundColor White
    Write-Host "    -Help                Show this help message" -ForegroundColor White
    Write-Host ""
    Write-BranchGuide
    Write-Host "  EXAMPLES:" -ForegroundColor Yellow
    Write-Host "    .\scripts\create-branch.ps1" -ForegroundColor Gray
    Write-Host "    .\scripts\create-branch.ps1 -Type feature -Description 'add user avatars'" -ForegroundColor Gray
    Write-Host "    .\scripts\create-branch.ps1 -Type bugfix -Ticket SRX-42 -Description 'fix rank calc'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  NAMING CONVENTION:" -ForegroundColor Yellow
    Write-Host '    <type>/<ticket>-<description-in-kebab-case>' -ForegroundColor Gray
    Write-Host '    feature/SRX-42-add-vehicle-photos' -ForegroundColor Green
    Write-Host '    bugfix/fix-rank-calculation' -ForegroundColor Yellow
    Write-Host '    hotfix/critical-auth-bypass' -ForegroundColor Red
    Write-Host '    release/v1.2.0' -ForegroundColor Magenta
    Write-Host ""
}

# ─── Slug Generator ─────────────────────────────────────────────────────────

function ConvertTo-Slug {
    param([string]$Text)

    $slug = $Text.ToLower().Trim()

    # Remove accents / diacritics
    $bytes = [System.Text.Encoding]::GetEncoding("Cyrillic").GetBytes($slug)
    $slug = [System.Text.Encoding]::ASCII.GetString($bytes)

    # Replace spaces, underscores, and special chars with hyphens
    $slug = $slug -replace '[^a-z0-9\-]', '-'

    # Collapse multiple hyphens
    $slug = $slug -replace '-{2,}', '-'

    # Trim leading/trailing hyphens
    $slug = $slug.Trim('-')

    # Limit length to 50 chars for branch name readability
    if ($slug.Length -gt 50) {
        $slug = $slug.Substring(0, 50).TrimEnd('-')
    }

    return $slug
}

# ─── Validation ──────────────────────────────────────────────────────────────

function Test-GitRepo {
    $result = git rev-parse --is-inside-work-tree 2>&1
    return $result -eq "true"
}

function Test-CleanWorkingTree {
    $status = git status --porcelain 2>&1
    return [string]::IsNullOrWhiteSpace($status)
}

function Test-BranchExists {
    param([string]$BranchName)
    $exists = git branch --list $BranchName 2>&1
    $existsRemote = git branch -r --list "origin/$BranchName" 2>&1
    return (-not [string]::IsNullOrWhiteSpace($exists)) -or (-not [string]::IsNullOrWhiteSpace($existsRemote))
}

# ─── Default Base Branch Logic ───────────────────────────────────────────────

function Get-DefaultBaseBranch {
    param([string]$BranchType)

    # Check if 'develop' branch exists
    $hasDevelop = git branch --list "develop" 2>&1
    $hasDevelopRemote = git branch -r --list "origin/develop" 2>&1
    $developExists = (-not [string]::IsNullOrWhiteSpace($hasDevelop)) -or (-not [string]::IsNullOrWhiteSpace($hasDevelopRemote))

    switch ($BranchType) {
        "hotfix"  { return "main" }
        "release" { return if ($developExists) { "develop" } else { "main" } }
        default   { return if ($developExists) { "develop" } else { "main" } }
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
#  MAIN SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════

if ($Help) {
    Show-Help
    exit 0
}

Write-Header

# ─── Preflight Checks ────────────────────────────────────────────────────────

Write-Step "1" "Running preflight checks..."

if (-not (Test-GitRepo)) {
    Write-Error-Custom "Not inside a Git repository. Please navigate to the project root."
    exit 1
}
Write-Success "Git repository detected"

# Check for uncommitted changes (warn but don't block)
if (-not (Test-CleanWorkingTree)) {
    Write-Host ""
    Write-Host "  ⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    git status --short | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkYellow }
    Write-Host ""
    $proceed = Read-Host "  Continue anyway? (y/N)"
    if ($proceed -ne 'y' -and $proceed -ne 'Y') {
        Write-Info "Aborted. Commit or stash your changes first."
        exit 0
    }
}

# Fetch latest
Write-Info "Fetching latest from remote..."
git fetch origin --quiet 2>&1 | Out-Null
Write-Success "Remote data updated"

# ─── Step 2: Branch Type ─────────────────────────────────────────────────────

if (-not $Type) {
    Write-Host ""
    Write-Step "2" "Select branch type:"
    Write-BranchGuide

    $typeOptions = @("feature", "bugfix", "hotfix", "release", "docs", "refactor", "test", "chore")
    $typeInput = Read-Host "  Enter branch type"

    if ($typeInput -in $typeOptions) {
        $Type = $typeInput
    } else {
        Write-Error-Custom "Invalid branch type: '$typeInput'"
        Write-Info "Valid types: $($typeOptions -join ', ')"
        exit 1
    }
} else {
    Write-Step "2" "Branch type: $Type"
}
Write-Success "Type selected: $Type"

# ─── Step 3: Ticket / Issue ID (Optional) ────────────────────────────────────

if (-not $Ticket) {
    Write-Host ""
    Write-Step "3" "Enter ticket/issue ID (optional, press Enter to skip):"
    Write-Host "       Examples: SRX-42, #15, JIRA-100" -ForegroundColor DarkGray
    $Ticket = Read-Host "  Ticket ID"
}

if ($Ticket) {
    # Clean the ticket ID
    $Ticket = $Ticket.Trim().ToUpper() -replace '[^A-Z0-9\-#]', ''
    Write-Success "Ticket: $Ticket"
} else {
    Write-Info "No ticket ID provided (will be omitted from branch name)"
}

# ─── Step 4: Description ─────────────────────────────────────────────────────

if (-not $Description) {
    Write-Host ""

    if ($Type -eq "release") {
        Write-Step "4" "Enter version number (e.g., 1.0.0, 2.1.0):"
        $Description = Read-Host "  Version"
    } else {
        Write-Step "4" "Enter a short description of the change:"
        Write-Host "       Be concise but descriptive (2-5 words ideal)" -ForegroundColor DarkGray
        Write-Host "       Examples: 'add vehicle photos', 'fix rank calculation'" -ForegroundColor DarkGray
        $Description = Read-Host "  Description"
    }
}

if ([string]::IsNullOrWhiteSpace($Description)) {
    Write-Error-Custom "Description is required."
    exit 1
}

# ─── Step 5: Build Branch Name ───────────────────────────────────────────────

Write-Host ""
Write-Step "5" "Building branch name..."

if ($Type -eq "release") {
    # Release branches: release/v1.0.0
    $version = $Description -replace '[^0-9\.]', ''
    if ($version -notmatch '^\d+\.\d+\.\d+$') {
        Write-Error-Custom "Invalid version format. Use semantic versioning: X.Y.Z (e.g., 1.0.0)"
        exit 1
    }
    $branchName = "$Type/v$version"
} else {
    $slug = ConvertTo-Slug -Text $Description

    if ($Ticket) {
        $ticketSlug = $Ticket.ToLower() -replace '#', ''
        $branchName = "$Type/$ticketSlug-$slug"
    } else {
        $branchName = "$Type/$slug"
    }
}

# Validate total length
if ($branchName.Length -gt 80) {
    Write-Host "  ⚠️  Branch name is very long ($($branchName.Length) chars). Truncating..." -ForegroundColor Yellow
    $branchName = $branchName.Substring(0, 80).TrimEnd('-')
}

Write-Success "Branch name: $branchName"

# ─── Step 6: Base Branch ─────────────────────────────────────────────────────

if (-not $BaseBranch) {
    $BaseBranch = Get-DefaultBaseBranch -BranchType $Type
}

Write-Host ""
Write-Step "6" "Base branch: $BaseBranch"

# Verify base branch exists
$baseExists = git branch --list $BaseBranch 2>&1
$baseExistsRemote = git branch -r --list "origin/$BaseBranch" 2>&1
if ([string]::IsNullOrWhiteSpace($baseExists) -and [string]::IsNullOrWhiteSpace($baseExistsRemote)) {
    Write-Error-Custom "Base branch '$BaseBranch' does not exist locally or remotely."
    exit 1
}
Write-Success "Base branch '$BaseBranch' verified"

# ─── Step 7: Check for Conflicts ─────────────────────────────────────────────

if (Test-BranchExists -BranchName $branchName) {
    Write-Error-Custom "Branch '$branchName' already exists!"
    Write-Info "Choose a different name or delete the existing branch first."
    exit 1
}
Write-Success "Branch name is available"

# ─── Step 8: Confirmation ────────────────────────────────────────────────────

Write-Host ""
Write-Host "  ┌─────────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "  │  Summary                                                        │" -ForegroundColor Cyan
Write-Host "  ├─────────────────────────────────────────────────────────────────┤" -ForegroundColor Cyan
Write-Host "  │  Type:        $Type" -ForegroundColor White
if ($Ticket) {
    Write-Host "  │  Ticket:      $Ticket" -ForegroundColor White
}
Write-Host "  │  Description: $Description" -ForegroundColor White
Write-Host "  │  Branch:      $branchName" -ForegroundColor Green
Write-Host "  │  Base:        $BaseBranch" -ForegroundColor White
Write-Host "  └─────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Info "DRY RUN — No changes were made."
    Write-Host ""
    Write-Host "  Commands that would execute:" -ForegroundColor Yellow
    Write-Host "    git checkout $BaseBranch" -ForegroundColor Gray
    Write-Host "    git pull origin $BaseBranch" -ForegroundColor Gray
    Write-Host "    git checkout -b $branchName" -ForegroundColor Gray
    Write-Host "    git push -u origin $branchName" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

$confirm = Read-Host "  Create this branch? (Y/n)"
if ($confirm -eq 'n' -or $confirm -eq 'N') {
    Write-Info "Aborted."
    exit 0
}

# ─── Step 9: Execute ─────────────────────────────────────────────────────────

Write-Host ""
Write-Step "9" "Creating branch..."

# Switch to base branch
Write-Info "Switching to '$BaseBranch'..."
git checkout $BaseBranch 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to checkout '$BaseBranch'"
    exit 1
}

# Pull latest
Write-Info "Pulling latest changes..."
git pull origin $BaseBranch 2>&1 | Out-Null

# Create new branch
Write-Info "Creating branch '$branchName'..."
git checkout -b $branchName 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to create branch '$branchName'"
    exit 1
}

# Push and set upstream
Write-Info "Pushing to remote and setting upstream..."
$pushResult = git push -u origin $branchName 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️  Could not push to remote (you may push later with: git push -u origin $branchName)" -ForegroundColor Yellow
} else {
    Write-Success "Branch pushed to remote"
}

# ─── Done! ───────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║  🎉 Branch created successfully!                            ║" -ForegroundColor Green
Write-Host "  ╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║                                                              ║" -ForegroundColor Green
Write-Host "  ║  Branch: $branchName" -ForegroundColor Green
Write-Host "  ║                                                              ║" -ForegroundColor Green
Write-Host "  ║  Next steps:                                                 ║" -ForegroundColor Green
Write-Host "  ║    1. Start coding your changes                              ║" -ForegroundColor Green
Write-Host "  ║    2. Commit with conventional messages:                     ║" -ForegroundColor Green
Write-Host "  ║       git commit -m '$Type`: short description'               ║" -ForegroundColor Green
Write-Host "  ║    3. When ready, create a Pull Request to $BaseBranch" -ForegroundColor Green
Write-Host "  ║                                                              ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
