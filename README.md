# VPN Support Chat Assistant (TypeScript)

AI-powered support chat for VPN-related questions. Built with **Express + OpenAI** (backend) and **Next.js 14** (frontend), both in **TypeScript**.

## Live Demo

[deployment link](https://vpn-support-assitance.vercel.app/)

## Features

- Chat interface with conversation history
- Context-aware responses (full message history sent each request)
- Off-topic question detection via system prompt
- Loading states & error handling
- Responsive design (desktop + mobile)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide icons, TypeScript
- **Backend**: Node.js, Express, Groq API, TypeScript
- **LLM**: llama-3.3-70b-versatile (configurable)

## Setup Instructions

### Prerequisites

- Node.js 18+
- Groq API key (get one at [console.groq.com](https://console.groq.com))
- npm or yarn

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd vpn-support-assistant
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
AI_MODEL=mixtral-8x7b-32768
```

**Environment Variables:**

| Variable       | Required | Default                   | Description                                                       |
| -------------- | -------- | ------------------------- | ----------------------------------------------------------------- |
| `GROQ_API_KEY` | ✅ Yes   | -                         | Your Groq API key for AI responses                                |
| `AI_MODEL`     | ❌ No    | `llama-3.3-70b-versatile` | Groq model to use (e.g., `mixtral-8x7b-32768`, `llama2-70b-4096`) |
| `PORT`         | ❌ No    | `5000`                    | Server port                                                       |
| `NODE_ENV`     | ❌ No    | `development`             | Environment mode (`development` or `production`)                  |

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend-next
npm install
```

Create a `.env.local` file in the `frontend-next` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Environment Variables:**

| Variable              | Required | Default                     | Description                                                                             |
| --------------------- | -------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | ❌ No    | `http://localhost:5000/api` | Backend API endpoint (must be prefixed with `NEXT_PUBLIC_` to be accessible in browser) |

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000` to use the VPN Support Chat Assistant.

## Running in Production

### Backend Production Build

```bash
cd backend
npm run build
npm start
```

### Frontend Production Build

```bash
cd frontend-next
npm run build
npm start
```

## Available Scripts

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture & Design

### Architecture Decisions

1. **Separation of Concerns**: Backend and frontend are decoupled with a REST API interface. This allows independent scaling, easier testing, and clear responsibility boundaries.

2. **Server-Sent Events (SSE) for Streaming**: The `/chat/stream` endpoint uses SSE instead of WebSockets for real-time response streaming. This provides a simpler, HTTP-based solution that works well for one-directional data flow (server → client).

3. **Keyword-Based Off-Topic Detection**: The backend uses a simple keyword matching approach (`isOffTopicQuestion`) to detect off-topic queries before calling the AI model. This saves API costs and improves latency for obviously out-of-scope questions.

4. **Analytics Service**: Session-level analytics are collected separately from the core chat logic, allowing observability without coupling analytics to request handling.

5. **Groq API over OpenAI**: Chose Groq for faster inference times and cost-effectiveness. The service is abstraction-friendly with `groqService` being a singleton that can be easily swapped.

### Tradeoffs Made

| Tradeoff              | Decision                             | Rationale                                                                                                                    |
| --------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Response Accuracy** | Keyword-based off-topic detection    | Simple and fast, but may have false positives/negatives. AI-based detection would be more accurate but costly and slower.    |
| **State Management**  | Session ID stored in localStorage    | Simple to implement, but lacks persistence across devices. A database backend would be required for cross-device continuity. |
| **Database**          | In-memory analytics                  | Sufficient for this POC. In production, would need persistent DB (PostgreSQL, MongoDB) for analytics history.                |
| **Real-time Updates** | SSE instead of WebSockets            | Lighter overhead and simpler to implement, but doesn't support bidirectional communication if needed in future.              |
| **Type Safety**       | TypeScript for both frontend/backend | Added development complexity but provides strong type safety and better IDE support across the stack.                        |
| **Styling**           | Tailwind CSS                         | Utility-first approach reduces custom CSS but increases HTML verbosity. Good tradeoff for rapid development.                 |

### Future Improvements

With additional time, the following enhancements would be prioritized:

1. **Persistent Database**: Migrate analytics from in-memory to PostgreSQL/MongoDB to preserve session history, enable better reporting, and support multi-instance deployments.

2. **Authentication & User Profiles**: Add user authentication (OAuth/JWT) to track individual user sessions across devices and provide personalized chat history.

3. **Improved Off-Topic Detection**: Replace keyword matching with an LLM-based classifier or fine-tuned model for higher accuracy and fewer false positives.

4. **Rate Limiting & Abuse Prevention**: Add rate limiting per session/IP, CAPTCHA challenges, and content filtering to prevent API abuse.

5. **Conversation Memory Management**: Implement intelligent message truncation or summarization for long conversations to reduce token costs while maintaining context.

6. **Error Recovery & Retry Logic**: Add exponential backoff, circuit breakers, and graceful degradation when the AI service is unavailable.

7. **Response Caching**: Cache responses to common questions to reduce API calls and improve response time for frequently asked questions.

8. **Admin Dashboard**: Build an admin interface to monitor analytics, manage blocklists/whitelists, and adjust AI model parameters.

9. **Testing Suite**: Add comprehensive unit tests (Jest), integration tests, and E2E tests (Playwright/Cypress) to improve code reliability.

10. **Observability**: Implement structured logging, distributed tracing, and metrics collection (OpenTelemetry) for better debugging and performance monitoring.
