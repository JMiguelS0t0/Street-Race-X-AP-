# 🏎️ Street Race X — Branching Strategy & Git Workflow

## Branch Structure

```
main              ← Production-ready code (protected)
  │
  └── develop     ← Integration branch (optional, recommended)
        │
        ├── feature/...   ← New features
        ├── bugfix/...    ← Bug fixes
        ├── refactor/...  ← Code refactoring
        ├── docs/...      ← Documentation
        ├── test/...      ← Tests
        └── chore/...     ← Maintenance

  └── hotfix/...          ← Critical production fixes (from main)
  └── release/...         ← Release preparation
```

---

## Branch Naming Convention

### Format

```
<type>/<ticket-id>-<short-description-in-kebab-case>
```

### Types

| Type       | Purpose                                  | Base Branch | Merge Into      |
|------------|------------------------------------------|-------------|-----------------|
| `feature`  | New functionality or enhancement         | `develop`   | `develop`       |
| `bugfix`   | Fix a bug (non-critical)                 | `develop`   | `develop`       |
| `hotfix`   | Critical fix for production              | `main`      | `main` + `develop` |
| `release`  | Prepare a new version for release        | `develop`   | `main` + `develop` |
| `docs`     | Documentation only changes               | `develop`   | `develop`       |
| `refactor` | Code restructuring (no behavior change)  | `develop`   | `develop`       |
| `test`     | Adding or updating tests                 | `develop`   | `develop`       |
| `chore`    | Dependencies, configs, maintenance       | `develop`   | `develop`       |

### Rules

1. **All lowercase** — no uppercase letters
2. **Kebab-case** — use hyphens to separate words
3. **Max 80 characters** — keep names concise
4. **No special characters** — only `a-z`, `0-9`, `-`, `/`, `.`
5. **Descriptive** — 2-5 words that explain the purpose
6. **Ticket prefix** (optional) — include issue/ticket ID when available

### ✅ Good Examples

```
feature/add-vehicle-photos
feature/srx-42-user-avatar-upload
bugfix/fix-rank-calculation
bugfix/srx-15-challenge-status-error
hotfix/critical-auth-token-expiry
release/v1.2.0
docs/update-api-endpoints
refactor/clean-auth-controller
test/add-challenge-unit-tests
chore/update-prisma-dependencies
```

### ❌ Bad Examples

```
Feature/AddVehiclePhotos          ← uppercase, PascalCase
fix-bug                           ← missing type prefix
feature/add_vehicle_photos        ← underscores instead of hyphens
my-branch                         ← non-descriptive, no type
feature/this-is-a-very-long-name-that-describes-every-single-detail-of-the-change-and-goes-on-forever
                                  ← too long
```

---

## Workflow

### Starting New Work

Use the interactive branch creator:

```powershell
# Interactive mode (guided prompts)
.\scripts\create-branch.ps1

# Quick mode with parameters
.\scripts\create-branch.ps1 -Type feature -Description "add vehicle photos"

# With ticket ID
.\scripts\create-branch.ps1 -Type bugfix -Ticket "SRX-42" -Description "fix rank calculation"

# Dry run (preview without creating)
.\scripts\create-branch.ps1 -Type feature -Description "test" -DryRun
```

### Commit Messages (Conventional Commits)

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Examples:**

```bash
git commit -m "feat(vehicles): add photo upload endpoint"
git commit -m "fix(challenges): correct rank calculation on win"
git commit -m "docs(readme): update API endpoint documentation"
git commit -m "refactor(auth): extract token validation to middleware"
git commit -m "chore(deps): update prisma to v6.20"
```

**Commit types mapping:**

| Branch Type | Commit Prefix |
|------------|---------------|
| `feature`  | `feat:`       |
| `bugfix`   | `fix:`        |
| `hotfix`   | `fix:`        |
| `docs`     | `docs:`       |
| `refactor` | `refactor:`   |
| `test`     | `test:`       |
| `chore`    | `chore:`      |

### Pull Request Flow

1. Push your branch to remote
2. Create a Pull Request to `develop` (or `main` for hotfixes)
3. Branch name is automatically validated by CI
4. Request code review
5. Squash & merge when approved

---

## Quick Reference

```powershell
# See available options
.\scripts\create-branch.ps1 -Help

# Create a feature branch
.\scripts\create-branch.ps1 -Type feature -Description "add leaderboard filters"

# Create a bugfix
.\scripts\create-branch.ps1 -Type bugfix -Ticket "SRX-10" -Description "fix vehicle limit check"

# Create a hotfix from main
.\scripts\create-branch.ps1 -Type hotfix -Description "patch auth token validation"

# Create a release
.\scripts\create-branch.ps1 -Type release -Description "1.0.0"
```
