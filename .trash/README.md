# Trash Directory

**Purpose:** Soft-delete staging area for files before permanent deletion.

## Usage

Files moved here are staged for deletion but can be recovered if needed.

## Organization

Files are organized by date moved:
```
/.trash
└── YYYY-MM-DD/
    └── [deleted files]
```

## Retention Policy

- **Review Period:** Files remain here for 30 days
- **Cleanup Trigger:** End of phase or manual cleanup
- **Permanent Deletion:** After review period expires

## When Files Come Here

1. **Session artifacts** after phase completion
2. **Outdated documentation** that's been replaced
3. **Failed experiments** that didn't work out
4. **Duplicate files** discovered during cleanup

## Recovery

To recover a file:
```bash
cp .trash/YYYY-MM-DD/filename destination/
```

## Permanent Deletion

To permanently delete:
```bash
rm -rf .trash/YYYY-MM-DD/
```

---

**Last Updated:** 2025-11-11
**Automation:** Manual for now, will be automated by subagent enforcer later
