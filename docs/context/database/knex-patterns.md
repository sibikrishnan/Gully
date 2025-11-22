# Knex Cross-Database Patterns

**Purpose:** Critical patterns for PostgreSQL/MySQL/SQLite compatibility

---

## 1. Insert & Fetch Pattern

**Rule:** Never rely on `insert()` return value (differs across databases)

**Pattern:**
```typescript
// ❌ DON'T: const [id] = await db().insert(data)
// ✅ DO: Use unique constraint to fetch
await db('user_sports').insert({ user_id, sport_name, skill_level });
const result = await db('user_sports').where({ user_id, sport_name }).first();
return result;
```

---

## 2. Error Code Handling

**Unique Constraint:**
- PostgreSQL: `'23505'`
- MySQL: `'ER_DUP_ENTRY'`
- SQLite: `'SQLITE_CONSTRAINT'`

**Foreign Key Violation:**
- PostgreSQL: `'23503'`
- MySQL: `'ER_NO_REFERENCED_ROW_2'`
- SQLite: `'SQLITE_CONSTRAINT_FOREIGNKEY'`

**Pattern:**
```typescript
try {
  await db('user_sports').insert(data);
} catch (error: any) {
  if (error.code === '23505' || error.code === 'ER_DUP_ENTRY' || error.code === 'SQLITE_CONSTRAINT') {
    throw new Error(`Duplicate: User already has ${sport_name}`);
  }
  throw error;
}
```

---

## 3. Count Type Coercion

**Rule:** `count()` returns string in some engines

**Pattern:**
```typescript
const [{ count }] = await db('user_sports').where({ user_id }).count('* as count');
expect(Number(count)).toBe(1); // Always wrap in Number()
```

---

**Source:** P2-PROF-T4.1 session (saved 5,988 tokens in debugging)
