# GitHub Actions - Claude PR Reviews

Automated PR reviews using Claude Code via GitHub Actions.

## Setup

1. **Add API Key to Repository Secrets**
   ```
   Repository Settings → Secrets and variables → Actions → New secret
   Name: ANTHROPIC_API_KEY
   Value: sk-ant-...
   ```

2. **How It Works**
   - Triggers on PRs to `master` or `main` branch
   - Reads review criteria from `.github/review-criteria.json`
   - Calls Claude API with PR diff and metadata
   - Posts review as PR comment

## Changing Review Criteria

Edit `.github/review-criteria.json`:

```json
{
  "criteria": "your, custom, focus, areas"
}
```

Or use a preset:
```json
{
  "active_preset": "feature"
}
```

**Available Presets:**
- `foundation` - Architecture, planning, code quality
- `feature` - Implementation, testing, security
- `refactor` - Maintainability, performance
- `bugfix` - Root cause, regression tests
- `docs` - Documentation quality
- `security` - Deep security review

## Current Configuration

**Active:** `foundation`
**Criteria:** System architecture, approach to project and planning excellence, code quality

---

*Last updated: 2025-11-05*
