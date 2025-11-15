# Gully - API Endpoints

## Base URL: `https://api.gully.app/v1`

---

## Authentication

### POST /auth/signup
Register new user
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string"
}
```

### POST /auth/login
User login
```json
{
  "email": "string",
  "password": "string"
}
```
Response: `{ access_token, refresh_token, user }`

### POST /auth/refresh
Refresh access token

### POST /auth/logout
Logout user

---

## Users

### GET /users/:id
Get user profile

### PUT /users/:id
Update user profile

### GET /users/:id/stats
Get user statistics

### POST /users/:id/sports
Add sport to profile

### DELETE /users/:id/sports/:sport
Remove sport

### GET /users/search?q=username
Search users

---

## Teams

### GET /teams
List teams (with filters)

### POST /teams
Create team

### GET /teams/:id
Get team details

### PUT /teams/:id
Update team

### DELETE /teams/:id
Delete team

### POST /teams/:id/members
Add team member

### DELETE /teams/:id/members/:userId
Remove member

### GET /teams/:id/stats
Get team statistics

---

## Challenges

### GET /challenges
List challenges (sent/received)

### POST /challenges
Create challenge
```json
{
  "challenged_id": "uuid",
  "challenged_type": "team|user",
  "sport_name": "string",
  "proposed_datetime": "ISO8601",
  "venue_name": "string",
  "message": "string"
}
```

### GET /challenges/:id
Get challenge details

### PUT /challenges/:id/accept
Accept challenge

### PUT /challenges/:id/decline
Decline challenge

### DELETE /challenges/:id
Cancel challenge

---

## Matches

### GET /matches
List matches

### GET /matches/:id
Get match details

### POST /matches/:id/result
Submit match result
```json
{
  "team1_score": 0,
  "team2_score": 0,
  "winner_id": "uuid"
}
```

### PUT /matches/:id/verify
Verify match result

### POST /matches/:id/dispute
Raise dispute

### GET /matches/:id/stats
Get match statistics

---

## Leagues

### GET /leagues
List leagues

### POST /leagues
Create league
```json
{
  "name": "string",
  "sport_name": "string",
  "season_start": "date",
  "season_end": "date",
  "max_teams": 0
}
```

### GET /leagues/:id
Get league details

### POST /leagues/:id/register
Register team for league

### GET /leagues/:id/standings
Get league standings

### GET /leagues/:id/fixtures
Get league fixtures

---

## Tournaments

### GET /tournaments
List tournaments

### POST /tournaments
Create tournament

### GET /tournaments/:id
Get tournament details

### POST /tournaments/:id/register
Register for tournament

### GET /tournaments/:id/bracket
Get tournament bracket

### PUT /tournaments/:id/matches/:matchId
Update tournament match result

---

## Rankings

### GET /rankings/global
Global leaderboard

### GET /rankings/sport/:sportName
Sport-specific rankings

### GET /rankings/regional?location=city
Regional rankings

---

## Stats

### GET /stats/user/:userId
User statistics and insights

### GET /stats/team/:teamId
Team statistics

### GET /stats/match/:matchId
Match statistics

---

## Videos

### POST /videos
Upload video
```json
{
  "match_id": "uuid",
  "title": "string",
  "description": "string"
}
```
Response: `{ upload_url, video_id }`

### GET /videos/:id
Get video details

### GET /videos
List videos (feed)

### POST /videos/:id/like
Like video

### DELETE /videos/:id
Delete video

---

## Marketplace

### GET /marketplace
List marketplace items

### POST /marketplace
Create listing
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "price": 0,
  "condition": "string",
  "images": ["url"]
}
```

### GET /marketplace/:id
Get item details

### PUT /marketplace/:id
Update listing

### DELETE /marketplace/:id
Remove listing

### POST /marketplace/:id/order
Purchase item

---

## Notifications

### GET /notifications
Get notifications

### PUT /notifications/:id/read
Mark as read

### PUT /notifications/read-all
Mark all as read

---

## Social

### POST /users/:id/follow
Follow user

### DELETE /users/:id/unfollow
Unfollow user

### GET /users/:id/followers
Get followers

### GET /users/:id/following
Get following

### GET /feed
Get activity feed

---

## Search

### GET /search?q=query&type=users|teams|matches
Global search

---

## WebSocket Events

### Connection
`wss://api.gully.app/ws?token=access_token`

### Events Emitted (Client → Server)
- `match:update` - Live match update
- `chat:message` - Send chat message
- `presence:update` - Update online status

### Events Received (Server → Client)
- `challenge:received` - New challenge
- `match:result` - Match result posted
- `notification:new` - New notification
- `chat:message` - Incoming message
- `match:live_update` - Live match score
