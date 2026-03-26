# ⚡ CORE PRIME - Neural Habit Tracker

**CORE PRIME** is a production-grade, decoupled habit-tracking system designed for those who treat performance as an engineering challenge. Built with a high-end "Industrial-Analytical" aesthetic, it combines a performant **FastAPI** backend with a reactive **Vite + React** frontend.

![CORE PRIME Display](/api/placeholder/800/400)

## 🌌 High-End Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, TanStack Query, Zustand, Recharts.
- **Backend**: FastAPI (Python 3.10+), Mangum, SQL (SQLite/Turso).
- **Persistence**: **Turso** (Serverless SQLite at the Edge) for low-latency, cloud-native storage.
- **Deployment**: Vercel (Monorepo Serverless Functions).

## 🛰 Core Features

### 📊 Biometric Analytics
- **Velocity Spectrum**: Toggle between 7D, 30D, and 90D performance trends using **Recharts**.
- **Density Heatmap**: Monthly biometric completion density visualization.
- **Insight Engine v2**: Automated behavioral conclusions detecting miss hotspots and productivity streaks.

### 📜 Neural Audit Trail
- **Vertical Journey**: A high-fidelity historical timeline of your habits.
- **Reflection Logic**: Contextual notes for every log to correlate state of mind with performance.
- **Export Power**: One-click **CSV Export** for individual habits or your entire global dataset.

### 🛡 Reliability & Speed
- **Neural Archive**: Archive inactive modules and restore them with a single click.
- **Haptic Feedback UI**: Glassmorphic, responsive design with portal-pulse animations and sub-100ms interaction latency.
- **Edge Native**: Powered by Turso for instant data delivery across all global regions.

## 🛠 Strategic Setup

### **Cloud Deployment (Vercel)**
The system is pre-configured for Vercel's serverless runtime.
1.  **Link Vercel**: `vercel link`
2.  **Environment Variables**:
    - `TURSO_URL`: Your Turso cloud URL (https://...)
    - `TURSO_TOKEN`: Your private API token.
    - `VITE_API_URL`: Set to `/api/v1` in production.
3.  **Deploy**: `vercel --prod`

### **Local Tactical Development**
1.  **Backend Startup**:
    ```bash
    cd backend
    pip install -r requirements.txt
    python -m uvicorn app.main:app --reload
    ```
2.  **Frontend Startup**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

*Designed for peak human performance. Crafted with the precision of a reliability engine.*
