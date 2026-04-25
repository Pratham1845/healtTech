# 📖 HealthTech — Architecture & Developer Docs

## Overview

Zenith Health is a full-stack MERN application split into two independently deployable services:

| Service | Stack | Port |
|---|---|---|
| **Backend** | Node.js · Express 5 · MongoDB | 5000 |
| **Frontend** | React 19 · Vite · React Router 7 | 5173 |

---

## Architecture Diagram

```
┌────────────────────────────────────────────┐
│                  Browser                   │
│   React SPA (Vite · React Router · Lucide) │
└─────────────────────┬──────────────────────┘
                      │ HTTP / JSON
                      ▼
┌────────────────────────────────────────────┐
│            Express REST API                │
│  /api/auth  /api/chat  /api/activity       │
│  /api/health                               │
│                                            │
│  ┌────────────┐   ┌───────────────────┐    │
│  │  Mongoose  │   │   AI Services     │    │
│  │  MongoDB   │   │  Groq · Gemini    │    │
│  └────────────┘   └───────────────────┘    │
└────────────────────────────────────────────┘
```

---

## Backend — Module Breakdown

### `src/config/db.js`
Connects to MongoDB via Mongoose. Called once at startup in `server.js`.

### `src/controllers/`
| File | Responsibility |
|---|---|
| `authController.js` | Register, login, get profile. Issues JWTs via `generateToken`. |
| `chatController.js` | Routes prompts to Groq or Gemini based on env config. Saves chat history. |
| `activityController.js` | CRUD for workout/activity sessions. Aggregation for stats. |
| `healthController.js` | Simple liveness check endpoint. |

### `src/middleware/`
| File | Responsibility |
|---|---|
| `authMiddleware.js` | Verifies Bearer JWT on protected routes. |
| `errorMiddleware.js` | Global 404 and error handler (Express error boundary). |

### `src/models/`
| Model | Key Fields |
|---|---|
| `User` | `name`, `email`, `password` (bcrypt hashed), timestamps |
| `ChatMessage` | `userId`, `role`, `content`, timestamp |
| `ActivitySession` | `userId`, `type`, `reps`, `duration`, `date` |

---

## Frontend — Module Breakdown

### `src/pages/`
Route-level page components. Each page has a co-located `.css` file.

| Page | Route | Auth Required |
|---|---|---|
| `Landing.jsx` | `/` | ❌ |
| `Login.jsx` | `/login` | ❌ |
| `Signup.jsx` | `/signup` | ❌ |
| `Dashboard.jsx` | `/dashboard` | ✅ |
| `Chatbot.jsx` | `/chatbot` | ✅ |
| `EmotionDetection.jsx` | `/emotions` | ✅ |
| `WorkoutCam.jsx` | `/workout` | ✅ |
| `ActivityStats.jsx` | `/stats` | ✅ |
| `History.jsx` | `/history` | ✅ |
| `Profile.jsx` | `/profile` | ✅ |

### `src/components/`
Reusable UI components used across pages (Navbar, Footer, GlassCard, Hero, FAQ, Testimonials, etc.)

### `src/lib/`
| File | Purpose |
|---|---|
| `api.js` | Centralised `apiFetch` wrapper — attaches JWT, handles errors uniformly |
| `gemini.js` | Client-side Gemini API helper (direct browser calls for specific features) |

### `public/emotion/`
Contains face-api.js model weights loaded at runtime by `EmotionDetection.jsx`. These files are **required** and must remain in the repo or be served from a CDN.

```
public/emotion/
├── face-api.min.js
└── model/
    ├── face_expression_model-shard1
    ├── face_expression_model-weights_manifest.json
    ├── tiny_face_detector_model-shard1
    └── tiny_face_detector_model-weights_manifest.json
```

---

## Authentication Flow

```
POST /api/auth/login
  → validate credentials
  → bcrypt.compare(password, hash)
  → generateToken(userId)
  → return { token, user }

Frontend:
  → saveAuthUser({ token, user }) → localStorage
  → ProtectedRoute checks localStorage token on every protected route
```

---

## AI Chat Flow

```
POST /api/chat  { userInput, healthData }
  → chatController decides: Groq or Gemini
  → constructs system prompt with health context
  → streams / returns AI response
  → saves ChatMessage to MongoDB
  → returns { message }
```

---

## Environment Variables Reference

See `Backend/.env.example` for the full list with descriptions.

---

## Development Commands

```bash
# Backend (in /Backend)
npm run dev          # nodemon watch mode
npm start            # production node

# Frontend (in /Frontend)
npm run dev          # Vite dev server
npm run build        # Production bundle → dist/
npm run lint         # ESLint check
npm run preview      # Preview production build locally
```
