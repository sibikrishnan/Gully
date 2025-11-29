# Phase Review Protocol

**Purpose:** Structured end-of-phase review to optimize workflow and track progress.

**Duration:** Approximately 90 minutes at phase completion

---

## 1. Token Consumption Analysis (15 min)

### Track Usage
- [ ] Total tokens used this phase
- [ ] Tokens per day average
- [ ] Identify highest consumption sessions
- [ ] Compare to previous phase

### Identify Waste
- [ ] Hallucination loops (repeat requests)
- [ ] Loading unnecessary context files
- [ ] Duplicate searches/reads
- [ ] Over-verbose prompts

### Optimize
- [ ] Remove unnecessary files from context
- [ ] Refine prompting strategy
- [ ] Document token-efficient patterns
- [ ] Set target for next phase

**Action Items:**
- Archive completed feature branches
- Update .claude/.claude.md if needed
- Remove stale documentation

---

## 2. Progress Assessment (15 min)

### Completed vs Planned
- [ ] Features completed this phase
- [ ] Features planned but not done
- [ ] Unexpected work (bugs, changes)
- [ ] Time spent vs estimated

### Blockers
- [ ] Technical blockers encountered
- [ ] Knowledge gaps identified
- [ ] Dependencies missing
- [ ] External blockers

### Velocity Check
- [ ] On track for 7-phase MVP completion?
- [ ] Need to adjust timeline?
- [ ] Need to cut scope?
- [ ] Need to simplify approach?

**Action Items:**
- Update WEEK[N]_TASKS.md with status
- Adjust next phase plan if needed
- Document blockers and resolutions

---

## 3. Learning Documentation (15 min)

### What Worked
- [ ] Successful Claude patterns
- [ ] Effective prompting techniques
- [ ] Useful tools/commands discovered
- [ ] Time-saving workflows

### What Failed
- [ ] AI hallucinations encountered
- [ ] Bugs introduced by AI code
- [ ] Misunderstood requirements
- [ ] Over-engineered solutions

### Reusable Patterns
- [ ] Code patterns worth reusing
- [ ] Prompt templates that worked
- [ ] Project structure decisions
- [ ] Testing strategies

**Action Items:**
- Log patterns in personal notes
- Update project documentation
- Share learnings (blog/Twitter if desired)

---

## 4. Hallucination Prevention (10 min)

### Review Incorrect Suggestions
- [ ] What did AI suggest incorrectly?
- [ ] Why was it wrong?
- [ ] How did you catch it?
- [ ] How to prevent next time?

### Update Verification Checklist
- [ ] Add new verification steps
- [ ] Document red flags encountered
- [ ] Update Decision Framework
- [ ] Add to .claude/.claude.md if needed

### Strengthen Discipline
- [ ] Did you verify everything?
- [ ] Did you test before committing?
- [ ] Did you question complexity?
- [ ] Did you check costs?

**Action Items:**
- Update verification checklist
- Document hallucination examples
- Refine prompting to avoid issues

---

## 5. Cost Tracking (5 min)

### Verify Zero-Spend
- [ ] Confirm no monthly costs incurred
- [ ] Check free tier usage vs limits
- [ ] Any services approaching limits?
- [ ] Any accidental charges?

### Flag Payment Suggestions
- [ ] What paid services were suggested?
- [ ] What free alternatives used?
- [ ] Document workarounds
- [ ] Update "forbidden" list if needed

### Plan for Limits
- [ ] Docker Hub pull limits approaching?
- [ ] GitHub Actions minutes used?
- [ ] Free tier hosting limits?
- [ ] Plan mitigation strategies

**Action Items:**
- Document all cost-saving decisions
- Track free tier usage
- Plan for approaching limits

---

## 6. Context Management (10 min)

### Clean Up Files
- [ ] Remove stale files from project
- [ ] Archive completed branches
- [ ] Clean up TODO lists
- [ ] Remove unused dependencies

### Update Documentation
- [ ] Is .claude/.claude.md current?
- [ ] Is FULL_CONTEXT.md accurate?
- [ ] Are subsections up to date?
- [ ] Update phase number/status

### Verify Context Loading
- [ ] Test /gullycontext commands
- [ ] Verify subsections load correctly
- [ ] Check for broken references
- [ ] Update if structure changed

**Action Items:**
- Git clean up (delete merged branches)
- Update status indicators
- Verify all slash commands work

---

## 7. Code Quality Check (15 min)

### Test Coverage
- [ ] Current coverage percentage?
- [ ] Gaps in coverage?
- [ ] Critical paths tested?
- [ ] Add tests for new features?

### Security Vulnerabilities
- [ ] Run npm audit
- [ ] Check dependency versions
- [ ] Review authentication code
- [ ] Check for common vulnerabilities

### Error Handling
- [ ] All endpoints handle errors?
- [ ] User-friendly error messages?
- [ ] Logging sufficient?
- [ ] Edge cases considered?

### Code Duplication
- [ ] Repeated code patterns?
- [ ] Opportunities to refactor?
- [ ] Shared utilities needed?
- [ ] Document for future refactoring

### Coding Standards
- [ ] Follows naming conventions?
- [ ] TypeScript types consistent?
- [ ] Code formatting consistent?
- [ ] Comments where needed?

**Action Items:**
- Fix security vulnerabilities
- Add missing tests
- Refactor duplicated code (if time permits)
- Document technical debt

---

## 8. Next Phase Planning (5 min)

### Set Goals
- [ ] Primary goal for next phase
- [ ] Stretch goal if ahead
- [ ] Minimum acceptable progress
- [ ] Dependencies to address

### Prepare Context
- [ ] Update phase number in .claude/.claude.md
- [ ] Create/update PHASE[N]_TASKS.md
- [ ] Load necessary context sections
- [ ] Set up task tracking

### Identify Risks
- [ ] Potential blockers?
- [ ] Knowledge gaps to fill?
- [ ] Dependencies needed?
- [ ] Contingency plans?

**Action Items:**
- Create next phase's task file
- Update project status
- Set phase commitment

---

## Review Output Template

**File:** `.claude/reviews/WEEK[N]_REVIEW.md`

```markdown
# Week [N] Review

## Summary
- **Completed:** [X] features
- **Token Usage:** [Y]k tokens ([Z]% vs last week)
- **Velocity:** [On track / Behind / Ahead]

## Completed Features
1. Feature 1 - [brief description]
2. Feature 2 - [brief description]

## Blockers Resolved
- Blocker 1: [resolution]

## Key Learnings
- Learning 1
- Learning 2

## Token Optimization
- Saved tokens by: [strategy]
- Next week target: [X]k tokens

## Technical Debt
- Debt item 1: [when to address]

## Next Week Goals
- Primary: [goal]
- Stretch: [goal]

## Metrics
- Code coverage: [X]%
- API response time: [Y]ms
- Features completed: [Z]/7
```

---

## Success Criteria

**Good Week:**
- 1+ major features completed
- Token usage < previous week
- No critical blockers
- Learning documented
- Code quality maintained

**Needs Adjustment:**
- No features completed
- Token usage increased
- Multiple unresolved blockers
- No learning documentation
- Code quality degraded

---

**Reminder:** The review is for learning and optimization, not judgment. Be honest about what's working and what's not.
