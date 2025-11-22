# Task-to-Context Mapping

Intelligent mapping from task characteristics to relevant context files/sections for token-efficient context loading.

**Purpose**: Auto-select minimal context based on task tags, description, and type.

---

## Mapping Rules

### By Task Tags

| Tag Pattern | Context Files | Sections | Reasoning |
|-------------|---------------|----------|-----------|
| `routes`, `endpoints` | arch/structure.md | `#routes`, `#middleware` | Route definition patterns |
| `middleware` | arch/structure.md | `#middleware`, `#error-handling` | Middleware chain patterns |
| `controller` | arch/structure.md | `#controllers` | Controller patterns |
| `repository` | arch/structure.md, database/knex-patterns.md | `#repositories`, full file | Repository patterns + Knex |
| `validation` | arch/structure.md | `#validation` | Validation schema patterns |
| `auth`, `jwt` | arch/structure.md, database/tables.md | `#auth-middleware`, `#users-table` | Auth patterns + users schema |
| `sports`, `user_sports` | database/tables.md | `#user_sports-table` | user_sports table schema |
| `team`, `teams` | database/tables.md | `#teams-table`, `#team_members-table` | Team tables schema |
| `challenge`, `challenges` | database/tables.md | `#challenges-table` | Challenges table schema |
| `match`, `matches` | database/tables.md | `#matches-table` | Matches table schema |
| `test`, `testing` | workflow/principles.md | `#testing-standards` | Test patterns |
| `e2e` | workflow/principles.md | `#e2e-testing` | E2E test patterns |
| `integration` | workflow/principles.md | `#integration-testing` | Integration test patterns |

### By Task Description Keywords

| Keyword | Context Files | Sections |
|---------|---------------|----------|
| `POST /api/` | arch/structure.md | `#routes`, `#controllers` |
| `GET /api/` | arch/structure.md | `#routes`, `#controllers` |
| `PATCH /api/` | arch/structure.md | `#routes`, `#controllers` |
| `DELETE /api/` | arch/structure.md | `#routes`, `#controllers` |
| `soft delete` | database/tables.md, arch/structure.md | `#deleted_at-pattern`, `#soft-delete` |
| `search`, `filter` | database/knex-patterns.md | `#query-building`, `#filtering` |
| `pagination` | database/knex-patterns.md | `#pagination` |
| `JOIN` | database/knex-patterns.md, database/tables.md | `#joins`, relevant tables |
| `cache`, `caching` | database/redis.md | full file |
| `migration` | database/knex-patterns.md | `#migrations` |
| `index`, `indexes` | database/indexes.md | full file |

### By Parent Task ID

| Parent Task | Context Files | Sections | Reasoning |
|-------------|---------------|----------|-----------|
| `P2-PROF-T1` | database/tables.md | `#users-table`, `#user_sports-table` | User profile data |
| `P2-PROF-T2` | database/tables.md | `#users-table` | User update operations |
| `P2-PROF-T3` | database/tables.md | `#users-table`, `#deleted_at-pattern` | Soft delete user |
| `P2-PROF-T4` | database/tables.md | `#user_sports-table` | User sports management |
| `P2-PROF-T5` | database/tables.md, database/knex-patterns.md | `#users-table`, `#query-building` | User search |
| `P3-TEAM-T*` | database/tables.md | `#teams-table`, `#team_members-table` | Team management |

---

## Context Load Strategies

### Level 1: Minimal (Default)
**Load only specific sections from specific files**
- **When**: Task has clear, narrow scope (e.g., "add route")
- **Example**: routes task → arch/structure.md `#routes` section only
- **Token cost**: ~30-80 lines

### Level 2: Targeted
**Load full file(s) for specific area**
- **When**: Task spans multiple related concepts (e.g., "repository with validation")
- **Example**: repository task → arch/structure.md `#repositories` + database/knex-patterns.md (full)
- **Token cost**: ~100-200 lines

### Level 3: Comprehensive
**Load multiple files across sections**
- **When**: Task touches multiple system areas (e.g., "new feature with route + controller + repo + tests")
- **Example**: Full feature → arch/structure.md (routes, controllers, repos) + database/tables.md (specific table) + workflow/principles.md (testing)
- **Token cost**: ~200-400 lines

---

## Auto-Inference Algorithm

```
1. Parse task JSON:
   - Extract tags[]
   - Extract description keywords
   - Extract parent_id

2. Build context requirement set:
   - Map tags to context files/sections (from table above)
   - Map description keywords to context files/sections
   - Map parent_id to context files/sections
   - Deduplicate overlapping contexts

3. Determine granularity:
   IF context requirement set has < 3 sections:
     Load section-level (minimal)
   ELSE IF context requirement set has 3-5 sections from same file:
     Load file-level (targeted)
   ELSE:
     Load multiple files (comprehensive)

4. Load context:
   - Use CONTEXT_MAP.md for file paths
   - Read files with Read tool
   - Extract sections if section-level
   - Return formatted context

5. Report token efficiency:
   "Loaded X lines from Y files/sections (Z% of full context)"
```

---

## Example: P2-PROF-T4.3

**Task JSON:**
```json
{
  "id": "P2-PROF-T4.3",
  "tags": ["user-service", "routes", "middleware", "sports", "e2e", "phase-2"],
  "description": "Implement routes for POST/DELETE /api/users/:id/sports with middleware chain",
  "dependencies": ["P2-PROF-T4.2"]
}
```

**Auto-inference:**
1. Tags match:
   - `routes` → arch/structure.md `#routes`
   - `middleware` → arch/structure.md `#middleware`
   - `sports` → database/tables.md `#user_sports-table`
   - `e2e` → workflow/principles.md `#e2e-testing`

2. Description keywords match:
   - `POST /api/` → arch/structure.md `#routes`, `#controllers`
   - `DELETE /api/` → arch/structure.md `#routes`, `#controllers`
   - `middleware chain` → arch/structure.md `#middleware`

3. Parent task match:
   - `P2-PROF-T4` → database/tables.md `#user_sports-table`

4. Deduplicate:
   - arch/structure.md: `#routes`, `#middleware` (2 sections, same file)
   - database/tables.md: `#user_sports-table` (1 section)
   - workflow/principles.md: `#e2e-testing` (1 section)

5. Strategy: **Minimal** (3 specific sections, < 100 lines total)

**Load result:**
```
✅ Auto-loaded context for P2-PROF-T4.3

📊 arch/structure.md (sections: routes, middleware)
[~50 lines of route + middleware patterns]

📊 database/tables.md (section: user_sports-table)
[~25 lines of user_sports schema]

📊 workflow/principles.md (section: e2e-testing)
[~20 lines of E2E test patterns]

Token efficiency: 95 lines loaded vs 850 lines (89% savings)
```

---

## Section Extraction Syntax

For section-level loading, use markdown heading syntax:

```
file.md#section-name
```

Examples:
- `arch/structure.md#routes` → Extract "## Routes" section
- `database/tables.md#user_sports-table` → Extract "### user_sports" section
- `workflow/principles.md#testing-standards` → Extract "## Testing Standards" section

**Extraction rules:**
1. Find heading matching `#section-name` (case-insensitive, normalize hyphens/underscores)
2. Extract from heading to next heading of same or higher level
3. Include all nested subsections
4. Return extracted content with heading

---

**Last Updated**: 2025-11-16
**Version**: 1.0
