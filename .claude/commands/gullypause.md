**PURPOSE:** Automate pausing current task and moving it to the "Paused Tasks" section.

## Usage:
- `/gullypause` - Pause current task with interactive reason prompt
- `/gullypause "reason here"` - Pause with explicit reason

## Workflow:

1. **Identify current task**
   - Check conversation history for the most recent task being worked on
   - Look for `/gullycontinue` output or task references in recent messages
   - If ambiguous, ask user which task to pause

2. **Gather pause information**
   - If reason not provided as argument, ask user: "Why are you pausing this task?"
   - Extract: task number, task name, current progress, blocking issues

3. **Update TASK_HISTORY.md**
   - Find the task section (e.g., `### ⏳ Task 3.1:`)
   - Change emoji from `⏳` to `⏸️`
   - Add `status=paused` to the heading line
   - Add pause metadata AFTER the heading:
     ```markdown
     **Paused:** 2025-11-03
     **Reason:** [User-provided reason]
     **Progress:** [What's been completed so far]
     **To Resume:** [Next steps when resuming]
     ```

4. **Move to Paused Tasks section**
   - Cut the entire task section from "Pending Tasks"
   - If "Paused Tasks" section doesn't exist, create it AFTER "Pending Tasks" section
   - Paste the task there

5. **Update Current Status**
   - Update the "Task Paused:" line in Current Status section (lines 1-20)
   - Update "Next Task:" to point to the new next pending task

6. **Confirm to user**
   ```
   ⏸️ Task X.Y paused successfully

   Reason: [reason]
   Progress saved: [what's done]

   Next pending task: Task Y.Z - [Name]

   Use /gullycontinue to resume any paused task
   ```

## Token Optimization:
- Total operation: ~500 tokens (targeted reads/writes only)
- Saves manual editing time and ensures consistent format

## Example Output:
```
⏸️ Task 3.1 - Auth Utilities & Middleware paused successfully

Reason: Need to set up testing infrastructure first
Progress saved:
  - JWT utilities implemented
  - Passport strategy configured
  - Tests not yet written

Next pending task: Task 3.0 - Setup Testing Infrastructure

Use /gullycontinue to resume any paused task or continue with Task 3.0
```
