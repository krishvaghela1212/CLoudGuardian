# CloudGuardian

CloudGuardian is a platform for connecting and analyzing cloud accounts (primarily AWS) to provide observability, FinOps insights, security findings, and an AI Copilot for actionable recommendations.

## Features
- Connect and manage cloud accounts (AWS).
- Scan resources (EC2, S3, RDS, Lambda, etc.) and normalize results.
- FinOps analysis and cost optimization suggestions.
- AI Copilot for conversational analysis, Terraform / AWS CLI suggestions, and reports.
- Real-time updates via Socket.IO and a React dashboard with 3D visualizations.

## Tech Stack
- Frontend: React (v19) + Vite, Tailwind CSS, React Router, Three.js via `@react-three/fiber`.
- Backend: Node.js + Express (v5), Socket.IO, AWS SDK v3 (CloudWatch, Cost Explorer, EC2, Lambda, RDS, S3, STS).
- Database: MongoDB with Mongoose.
- AI / LLM Integrations: `openai` and a Groq-compatible client (`GROQ_API_KEY`) used in `server/src/services/gemini`.
- Auth & utilities: JWT, bcryptjs, dotenv, winston logging.

## Quickstart

Prerequisites:
- Node.js (16+ recommended)
- MongoDB (local or hosted)
- AWS credentials or an AWS Role ARN for read-only scans if you intend to connect to AWS accounts

1. Install dependencies

```powershell
cd server
npm install

cd ../client
npm install
```

2. Configure environment variables

Create a `.env` file in `server/` with the following values (replace placeholders):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cloudguardian
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_or_openai_key
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_KEY (optional if using role)
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET (optional if using role)
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/YourReadOnlyRole (optional)
AWS_STS_SESSION_DURATION=3600
AWS_CREDENTIAL_EXPIRY_BUFFER_MS=300000
```

3. Run the app

Start the backend (dev):

```powershell
cd server
npm run dev
```

Start the frontend (dev):

```powershell
cd client
npm run dev
```

Open the frontend (Vite) URL shown by the client (usually http://localhost:5173) and the backend API at `http://localhost:5000`.

## Key files & directories
- `server/src/config/db.js` — MongoDB connection (default: `mongodb://localhost:27017/cloudguardian`).
- `server/src/services/gemini/gemini.service.js` — AI Copilot / Groq/OpenAI integration.
- `server/src/services/aws/*` — AWS SDK wrappers and STS helper for temporary credentials.
- `server/src/controllers` & `server/src/routes` — API endpoints for auth, cloud connections, scans, and copilot.
- `client/src` — React app (pages, components, contexts).

## Notes
- Sensitive secrets MUST NOT be committed to the repository. Use `.env` or a secrets manager.
- Defaults are provided in code when env vars are missing (e.g., `MONGO_URI` fallback and default `PORT`).

If you want, I can:
- add a `server/.env.example` file with placeholders,
- add a single `npm` script at repo root to start both client and server concurrently, or
- expand the README with architecture diagrams or deployment steps.

---
