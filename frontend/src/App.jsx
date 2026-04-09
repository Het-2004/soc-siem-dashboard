import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./auth/Login";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Logs from "./pages/Logs";
import Incidents from "./pages/Incidents";
import AuditLogs from "./pages/AuditLogs";
import ProtectedRoute from "./auth/ProtectedRoute";
import CyberBackground from "./components/CyberBackground";
import { TransitionProvider, useTransition } from "./context/TransitionContext";
import "./styles/auth.css";

/* ══════════════════════════════════════════════════════════════
   ACCESS GRANTED — Full-screen cinematic overlay
   Rendered at App level so it persists across route changes
   ══════════════════════════════════════════════════════════════ */
function AccessGrantedOverlay({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [phase, setPhase] = useState(0); // 0=scan, 1=granted, 2=decompose

  useEffect(() => {
    const start = Date.now();
    const ramp = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / 1200) * 100);
      setProgress(Math.round(pct));
      if (pct >= 100) { clearInterval(ramp); setPhase(1); }
    }, 16);

    let glitchTimer;
    const fireGlitch = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 120);
      glitchTimer = setTimeout(fireGlitch, 300 + Math.random() * 500);
    };
    glitchTimer = setTimeout(fireGlitch, 400);

    // Phase 2: decompose
    const p2 = setTimeout(() => setPhase(2), 1800);
    // Tell App we're done (navigate + unmount)
    const done = setTimeout(() => onDone(), 2700);

    return () => {
      clearInterval(ramp);
      clearTimeout(glitchTimer);
      clearTimeout(p2);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className={`ag-overlay${phase >= 2 ? " ag-decompose" : ""}`}>
      <div className="ag-scanlines" />
      <div className="ag-hex-grid" />
      <div className="ag-burst" />

      <div className="ag-center">
        <div className="ag-shield-wrap">
          <img src="/SOCs.svg" alt="SOC" className="ag-shield-img" />
          <div className="ag-shield-ring ag-ring-1" />
          <div className="ag-shield-ring ag-ring-2" />
          <div className="ag-shield-ring ag-ring-3" />
          <div className="ag-shield-ring ag-ring-4" />
        </div>

        <div className={`ag-badge${phase >= 1 ? " ag-badge--granted" : ""}`}>
          {phase < 1 ? "AUTHENTICATING\u2026" : "ACCESS GRANTED"}
        </div>

        <div
          className={`ag-title${glitchActive ? " ag-glitch" : ""}`}
          data-text="SOC COMMAND CENTER"
        >
          SOC COMMAND CENTER
        </div>

        {phase < 1 && (
          <div className="ag-progress-wrap">
            <div className="ag-progress-track">
              <div className="ag-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="ag-progress-pct">{progress}%</span>
          </div>
        )}

        {phase >= 1 && (
          <div className="ag-verified">
            <span className="ag-verified-dot" />
            IDENTITY VERIFIED — LOADING DASHBOARD
          </div>
        )}
      </div>
    </div>
  );
}

/* Inner app that has access to navigate() */
function AppInner() {
  const navigate = useNavigate();
  const { showing, clearTransition } = useTransition();

  const handleTransitionDone = () => {
    navigate("/");
    clearTransition();
  };

  return (
    <>
      <CyberBackground />
      {/* Overlay renders ABOVE all routes — survives route changes */}
      {showing && <AccessGrantedOverlay onDone={handleTransitionDone} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TransitionProvider>
        <AppInner />
      </TransitionProvider>
    </BrowserRouter>
  );
}

export default App;
