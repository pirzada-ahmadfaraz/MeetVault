### Environment variables

Set these in your local `.env` files (never commit real secrets). Values below are examples/placeholders.

- Backend (`/`):
  - `PORT=3002`
  - `NODE_ENV=development`
  - `MONGODB_URI=mongodb://localhost:27017/video-conference-app`
  - `JWT_SECRET=change-this-in-production`
  - `JWT_EXPIRES_IN=7d`
  - `CORS_ORIGIN=http://localhost:3001`
  - `RATE_LIMIT_WINDOW_MS=900000`
  - `RATE_LIMIT_MAX_REQUESTS=100`

- Frontend (`/frontend`):
  - `NEXT_PUBLIC_API_URL=http://localhost:3002/api`
  - `GOOGLE_CLIENT_ID=your-google-client-id`
  - `GOOGLE_CLIENT_SECRET=your-google-client-secret`
  - `GITHUB_CLIENT_ID=your-github-client-id`
  - `GITHUB_CLIENT_SECRET=your-github-client-secret`

Recommended local files (already ignored by git):
- Backend: `.env`
- Frontend: `frontend/.env.local`
