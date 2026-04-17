# Deployment Architecture

This document describes the deployment architecture for the **SOC SIEM Dashboard**.

## Overview
The project is built using a MERN stack + Socket.io and is divided into two main components:
1. **Frontend (Client)**: A React/Vite Single Page Application (SPA).
2. **Backend (API)**: A Node.js/Express server providing REST APIs and WebSocket connections.

## Cloud Strategy

Our deployment strategy uses PaaS (Platform as a Service) providers for zero-maintenance scaling and simple CI/CD integrations.

### Frontend Deployment (Vercel)
- **Infrastructure**: Vercel Global Edge Network.
- **Provider File**: `vercel.json` (at project root).
- **Process**: Vercel is connected to the GitHub repository. It automatically detects the `vercel.json` file inside the root repository, which specifies `frontend/package.json` as the build context. It runs `vite build` and serves the `dist` folder via Vercel's fast edge nodes.
- **Environment Variables Setting**: Configure `VITE_API_BASE_URL` and `VITE_SOCKET_URL` in the Vercel project settings to point to the backend URL on Render.

### Backend Deployment (Render)
- **Infrastructure**: Render Web Services.
- **Provider File**: `render.yaml` (at project root).
- **Process**: Render automatically detects the `render.yaml` configuration when connected to the repository. It sets the root directory to `backend`, installs dependencies, and runs `node server.js`.
- **Environment Variables Setting**: Managed securely within the Render Dashboard (e.g., `MONGO_URI`, `JWT_SECRET`).
- **Database (MongoDB Atlas)**: Deployed as a serverless instance on MongoDB Atlas. Providing connection strings via Render environment variables.

### Containerization (Alternative Strategy)
For standard VPS or orchestrator (AWS EC2 / DigitalOcean Droplets) deployments, the project provides complete **Docker** support:
- `docker-compose.yml` provides a unified startup script mapping ports `80` (Frontend Nginx) and `5000` (Backend Node).
- Includes multi-stage optimized builds.

## CI/CD Pipeline
GitHub Actions automatically handles Continuous Integration:
- **Test Workflow**: Validates the backend code unit-tests securely via `.github/workflows/test.yml`.
- **Docker Workflow**: Verifies successful builds of Docker images via `.github/workflows/docker-build.yml`.
