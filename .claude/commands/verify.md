---
description: Verify current setup - check Docker, database, and dependencies
---

Run verification checks for the development environment:

1. Check Docker services status:
   ```bash
   cd backend && docker compose ps
   ```

2. Check database connection and migrations:
   ```bash
   npm run migrate:status
   ```

3. Query database to verify data:
   ```bash
   docker exec gully-postgres psql -U gully_user -d gully_dev -c "SELECT COUNT(*) FROM users;"
   ```

4. Check git status and recent commits:
   ```bash
   git status
   git log --oneline -3
   ```

Provide a summary:
```
✅/❌ Docker Services: [status]
✅/❌ Database: [X migrations, Y records]
✅/❌ Git: [branch, clean/dirty]
```

Flag any issues that need attention.
