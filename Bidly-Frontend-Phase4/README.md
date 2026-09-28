# Bidly Frontend — Phase 4

This version is wired to the original working Real-Time Auction Platform backend.

## Local setup

1. Start the Spring Boot backend on `http://localhost:8080`.
2. Start Redis/MySQL as required by the backend.
3. In this folder run:

```bash
npm install
npm run dev
```

Frontend: `http://localhost:3002`

Vite proxies:
- `/api` -> `http://localhost:8080`
- `/uploads` -> `http://localhost:8080`
- `/ws` -> `http://localhost:8080` (WebSocket/SockJS)

This avoids browser CORS issues with the backend's current configuration.

## Integrated backend features

- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh-token`
- POST `/api/v1/auth/logout`
- GET `/api/v1/auctions`
- GET `/api/v1/auctions/search`
- GET `/api/v1/auctions/{id}`
- GET `/api/v1/auctions/mine`
- POST/PUT/DELETE auction CRUD + publish
- Auction image upload/delete/primary
- GET/POST auction bids
- Auto-bid set/get/cancel
- Watchlist add/remove/list
- Profile update + become seller
- Notifications + unread count + mark read
- Admin stats/users/ban/unban/auction removal/category management
- Payment history/initiation/refund API wrappers
- STOMP/SockJS `/ws` -> `/topic/auctions/{auctionId}` with JWT connect header

## Important backend behavior

Registration creates a Buyer account. The backend's `/api/v1/users/me/become-seller` endpoint can grant Seller access. After becoming a seller, refresh the token/login again so the new role is present in the JWT.

The global "My Bids" endpoint is not present in the supplied backend. The UI therefore links users to each auction's bid activity instead of inventing an API.

```
Bidly-Frontend-Phase4
├─ .env.example
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ README.md
├─ src
│  ├─ App.jsx
│  ├─ components
│  │  ├─ AuctionCard.jsx
│  │  ├─ Footer.jsx
│  │  └─ Navbar.jsx
│  ├─ context
│  │  └─ AuthContext.jsx
│  ├─ hooks
│  │  └─ useAuctionSocket.js
│  ├─ index.css
│  ├─ main.jsx
│  ├─ pages
│  │  ├─ admin
│  │  │  ├─ AdminAuctions.jsx
│  │  │  ├─ AdminDashboard.jsx
│  │  │  └─ AdminUsers.jsx
│  │  ├─ AuctionDetails.jsx
│  │  ├─ Auctions.jsx
│  │  ├─ CreateAuction.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ Home.jsx
│  │  ├─ Login.jsx
│  │  ├─ MyAuctions.jsx
│  │  ├─ MyBids.jsx
│  │  ├─ Notifications.jsx
│  │  ├─ Placeholder.jsx
│  │  ├─ Profile.jsx
│  │  ├─ Register.jsx
│  │  ├─ VerifyEmail.jsx
│  │  └─ Watchlist.jsx
│  └─ services
│     └─ api.js
├─ tailwind.config.js
└─ vite.config.js

```