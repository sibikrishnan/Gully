# Frontend (Next.js)

**Status:** 📦 Placeholder - Planned for Week 3+

---

## Current Status

This directory is a placeholder for the frontend application, which will be implemented starting in **Week 3** of the 12-week MVP timeline.

**Current Week:** Week 2 (Backend foundation)

---

## Planned Technology Stack

### Framework
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### Key Features (Week 3-4)
- User registration and login UI
- Team management interface
- Dashboard for user/team statistics
- Responsive design (mobile-first)

### Authentication
- JWT token storage (localStorage/cookies)
- Protected routes
- Auto-refresh tokens
- Integration with backend `/api/auth/*` endpoints

---

## Week-by-Week Plan

### Week 3: Frontend Foundation
- Initialize Next.js project
- Set up authentication flow
- Create basic page layouts
- Implement user registration/login forms

### Week 4: User & Team UI
- User profile pages
- Team creation and management
- Team invitation system
- Basic navigation

### Weeks 5-6: Challenge UI
- Challenge creation interface
- Match tracking UI
- Score reporting forms

### Weeks 9-10: Stats & Leaderboards
- User statistics dashboard
- Team statistics
- Sport-specific leaderboards

---

## Directory Structure (Planned)

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth-related pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   ├── teams/
│   │   ├── matches/
│   │   └── stats/
│   ├── components/             # React components
│   │   ├── ui/                 # UI components
│   │   ├── forms/              # Form components
│   │   └── layout/             # Layout components
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # API client
│   │   ├── auth.ts             # Auth utilities
│   │   └── utils.ts            # Helper functions
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── tests/                      # Frontend tests
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## Development Setup (Future)

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
# Runs on http://localhost:3000
```

### Build
```bash
npm run build
npm start
```

### Testing
```bash
npm test                    # Run tests
npm run test:coverage       # Coverage report
```

---

## API Integration

### Backend Connection
- **Backend URL:** `http://localhost:5000` (development)
- **API Prefix:** `/api`
- **Authentication:** JWT bearer token

### Example API Client
```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
```

---

## Design System (Planned)

### Colors
- Primary: Sports-themed colors (team colors customizable)
- Secondary: Neutral grays
- Success: Green (wins, completed challenges)
- Error: Red (losses, errors)

### Components
- Buttons
- Forms (input, select, checkbox)
- Cards (team cards, match cards, stat cards)
- Navigation (sidebar, mobile menu)
- Modals
- Toasts (notifications)

### Typography
- Headings: Bold, clear hierarchy
- Body: Readable, accessible
- Code: Monospace for IDs/codes

---

## Testing Strategy

### Unit Tests
- Component rendering
- User interactions
- Form validation
- Utility functions

### Integration Tests
- API integration
- Authentication flows
- Page navigation
- Form submissions

### E2E Tests (Playwright)
- User registration/login flow
- Team creation flow
- Challenge creation flow
- Match reporting flow

---

## Current Focus (Week 1-2)

**Backend foundation must be complete before frontend work begins:**

✅ Week 1 Complete:
- User authentication (signup, login)
- JWT token generation
- Database setup
- Test infrastructure

⏳ Week 2 Current:
- Team service implementation
- Team management endpoints
- Team invitation system

**Next:** After Week 2 backend is complete, frontend work begins in Week 3.

---

## Related Documentation

### Backend API
- **[API Endpoints](../docs/planning/API_ENDPOINTS.md)** - Complete API documentation
- **[Backend README](../backend/README.md)** - Backend documentation

### Architecture
- **[Architecture Overview](../docs/architecture/OVERVIEW.md)** - System architecture
- **[Technology Stack](../.claude/context/arch/stack.md)** - Tech stack details

### Planning
- **[Roadmap](../docs/planning/ROADMAP.md)** - 12-week development plan
- **[Features](../docs/planning/FEATURES.md)** - Feature specifications

---

## Notes

**Why placeholder?**
- Following lean development principles
- Backend API must be stable before frontend integration
- Week 1-2 focus: Solid backend foundation
- Week 3+: Build frontend against working API

**Questions?**
- Check the 12-week roadmap: `docs/planning/ROADMAP.md`
- Review architecture: `docs/architecture/OVERVIEW.md`
- Load context: `/gullycontext arch/stack`

---

**Last Updated:** 2025-11-06
**Status:** Placeholder (implementation starts Week 3)
**Current Week:** Week 2
