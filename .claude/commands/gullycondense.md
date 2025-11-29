---
description: Condense current session into 150-line structured log and save to docs/sessions/
---

# Condense Session Log

Request Claude to analyze the current conversation session and generate a condensed 150-line structured log.

## Usage

```bash
/gullycondense [session-name]
```

**Example:**
```bash
/gullycondense P2-PROF-T4.2-endpoint-implementation
```

---

## What This Does

Claude will:
1. Analyze the current conversation history
2. Extract key execution phases, decisions, and learnings
3. Generate a 150-line condensed log in markdown format
4. Save to `/Users/sibikrishnan/Documents/Gully/docs/sessions/{session-name}-session-log.md`

---

## Output Format

The condensed log will include:
- **Metadata**: Task ID, token usage, duration
- **Execution Sequence**: Phase-by-phase breakdown with token tracking
- **Key Learnings**: Patterns discovered, mistakes made, portability issues
- **Files Created/Modified**: Line counts and purposes
- **Test Results**: Pass/fail counts, coverage
- **Token Efficiency**: Breakdown by phase (context, implementation, testing, debugging)

---

## When to Use

- ✅ At end of task completion
- ✅ After debugging complex issues
- ✅ When discovering new patterns worth documenting
- ❌ Don't use mid-task (wait until completion)

---

**Next Step:** Use `/gullyanalyze {filename}` to extract patterns and update context files
