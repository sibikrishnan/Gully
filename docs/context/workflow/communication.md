# Claude-Human Communication Guidelines

**Purpose:** How Claude and Human should interact effectively for best outcomes.

---

## Claude's Responsibilities

### 1. Ask Questions Frequently

**Don't assume, verify understanding with user.**

**When to ask:**
- Before implementing complex features
- When multiple approaches exist
- When requirements are ambiguous
- When suggested solution costs money
- When deviating from established patterns
- When unsure about priorities

**How to ask:**
```
"Before I proceed, let me confirm my understanding:
- You want [X]
- This will [Y]
- The approach is [Z]
Is this correct?"
```

---

### 2. Confirm Requirements

**Before starting work, summarize what you'll do.**

**Template:**
```
I'll implement [feature] with:
- [Component 1]
- [Component 2]
- [Component 3]

Files to modify: [list]
Estimated changes: ~[N] lines
Dependencies: [list if any]

Ready to proceed? (yes/no)
```

**Purpose:**
- Catch misunderstandings early
- Set expectations
- Allow user to course-correct
- Build trust

---

### 3. Request Context When Needed

**Tell user which `/gullycontext` command to run.**

**Examples:**
```
"I need architecture details to implement this correctly.
Please run: /gullycontext arch/services"

"I need database schema information.
Please run: /gullycontext database/tables"

"I need to understand the MVP scope for this feature.
Please run: /gullycontext mvp/in-scope"
```

**Purpose:**
- Load only needed context
- Save tokens
- Show user what information is relevant
- Teach user about context system

---

### 4. Summarize Understanding

**Before starting implementation, recap the plan.**

**Template:**
```
Here's my understanding:
1. [Step 1]
2. [Step 2]
3. [Step 3]

This will result in: [outcome]
Trade-offs: [if any]
Risks: [if any]

Shall I proceed?
```

---

### 5. Flag Uncertainties Immediately

**Don't proceed with assumptions when uncertain.**

**Red flags:**
- "I assume you want..."
- "I'll just use..."
- "Probably we should..."
- "This might work..."

**Instead say:**
```
"I'm uncertain about [X].

Option A: [description]
Option B: [description]

Which approach do you prefer?"
```

---

### 6. Be Transparent About Limitations

**Admit when you don't know or need more information.**

**Examples:**
```
"I don't have enough context about [X].
Could you run: /gullycontext [section]?"

"I'm not certain about the best approach here.
Let me present the options and you decide."

"This is outside my current context.
What additional information do you have?"
```

---

### 7. Provide Decision Rationale

**Explain WHY, not just WHAT.**

**Bad:**
"Let's use Redis for this."

**Good:**
"Let's use Redis for leaderboards because:
- Fast sorted set operations
- Built-in ranking functions
- We already have Redis running
- No additional costs"

---

### 8. Warn About Costs

**Flag anything that costs money IMMEDIATELY.**

**Template:**
```
⚠️ COST WARNING
The suggested approach would require:
- [Service]: $[X]/month
- [Service]: $[Y]/month

Free alternatives:
1. [Alternative 1]
2. [Alternative 2]

Should we use a free alternative?
```

---

### 9. Suggest Context Loading

**Proactively tell user what context would help.**

**Examples:**
```
"For this database work, it would help to load:
/gullycontext database/tables"

"Since we're working on architecture decisions:
/gullycontext arch/structure
/gullycontext workflow/antipatterns"

"To understand MVP scope:
/gullycontext mvp/in-scope"
```

---

## Human's Responsibilities

### 1. Provide Clear Requirements

**Be specific about what you want.**

**Bad:**
"Add auth to the app"

**Good:**
"Implement email/password signup endpoint at POST /api/auth/signup that:
- Validates email format
- Hashes password with bcrypt
- Creates user record
- Returns JWT token"

---

### 2. Flag When Claude Goes Off-Track

**Interrupt if heading wrong direction.**

**Examples:**
```
"Stop - this is more complex than needed.
Simpler approach: [describe]"

"This costs money. Find free alternative."

"Not needed for MVP. Skip this."
```

---

### 3. Ask for Explanations

**Request clarification when code/approach unclear.**

**Examples:**
```
"Why did you choose this approach?"

"Explain this code block to me."

"What are the trade-offs here?"

"Is there a simpler way?"
```

---

### 4. Provide Feedback

**Let Claude know what's working / not working.**

**Examples:**
```
"Good - this matches requirements perfectly."

"This is over-engineered. Simplify."

"Perfect level of detail in explanation."

"Too verbose - be more concise."
```

---

### 5. Run Suggested Context Commands

**When Claude requests context, load it.**

**Claude says:**
"Please run: /gullycontext database/tables"

**You do:**
```
/gullycontext database/tables
```

---

### 6. Verify Before Accepting

**Don't blindly accept code - review it.**

**Checklist:**
- [ ] Do you understand what it does?
- [ ] Is it unnecessarily complex?
- [ ] Does it introduce costs?
- [ ] Can you test it?
- [ ] Does it match requirements?

---

## Communication Patterns

### Pattern 1: Feature Implementation

**Human:** "Add user profile endpoint"

**Claude:** "Let me confirm requirements. Should this endpoint:
- Return which fields? (id, email, name, avatar, bio?)
- Require authentication?
- Allow updating profile or read-only?

Also, should I load: /gullycontext database/tables?"

**Human:** "Yes to auth, read-only for now. Yes, load database context."

**Claude:** *Reads context, then summarizes plan*

---

### Pattern 2: Architecture Decision

**Human:** "How should we handle file uploads?"

**Claude:** "Before suggesting, let me understand:
- What file types? (images, videos, documents?)
- Expected file sizes?
- Storage budget? (should be $0 for MVP)

I should probably load: /gullycontext mvp/in-scope and /gullycontext arch/stack"

**Human:** "Images only, max 5MB, $0 budget. Yes load those."

**Claude:** *Presents options with local filesystem approach*

---

### Pattern 3: Complexity Check

**Claude:** "I'm about to implement X with:
- Service layer abstraction
- Repository pattern
- Dependency injection
- Event emitter for side effects

This seems complex. Should I simplify for MVP?"

**Human:** "Yes - simplify. Just direct database calls for now."

**Claude:** "Got it. Simpler approach: controller → model → database."

---

## Key Communication Principles

1. **Frequent communication > Silent assumptions**
2. **Confirm before implementing**
3. **Request context explicitly**
4. **Explain rationale**
5. **Flag costs immediately**
6. **Summarize understanding**
7. **Question complexity**
8. **Verify everything**

---

## Anti-Patterns in Communication

### Claude Anti-Patterns ❌
- Assuming requirements without asking
- Proceeding when uncertain
- Not explaining why
- Suggesting paid services without warning
- Not requesting needed context
- Over-confidence in uncertain areas

### Human Anti-Patterns ❌
- Vague requirements ("make it work")
- Not interrupting when off-track
- Accepting code without understanding
- Not providing feedback
- Ignoring context loading requests
- Expecting Claude to read your mind

---

## Success Metrics

**Good Communication:**
- Requirements clear before coding
- Both parties aligned on approach
- Context loaded as needed
- Uncertainties addressed early
- Token usage efficient

**Poor Communication:**
- Multiple rewrites due to misunderstanding
- Implementing wrong features
- Unnecessary complexity
- High token waste
- Frustration on both sides

---

**Goal:** Stay aligned, ship working code, learn together through constant communication.
