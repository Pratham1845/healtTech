# HealthTech Backend (MERN)

Express + MongoDB API for auth and AI chat.

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env` from `.env.example`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/healthtech
JWT_SECRET=replace_with_strong_secret
GEMINI_API_KEY=replace_with_google_ai_studio_key
GEMINI_MODEL=gemini-2.0-flash
CLIENT_ORIGIN=http://localhost:5173
```

3. Run API

```bash
npm run dev
```

## API Routes

- `GET /api/health` - API status
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Protected user profile
- `POST /api/chat` - Generate AI fitness response

## Chat Request Example

`POST /api/chat`

```json
{
  "userInput": "My back hurts after squats",
  "healthData": {
    "postureScore": 65,
    "activityLevel": "Low",
    "mood": "Neutral"
  }
}
```
