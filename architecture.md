# Root Directory 
    soc-siem-dashboard/
    ├── backend/
    ├── frontend/
    ├── docs/
    ├── docker/
    └── README.md

# Backend Structure (Core of SOC)
    backend/
    ├── controllers/ 
    │   ├── auth.controller.js
    │   ├── log.controller.js
    │   ├── alert.controller.js
    │   └── incident.controller.js
    │
    ├── models/
    │   ├── User.js
    │   ├── Log.js
    │   ├── Alert.js
    │   └── Incident.js
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── log.routes.js
    │   ├── alert.routes.js
    │   └── incident.routes.js
    │
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── rbac.middleware.js
    │   ├── apiLogger.js
    │   └── errorLogger.js
    │
    ├── utils/
    │   ├── detector.js
    │   └── generateToken.js
    │
    ├── config/
    │   └── db.js
    │
    ├── app.js
    └── server.js

# Frontend Structure (SOC Dashboard UI)
    frontend/src/
    ├── api/
    │   └── api.js
    │
    ├── auth/
    │   ├── Login.jsx
    │   └── ProtectedRoute.jsx
    │
    ├── components/
    │   ├── Navbar.jsx
    │   └── Sidebar.jsx
    │
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── Alerts.jsx
    │   ├── Logs.jsx
    │   └── Incidents.jsx
    │
    ├── utils/
    │   └── auth.js
    │
    ├── App.js
    └── index.js
