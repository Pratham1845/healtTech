# 🏥 HealthTech — Zenith Health Platform

> AI-powered health monitoring platform with real-time workout tracking, emotion detection, and personalised fitness coaching.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-6%2B-brightgreen)](https://mongodb.com)
[![License](https://img.shields.io/badge/license-ISC-lightgrey)]()

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat Coach** | Personalised fitness advice powered by Groq (LLaMA 3) & Google Gemini |
| 🎥 **Workout Cam** | Real-time pose estimation & rep counting via webcam |
| 😊 **Emotion Detection** | Facial expression analysis using face-api.js |
| 📊 **Activity Stats** | Track workouts, sessions, and progress over time |
| 🔐 **Auth** | JWT-based registration & login with bcrypt password hashing |

---

## 📁 Project Structure

```
HealthTech/
├── Backend/                  # Express + MongoDB REST API
│   ├── src/
│   │   ├── config/           # Database connection
│   │   ├── controllers/      # Route logic (auth, chat, activity, health)
│   │   ├── middleware/        # Auth guard & error handler
│   │   ├── models/           # Mongoose schemas (User, ChatMessage, ActivitySession)
│   │   ├── routes/           # Express routers
│   │   ├── utils/            # JWT token helper
│   │   └── server.js         # App entry point
│   ├── .env.example
│   └── package.json
│
├── Frontend/                 # React 19 + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── lib/              # API client & Gemini helper
│   │   └── assets/           # SVG exercise icons
│   ├── public/
│   │   ├── assets/           # Exercise images
│   │   └── emotion/          # face-api.js model weights (required at runtime)
│   └── package.json
│
└── docs/                     # Architecture & developer documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key → [console.groq.com](https://console.groq.com)
- Google Gemini API key → [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the repo

```bash
git clone https://github.com/your-org/healthtech.git
cd healthtech
```

### 2. Set up the Backend

```bash
cd Backend
cp .env.example .env     # Fill in your keys
npm install
npm run dev              # Starts on http://localhost:5000
```

### 3. Set up the Frontend

```bash
cd Frontend
npm install
npm run dev              # Starts on http://localhost:5173
```

---

## 🔑 Environment Variables

Copy `Backend/.env.example` to `Backend/.env` and fill in:

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Strong random string for JWT signing |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `GEMINI_MODEL` | e.g. `gemini-2.0-flash` |
| `GROQ_API_KEY` | Groq Cloud API key |
| `GROQ_MODEL` | e.g. `llama-3.1-8b-instant` |
| `CLIENT_ORIGIN` | Frontend origin(s) for CORS (comma-separated) |

---

## 🛠️ API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | ❌ | Health check |
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/profile` | ✅ | Get user profile |
| POST | `/api/chat` | ✅ | AI chat response |
| GET | `/api/activity` | ✅ | List activity sessions |
| POST | `/api/activity` | ✅ | Save activity session |

---

## 🧰 Tech Stack

**Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, bcryptjs, Morgan  
**Frontend:** React 19, Vite, React Router 7, Lucide React, face-api.js  
**AI:** Google Gemini 2.0 Flash, Groq LLaMA 3.1

---

## 📖 Documentation

See the [`docs/`](./docs/README.md) folder for architecture decisions and developer guides.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## 📄 License

ISC © HealthTech Team
