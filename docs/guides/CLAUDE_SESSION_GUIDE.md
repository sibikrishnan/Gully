# Claude Code Session Template

Use this template to structure your Claude Code sessions for maximum efficiency and minimal message count.

---

## 📋 Pre-Session Checklist

Before starting a Claude Code session, prepare:

- [ ] **Clear objective** - What specific outcome do you want?
- [ ] **Context files ready** - Any existing code, docs, or specs to reference
- [ ] **Time budget** - How long should this take? (15min, 30min, 1hr max)
- [ ] **Success criteria** - How will you know when you're done?

---

## 🎯 Session Starter Templates

Copy and customize one of these prompts to start your session efficiently:

### Template 1: Feature Implementation
```
OBJECTIVE: [Implement X feature]

CONTEXT:
- Working on: [project/file name]
- Current state: [brief description]
- Dependencies: [any relevant libraries/files]

REQUIREMENTS:
1. [Specific requirement 1]
2. [Specific requirement 2]
3. [Specific requirement 3]

SUCCESS CRITERIA:
- [ ] [Testable outcome 1]
- [ ] [Testable outcome 2]

TIME BUDGET: [30 minutes]

Please start by reviewing [specific file/directory] and propose an implementation approach.
```

### Template 2: Debugging/Fix
```
ISSUE: [Clear description of the problem]

SYMPTOMS:
- [What's happening]
- [Error messages]
- [Expected vs actual behavior]

CONTEXT:
- File: [path/to/file]
- Recent changes: [what was modified]
- Environment: [Node 18, Python 3.11, etc.]

I've tried:
- [Thing 1 - didn't work because...]
- [Thing 2 - didn't work because...]

Please diagnose and fix, limiting investigation to [specific scope].
```

### Template 3: Refactoring
```
REFACTOR GOAL: [What to improve]

TARGET:
- Files: [list specific files]
- Current problems: [technical debt, performance, readability]

CONSTRAINTS:
- Must maintain: [existing functionality/APIs]
- Don't change: [files/modules to avoid]
- Preserve: [tests, compatibility, etc.]

APPROACH:
Please review the code first, then propose a refactoring plan before implementing.
```

### Template 4: Setup/Configuration
```
SETUP TASK: [Configure X for Y]

ENVIRONMENT:
- OS: [Mac/Linux/Windows]
- Project type: [Node/Python/etc.]
- Framework: [Next.js/FastAPI/etc.]

REQUIREMENTS:
1. [What needs to be set up]
2. [Integration points]
3. [Testing criteria]

Please provide step-by-step setup, testing each component before moving to the next.
```

### Template 5: Code Review/Analysis
```
REVIEW REQUEST: [What to analyze]

FILES TO REVIEW:
- [file1.js]
- [file2.py]

FOCUS AREAS:
- [ ] Performance bottlenecks
- [ ] Security issues
- [ ] Best practices
- [ ] [Other specific concern]

Please provide:
1. Summary of findings
2. Prioritized recommendations
3. Quick wins vs. major refactors
```

---

## 💬 Mid-Session Best Practices

### ✅ DO:
- **Be specific**: "Add error handling to the fetchUser function in api/users.js"
- **Confirm incrementally**: "Yes, that approach works. Implement step 1 first."
- **Provide quick context**: "This is for a Next.js 14 app using App Router"
- **Reference previous work**: "Using the auth setup from yesterday's session"
- **Set boundaries**: "Focus only on the frontend for now"

### ❌ DON'T:
- Give vague responses: "yes", "ok", "continue"
- Change requirements mid-stream without acknowledgment
- Let sessions exceed 50-60 messages without a break
- Skip testing/validation steps
- Ignore Claude's clarifying questions

---

## 🔄 When to Restart a Session

Restart if you've hit:
- **50+ messages** on a single task
- **Multiple direction changes** without clear resolution
- **Context confusion** (Claude forgetting earlier decisions)
- **Scope creep** (original goal lost)

**How to restart effectively:**
```
SESSION RECAP (for new session):
- Completed: [what's done]
- Current state: [where we are]
- Next goal: [specific next step]
- Files modified: [list them]

Continuing with: [clear next objective]
```

---

## 📊 Session Types by Message Budget

### Quick Task (5-15 messages)
- Simple bug fixes
- Configuration changes
- File creation from template
- Code formatting/linting

### Standard Task (15-35 messages)
- Feature implementation (small-medium)
- Test writing
- Refactoring a module
- Integration setup

### Complex Task (35-60 messages)
- Multi-file refactoring
- New system component
- Performance optimization
- Architecture design + implementation

### ⚠️ If approaching 60 messages:
1. Summarize progress
2. Identify remaining work
3. Start fresh session with recap

---

## 🎓 Command Patterns for Efficiency

### Progressive Disclosure
```
Step 1: "Review the auth system in src/auth/"
Step 2: "Now add OAuth support using the pattern you identified"
Step 3: "Add tests for the OAuth flow"
```

### Explicit Validation Gates
```
"Implement the database migration. STOP and show me the migration 
file before running it."
```

### Scoped Exploration
```
"Search the codebase for all API calls to /users endpoint. 
List them first, don't modify yet."
```

### Batch Operations
```
"For each component in src/components/forms/:
1. Add TypeScript types
2. Add error boundaries
3. Update tests
Work through them one at a time, confirming after each."
```

---

## 📁 Maintain a Session Log

Create `CLAUDE_SESSIONS.md` in your project:

```markdown
# Claude Code Session Log

## 2025-11-04: User Authentication Setup
- **Duration**: 25 minutes
- **Messages**: 18
- **Completed**: 
  - Added JWT middleware
  - Created auth tests
  - Updated API routes
- **Next**: Add refresh token logic

## 2025-11-03: Database Migration
- **Duration**: 45 minutes  
- **Messages**: 32
- **Completed**:
  - Created migration scripts
  - Tested on dev DB
- **Issues**: Foreign key constraint needed manual fix
- **Next**: Run on staging
```

---

## 🚀 Quick Reference Card

**Starting a session:**
1. State objective clearly
2. Provide context files/paths
3. Set success criteria
4. Mention time budget

**During session:**
- Be specific in responses
- Confirm before big changes
- Test incrementally
- Reference past work

**Ending session:**
- Summarize what was completed
- Note any pending items
- Save state for next time

**Emergency restart:**
- Summarize progress
- List modified files
- State clear next goal

---

## 🎯 Example: Before & After

### ❌ INEFFICIENT (45 messages)
```
User: "help with my app"
Claude: "What kind of app?"
User: "web app"
Claude: "What framework?"
User: "react"
Claude: "What do you need help with?"
User: "errors"
Claude: "What errors?"
...
```

### ✅ EFFICIENT (8 messages)
```
User: "ISSUE: React 18 app showing 'Cannot read property' error in 
UserProfile.jsx line 42 when user data is null.

CONTEXT: Next.js 14, using SWR for data fetching
FILE: components/UserProfile.jsx

Please add null check and loading state."

Claude: [provides solution]
User: "Perfect. Now add the same pattern to AdminProfile.jsx"
Claude: [implements]
User: "Works. Commit with message 'Add null checks to profile components'"
```
**Remember**: The goal is clear communication, not perfect communication. A well-structured 15-message session beats a wandering 150-message session every time.