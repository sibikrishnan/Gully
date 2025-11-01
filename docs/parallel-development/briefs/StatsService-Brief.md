# Stats Service Development Brief
## Claude Instance: D1

### Mission
Develop the Stats Service microservice for collecting, aggregating, and analyzing performance statistics across all sports and competition types.

### Service Responsibility
- Real-time stats collection
- Performance aggregation
- Insights generation
- Historical trend analysis
- Personal and team analytics

### Interface Contract
**Provides:**
```typescript
// REST Endpoints
GET    /stats/user/:userId          // User statistics
GET    /stats/team/:teamId          // Team statistics
GET    /stats/match/:matchId        // Match statistics
POST   /stats/match/:matchId        // Record match stats
GET    /stats/league/:leagueId      // League statistics
GET    /stats/tournament/:tournamentId // Tournament statistics
GET    /insights/user/:userId       // User insights dashboard
GET    /insights/team/:teamId       // Team insights
GET    /trends/user/:userId         // Performance trends
GET    /analytics/sport/:sport      // Sport-specific analytics
```

**Events Emitted:**
```typescript
interface StatsEvents {
  STATS_RECORDED: { matchId: string, stats: object }
  MILESTONE_ACHIEVED: { userId: string, milestone: string, value: number }
  RECORD_BROKEN: { type: string, oldRecord: object, newRecord: object }
  INSIGHT_GENERATED: { entityId: string, entityType: string, insight: object }
}
```

**Consumes Events:**
```typescript
MATCH_COMPLETED: Trigger stats calculation
USER_CREATED: Initialize user stats
TEAM_CREATED: Initialize team stats
LEAGUE_MATCH_SCHEDULED: Prepare stats tracking
TOURNAMENT_MATCH_SCHEDULED: Prepare stats tracking
```

**Dependencies:**
- MongoDB: Flexible stats storage
- PostgreSQL: Aggregated stats
- Redis: Real-time stats caching
- Match Service: Get match details
- Time-series DB (InfluxDB): Performance metrics

### Development Constraints
- Support sport-specific stat models
- Real-time aggregation capabilities
- Historical data preservation
- Efficient trend calculation
- Support custom stat definitions
- Handle incomplete data gracefully

### File Structure
```
services/stats-service/
├── src/
│   ├── controllers/
│   │   ├── stats.controller.ts
│   │   ├── insights.controller.ts
│   │   └── analytics.controller.ts
│   ├── models/
│   │   ├── userStats.model.ts
│   │   ├── teamStats.model.ts
│   │   ├── matchStats.model.ts
│   │   └── sportStats/
│   │       ├── football.model.ts
│   │       ├── basketball.model.ts
│   │       └── tennis.model.ts
│   ├── services/
│   │   ├── collection.service.ts
│   │   ├── aggregation.service.ts
│   │   ├── insights.service.ts
│   │   └── trends.service.ts
│   ├── processors/
│   │   ├── realtime.processor.ts
│   │   ├── batch.processor.ts
│   │   └── milestone.processor.ts
│   ├── analytics/
│   │   ├── performance.analyzer.ts
│   │   ├── prediction.engine.ts
│   │   └── comparison.engine.ts
│   └── app.ts
├── tests/
├── Dockerfile
└── package.json
```

### Sport-Specific Stats Models
```typescript
// Base stats interface
interface BaseStats {
  matchId: string
  timestamp: Date
  duration: number
}

// Football stats
interface FootballStats extends BaseStats {
  goals: number
  assists: number
  shots: number
  shotsOnTarget: number
  possession: number
  passes: number
  passAccuracy: number
  tackles: number
  fouls: number
  yellowCards: number
  redCards: number
}

// Basketball stats
interface BasketballStats extends BaseStats {
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  fieldGoals: { made: number, attempted: number }
  threePointers: { made: number, attempted: number }
  freeThrows: { made: number, attempted: number }
  turnovers: number
}

// Aggregation functions
interface AggregatedStats {
  total: object
  average: object
  best: object
  worst: object
  recent: object[] // Last 5 matches
  streaks: object
  percentiles: object
}
```

### Insights Generation
```typescript
interface InsightEngine {
  generateInsights(stats: AggregatedStats): Insight[]
}

interface Insight {
  type: 'strength' | 'weakness' | 'trend' | 'recommendation' | 'milestone'
  title: string
  description: string
  value: any
  confidence: number // 0-1
  timeframe: string
  actionable: boolean
  recommendation?: string
}

// Example insights:
// "Your shooting accuracy improved 15% this month"
// "You perform 20% better in home matches"
// "3-game winning streak - longest this season"
// "Close to 100 career goals milestone (currently 97)"
```

### Performance Metrics
```typescript
interface PerformanceMetrics {
  formIndex: number // Current form (0-100)
  consistency: number // Performance variance
  improvement: number // Month-over-month change
  efficiency: object // Sport-specific efficiency metrics
  comparisons: {
    vsAverage: number // Compared to platform average
    vsSkillLevel: number // Compared to same skill level
    vsPrevious: number // Compared to previous period
  }
}
```

### Acceptance Criteria
1. Sport-specific stat models implemented
2. Real-time stats collection and aggregation
3. Insight generation with ML-ready architecture
4. Trend analysis over multiple timeframes
5. Comparison engine for benchmarking
6. Milestone detection and notifications
7. API response caching for performance
8. 80% test coverage

### Performance Requirements
- Stats recording: < 100ms
- Aggregation query: < 200ms
- Insights generation: < 500ms
- Support 10,000 concurrent stat updates

### Session Time Allocation
- Stats models setup: 20 minutes
- Collection service: 20 minutes
- Aggregation engine: 25 minutes
- Insights generation: 20 minutes
- Testing: 5 minutes