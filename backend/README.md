# Backend - SOC/SIEM Dashboard

## Overview
RESTful API backend for the SOC/SIEM Dashboard built with Node.js, Express, and MongoDB.

## Features Implemented
- ✅ User Authentication (JWT-based)
- ✅ Role-Based Access Control (RBAC)
- ✅ Alert Management
- ✅ Incident Tracking
- ✅ Security Logging
- ✅ Audit Logs
- ✅ Real-time Notifications (Socket.io)
- ✅ Rate Limiting
- ✅ Security Headers
- ✅ Input Validation
- ✅ Error Handling
- ✅ IP Blocking for Threats

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **Validation**: express-validator
- **Security**: Custom middlewares

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Setup Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/soc_siem
   JWT_SECRET=your_secret_key_here_change_in_production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Alerts
- `GET /api/alerts` - Get all alerts (protected)
- `PUT /api/alerts/:id` - Update alert status (admin only)

### Incidents
- `POST /api/incidents` - Create incident (admin only)
- `GET /api/incidents` - Get all incidents (protected)
- `PUT /api/incidents/:id/assign` - Assign incident (admin only)
- `PUT /api/incidents/:id/status` - Update incident status (protected)

### Logs
- `GET /api/logs` - Get logs with filtering (protected)

### Statistics
- `GET /api/stats` - Get alert statistics (protected)
- `GET /api/trends` - Get 7-day trend data (protected)

### Audit Logs
- `GET /api/audit-logs` - Get audit logs (admin only)

### Health Check
- `GET /health` - Check server status

## Security Features

### Middlewares
1. **Rate Limiter** - 100 requests per 15 minutes per IP
2. **Security Headers** - XSS, CSRF, Clickjacking protection
3. **IP Blocker** - Blocks malicious IPs automatically
4. **RBAC** - Role-based access control (ADMIN, ANALYST)
5. **Input Validation** - Validates all user inputs
6. **Audit Logger** - Logs all authenticated actions

### Authentication
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 1-hour expiration
- Token-based API authentication

## Project Structure
```
backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middlewares/      # Custom middlewares
├── models/          # MongoDB schemas
├── routes/          # API routes
├── utils/           # Helper utilities
├── logs/            # Application logs
├── app.js           # Express app setup
├── server.js        # Server entry point
└── package.json     # Dependencies
```

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | - |
| JWT_SECRET | Secret for JWT signing | - |
| NODE_ENV | Environment mode | development |

## Error Handling
Centralized error handling with custom error handler middleware. All errors are logged and returned in consistent format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Logging
Custom logger utility creates separate log files:
- `info.log` - General information
- `error.log` - Error messages with stack traces
- `warn.log` - Warning messages
- `debug.log` - Debug information (dev only)

## Contributing
This is a college project. Follow the existing code structure and conventions.

## Author
Last Semester Project - SOC/SIEM Dashboard

## Date
January 2026 - February 2026
