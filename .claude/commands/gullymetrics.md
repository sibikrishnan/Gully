**PURPOSE:** Log and analyze token usage metrics over time to validate optimization effectiveness.

## Usage:
- `/gullymetrics log [note]` - Log current session metrics to OPTIMIZATION_LOG.md with optional note
- `/gullymetrics compare` - Compare current session against historical averages

**Note:** For real-time token breakdown, use `/context` instead. This command focuses on historical tracking and trend analysis.

---

## Command: `/gullymetrics log [note]`

**What it does:**
Captures current session state and appends it to `docs/OPTIMIZATION_LOG.md` for long-term tracking.

**Workflow:**

1. **Get current token metrics via /context**
   ```bash
   # Run /context and capture output
   # Parse the line: "XXk/200k tokens (XX%)"
   # Extract breakdown: System (X.Xk), Tools (X.Xk), Messages (X.Xk), etc.
   ```

2. **Calculate session metrics**
   - Total tokens used
   - Conversation tokens (Messages only)
   - System overhead (System + Tools + MCP + Agents + Memory)
   - Autocompact buffer
   - Efficiency ratio: Conversation / Total (excluding autocompact)

3. **Identify work completed (from git)**
   ```bash
   # Count commits in current session (rough estimate)
   # List files modified in recent commits
   # Extract task info from commit messages
   ```

4. **Append to OPTIMIZATION_LOG.md**
   ```markdown
   ### Session Log - YYYY-MM-DD HH:MM

   **Branch:** phase2-prof-t1
   **Total Tokens:** 92,000 / 200,000 (46%)
   **Conversation:** 28,400 tokens (30.9% of total)
   **System Overhead:** 19,600 tokens (21.3% of total)
   **Autocompact Buffer:** 45,000 tokens (48.9% of total)

   **Efficiency Ratio:** 0.59 (conversation / used tokens excl. buffer)

   **Work Completed:**
   - 3 commits
   - Files: .claude/hooks/pre-tool-use.sh, .claude/settings.local.json
   - Tasks: Security fix, settings optimization

   **Command Usage:** (if tracked)
   - /gullystatus: N/A
   - /gullycontinue: N/A
   - /gullypause: N/A

   **Notes:** [user-provided note if any]

   ---
   ```

5. **Display summary to user**
   ```
   ✅ Session logged to docs/OPTIMIZATION_LOG.md

   📊 Session Summary:
   - Tokens: 92k/200k (46%)
   - Conversation: 28.4k (efficiency: 0.59)
   - Work: 3 commits, 2 files modified
   ```

---

## Command: `/gullymetrics compare`

**What it does:**
Compares current session against historical averages from OPTIMIZATION_LOG.md.

**Workflow:**

1. **Get current session metrics** (same as log)

2. **Parse OPTIMIZATION_LOG.md**
   - Extract all previous "Session Log" entries
   - Calculate averages:
     - Avg total tokens used
     - Avg conversation tokens
     - Avg efficiency ratio
     - Avg commits per session

3. **Compare and display**
   ```
   📊 Session Comparison

   Current Session:
   - Tokens: 92k (46%)
   - Conversation: 28.4k
   - Efficiency: 0.59
   - Commits: 3

   Historical Average (last 10 sessions):
   - Tokens: 78k (39%)
   - Conversation: 24k
   - Efficiency: 0.62
   - Commits: 2.5

   Analysis:
   ⚠️  Higher token usage (+18% vs avg)
   ⚠️  Lower efficiency (-5% vs avg)
   ✅ More commits (+20% vs avg)

   Recommendation: Session is productive but using more tokens than average.
   Consider if current task complexity justifies the overhead.
   ```

4. **Trend detection**
   - If last 3 sessions show increasing token usage: "📈 Token usage trending up"
   - If efficiency dropping: "⚠️ Efficiency declining over last N sessions"
   - If stable: "✅ Metrics stable and consistent"

---

## Implementation Notes:

**For accurate tracking, this command should:**
1. Parse `/context` output (not `<system_warning>` messages)
2. Store timestamps for session duration calculation
3. Avoid reading large files - focus on git metadata
4. Keep log entries concise (~10-15 lines each)

**Token Cost:**
- `/gullymetrics log`: ~800 tokens (read OPTIMIZATION_LOG.md, append, git status)
- `/gullymetrics compare`: ~1,200 tokens (parse all historical entries)

**Best Practices:**
- Run `/gullymetrics log` at natural breakpoints: end of phase, before switching tasks, before closing session
- Run `/gullymetrics compare` weekly or when you suspect efficiency issues
- Add notes to log entries to capture context (e.g., "large refactor", "many test iterations")
