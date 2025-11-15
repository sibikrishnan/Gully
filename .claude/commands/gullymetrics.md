**PURPOSE:** Track and report token usage metrics to validate optimization estimates.

## Usage:
- `/gullymetrics` - Show current session token usage summary
- `/gullymetrics log` - Log current usage to OPTIMIZATION_LOG.md for historical tracking

## Workflow:

1. **Extract current token usage**
   - Parse the conversation for `<system_warning>Token usage:` messages
   - Find the MOST RECENT token usage warning
   - Extract: tokens used, total budget, remaining tokens
   - Calculate: percentage used, tokens per message (approximate)

2. **Analyze command efficiency** (if available in history)
   - Look for `/gullystatus`, `/gullycontinue`, `/gullypause` invocations
   - Estimate token cost for each based on files read
   - Compare against optimization estimates in OPTIMIZATION_LOG.md

3. **Display summary**
   ```
   📊 Token Usage Metrics - Current Session

   Total Used: X,XXX / 200,000 (X.X%)
   Remaining: XXX,XXX tokens

   Command Usage (estimated):
   - /gullystatus: ~XXX tokens (expected: 400)
   - /gullycontinue: ~XXX tokens (expected: 200)
   - /gullypause: ~XXX tokens (expected: 500)

   Efficiency:
   ✅ On track / ⚠️ Higher than expected / 🎉 Better than expected

   Recent operations:
   - [timestamp]: File read (XXX tokens)
   - [timestamp]: Command execution (XXX tokens)
   ```

4. **If "log" argument provided**
   - Append metrics to docs/OPTIMIZATION_LOG.md under new "Session Metrics" section
   - Include: date, session duration, total tokens, commands used, efficiency notes

## Token Optimization:
- This command uses ~50 tokens (no file reads, just conversation parsing)
- Helps validate that optimizations are working as expected

## What to Look For:

**Expected Token Costs (Post-Optimization with STATUS.md):**
- `/gullystatus`: ~500 tokens (STATUS.md read)
- `/gullycontinue`: ~200 tokens (targeted task section read from TASK_HISTORY.md)
- `/gullypause`: ~800 tokens (read + update STATUS.md + TASK_HISTORY.md)
- File reads: ~5 tokens per line

**Red Flags:**
- Commands using 2-3x expected tokens → investigate redundant reads
- Session hitting 50% token budget before significant progress → optimize workflow
- Multiple full-file reads of same file → cache or parse from conversation

## Example Output:
```
📊 Token Usage Metrics - Current Session

Total Used: 23,784 / 200,000 (11.9%)
Remaining: 176,216 tokens

Command Usage (estimated):
- /gullystatus: ~480 tokens (expected: 500) ✅
- /gullycontinue: ~190 tokens (expected: 200) ✅

Efficiency: 🎉 Better than expected

Recent operations:
- Read TASK_HISTORY.md (lines 1-50): ~250 tokens
- Read gullycontinue.md: ~200 tokens
- Edit operations: ~150 tokens each

Session is healthy. Optimizations are working as expected.
```

**After completing the command, print token expenditure:**
```
🔢 Tokens: X,XXX used | XXX,XXX remaining (X.X% of budget)
```
