# Jest Testing Patterns

**Load with:** `/gullycontext testing`

---

## Mocking Class Instances

**Problem:** Controller instantiates classes directly (`new Repository()`), naive mocking fails.

**Wrong:**
```typescript
jest.mock('../../repositories/user.repository');
const mockRepo = new UserRepository() as jest.Mocked<...>;
mockRepo.method = jest.fn(); // ❌ Controller already has real instance
```

**Right:**
```typescript
// 1. Declare mocks FIRST
const mockAddUser = jest.fn();

// 2. Mock module with factory
jest.mock('../../repositories/user.repository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    addUser: mockAddUser
  }))
}));

// 3. Import AFTER mocks
import { createUser } from '...controller';

// 4. Use in tests
mockAddUser.mockResolvedValue({ id: 1, name: 'test' });
```

**Cost if wrong:** ~4,000 tokens (3 test runs + 3 edits)

---

## Import Order

**Rule:** Import module-under-test AFTER `jest.mock()`.

```typescript
// ❌ Wrong
import { handler } from './controller';
jest.mock('./repository');

// ✅ Right
jest.mock('./repository');
import { handler } from './controller';
```

---

## Unit vs Integration Tests

**Unit (mocked):**
- Test logic paths, authorization
- Fast execution
- Mock error scenarios

**Integration (real DB):**
- Test full stack behavior
- Verify actual error codes
- Test database state changes

Both are valuable, not redundant.
