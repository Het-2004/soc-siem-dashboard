import { useEffect, useState, useRef } from "react";

/**
 * ThreatMap — SVG world map with animated attack origin pulsing dots.
 * Maps alert IPs to random geographic coords for visual drama.
 */

/* ── Simplified world map path (low-detail continents) ───── */
const WORLD_PATH =
    "M 140 60 L 160 55 L 180 58 L 195 52 L 210 60 L 220 55 L 240 58 L 250 65 L 260 60 " +
    "L 270 62 L 280 58 L 290 65 L 285 75 L 275 80 L 265 78 L 255 82 L 245 80 L 240 85 " +
    "L 230 82 L 220 85 L 210 80 L 200 85 L 190 75 L 180 78 L 170 72 L 160 75 L 150 68 Z " +
    "M 295 55 L 310 50 L 330 52 L 350 48 L 370 55 L 380 52 L 395 58 L 400 65 L 395 72 " +
    "L 385 78 L 370 75 L 355 80 L 340 78 L 325 82 L 315 78 L 305 75 L 298 68 Z " +
    "M 405 55 L 425 48 L 445 52 L 460 48 L 480 55 L 495 52 L 510 58 L 520 65 L 515 72 " +
    "L 505 78 L 490 75 L 475 80 L 460 82 L 445 78 L 430 75 L 415 72 L 408 65 Z " +
    "M 170 115 L 185 108 L 200 112 L 215 108 L 230 115 L 235 125 L 225 135 L 210 140 " +
    "L 195 138 L 180 135 L 172 125 Z " +
    "M 245 110 L 260 105 L 275 108 L 290 105 L 300 112 L 295 122 L 280 128 L 265 125 " +
    "L 252 120 Z " +
    "M 390 110 L 410 105 L 430 108 L 445 112 L 440 122 L 425 128 L 410 130 L 395 125 Z " +
    "M 460 130 L 480 125 L 500 128 L 510 135 L 505 145 L 490 148 L 475 145 L 465 140 Z";

/* ── Random geo positions for attack dots ─────────────── */
const ATTACK_POSITIONS = [
    { x: 180, y: 65 }, { x: 220, y: 70 }, { x: 260, y: 60 },
    { x: 310, y: 55 }, { x: 350, y: 62 }, { x: 390, y: 58 },
    { x: 430, y: 55 }, { x: 470, y: 60 }, { x: 510, y: 68 },
    { x: 200, y: 120 }, { x: 270, y: 115 }, { x: 410, y: 118 },
    { x: 480, y: 135 }, { x: 160, y: 72 }, { x: 500, y: 55 },
];

/* Server location (center-ish, represents "your" SOC) */
const SERVER = { x: 300, y: 75 };

export default function ThreatMap({ alerts = [], stats = null }) {
    const [activeDots, setActiveDots] = useState([]);
    const [attackLines, setAttackLines] = useState([]);
    const intervalRef = useRef(null);
    const counterRef = useRef(0);

    useEffect(() => {
        // Map alerts to attack dots
        const dots = (alerts || []).slice(0, 15).map((alert, i) => ({
            ...ATTACK_POSITIONS[i % ATTACK_POSITIONS.length],
            severity: alert.severity || "MEDIUM",
            title: alert.title || "Unknown Threat",
            id: alert._id || i,
        }));
        setActiveDots(dots);
    }, [alerts]);

    // Animate attack lines periodically
    useEffect(() => {
        if (activeDots.length === 0) return;

        const fireAttack = () => {
            const dot = activeDots[counterRef.current % activeDots.length];
            counterRef.current++;
            const lineId = Date.now();
            setAttackLines(prev => [...prev, { ...dot, lineId }]);
            setTimeout(() => {
                setAttackLines(prev => prev.filter(l => l.lineId !== lineId));
            }, 2000);
        };

        fireAttack();
        intervalRef.current = setInterval(fireAttack, 3000);
        return () => clearInterval(intervalRef.current);
    }, [activeDots]);

    const getSeverityColor = (sev) => {
        if (sev === "HIGH") return "#ff3366";
        if (sev === "MEDIUM") return "#ff9f43";
        return "#00ff88";
    };

    const totalBlocked = stats?.total || activeDots.length;

    return (
        <div className="threat-map-container">
            <div className="threat-map-header">
                <div className="threat-map-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Live Threat Map
                </div>
                <div className="threat-map-stats">
                    <span className="threat-stat">
                        <span className="threat-stat-dot pulse-red" />
                        {activeDots.filter(d => d.severity === "HIGH").length} Critical
                    </span>
                    <span className="threat-stat">
                        <span className="threat-stat-dot pulse-orange" />
                        {activeDots.filter(d => d.severity === "MEDIUM").length} Medium
                    </span>
                    <span className="threat-stat-total">
                        {totalBlocked} threats tracked
                    </span>
                </div>
            </div>

            <svg
                viewBox="0 0 640 200"
                className="threat-map-svg"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {/* Glow filters */}
                    <filter id="glow-red">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="glow-orange">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="glow-green">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>

                    {/* Grid pattern */}
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="0.5" />
                    </pattern>
                </defs>

                {/* Background grid */}
                <rect width="640" height="200" fill="url(#grid)" />

                {/* World map outline */}
                <path
                    d={WORLD_PATH}
                    fill="rgba(0, 212, 255, 0.04)"
                    stroke="rgba(0, 212, 255, 0.15)"
                    strokeWidth="0.8"
                />

                {/* Server location */}
                <circle cx={SERVER.x} cy={SERVER.y} r="5" fill="#00d4ff" opacity="0.8">
                    <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={SERVER.x} cy={SERVER.y} r="2.5" fill="#00d4ff" />
                <text x={SERVER.x} y={SERVER.y - 10} textAnchor="middle" fill="#00d4ff" fontSize="6" fontFamily="Inter" fontWeight="600">
                    SOC
                </text>

                {/* Attack lines */}
                {attackLines.map(line => (
                    <line
                        key={line.lineId}
                        x1={line.x}
                        y1={line.y}
                        x2={SERVER.x}
                        y2={SERVER.y}
                        stroke={getSeverityColor(line.severity)}
                        strokeWidth="1"
                        opacity="0.6"
                        strokeDasharray="4 2"
                    >
                        <animate attributeName="opacity" from="0.6" to="0" dur="2s" fill="freeze" />
                        <animate attributeName="stroke-dashoffset" from="0" to="-30" dur="1s" repeatCount="indefinite" />
                    </line>
                ))}

                {/* Attack dots */}
                {activeDots.map((dot) => (
                    <g key={dot.id}>
                        {/* Pulse ring */}
                        <circle cx={dot.x} cy={dot.y} r="4" fill="none"
                            stroke={getSeverityColor(dot.severity)} strokeWidth="0.8" opacity="0.4">
                            <animate attributeName="r" values="4;10;4" dur="2.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                        </circle>
                        {/* Core dot */}
                        <circle
                            cx={dot.x}
                            cy={dot.y}
                            r="2.5"
                            fill={getSeverityColor(dot.severity)}
                            filter={dot.severity === "HIGH" ? "url(#glow-red)" : dot.severity === "MEDIUM" ? "url(#glow-orange)" : "url(#glow-green)"}
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}
