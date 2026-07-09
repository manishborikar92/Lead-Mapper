# 06 — Deployment & Infrastructure Strategy

### Status: **ARCHITECTURE FROZEN**

---

## 1. Hosting Services Selection

We will use completely **free hosting tiers** for our production deployments:

* **Frontend**: **Vercel Hobby**
  * Serves Next.js statically built files via global CDN edges.
  * Simple Git integration for auto-deployments on main-branch pushes.
* **Backend**: **Render Free Tier (Web Service)**
  * Node.js runtime environment.
  * Autodeployments on Git pushes.

---

## 2. Environment Configurations

### Frontend (Vercel Dashboard)
* `NEXT_PUBLIC_API_URL`: The URL of the deployed backend on Render (e.g. `https://lead-mapper-api.onrender.com`).

### Backend (Render Dashboard)
* `PORT`: Automatically set by Render.
* `NODE_ENV`: `production`
* `GEMINI_API_KEY`: Google AI Studio API key.
* `ALLOWED_ORIGIN`: Points to the deployed Vercel frontend URL (e.g. `https://lead-mapper.vercel.app`) to block cross-origin requests.

---

## 3. CORS Configuration

To secure backend endpoints from external execution, the `app.ts` file will use `cors` with dynamic checking:
```typescript
import cors from 'cors';
import { env } from './config/env.config';

const allowedOrigin = env.ALLOWED_ORIGIN || '*';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
```

---

## 4. Free Tier Mitigations (Proactive Server Wakeup)

Render Free Tier puts services to sleep after 15 minutes of inactivity. When a user visits the app, waking up the backend can take up to 50 seconds, creating a poor user experience if they try to import a CSV immediately.

### Wake-Up Strategy
* **Proactive Pinging**: When the Next.js frontend page mounts in the browser (`useEffect` on load), it immediately sends a background ping request to `/health`.
* **Visual Status Indicator**: The frontend dashboard will display a subtle connection indicator (e.g., "Connecting to API..." or "API Connected").
* **Benefits**: The backend begins its wake-up sequence while the user is selecting and reviewing their CSV preview, minimizing perceived load times during actual import confirmation.
