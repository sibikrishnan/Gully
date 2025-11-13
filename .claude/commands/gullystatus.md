Query the task tracking system and provide a concise status summary for quick session startup.

**CRITICAL:** Read `tools/tracker/data/status/current.json` for lightweight status (~300 tokens).

**Workflow:**
1. Read `tools/tracker/data/status/current.json` (hot data only)
2. Extract currentPhase and currentTask information
3. Format a concise status summary

**Optional (if more detail needed):**
- Read `tools/tracker/data/tasks/index.json` for full task list
- Read specific phase file: `tools/tracker/data/status/phases/{phaseId}.json`

Format the output as:
```
📍 Status: Phase X - [Phase Name]
⏳ Current: [task-id] - [title]
📊 Progress: X/Y tasks (Z%)
💡 Notes: [any blockers or important context]
```

**Token Optimization:**
- Primary path: ~300 tokens (status/current.json only)
- With details: ~800 tokens (current.json + tasks/index.json)
- OLD approach: ~2,000 tokens (monolithic PROJECT_STATUS.json)
- **Savings: 85% reduction**

Keep it concise - 3-5 sentences max.

**After completing the command, print token expenditure:**
```
🔢 Tokens: X,XXX used | XXX,XXX remaining (X.X% of budget)
```
