import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default icon path issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Real-world threat origin cities with actual lat/lng coordinates
const THREAT_CITIES = [
    { name: "Beijing", lat: 39.91, lng: 116.39, country: "CN" },
    { name: "Moscow", lat: 55.75, lng: 37.62, country: "RU" },
    { name: "Tehran", lat: 35.69, lng: 51.39, country: "IR" },
    { name: "Pyongyang", lat: 39.01, lng: 125.74, country: "KP" },
    { name: "Lagos", lat: 6.45, lng: 3.39, country: "NG" },
    { name: "São Paulo", lat: -23.55, lng: -46.63, country: "BR" },
    { name: "Bucharest", lat: 44.43, lng: 26.10, country: "RO" },
    { name: "Kyiv", lat: 50.45, lng: 30.52, country: "UA" },
    { name: "Mumbai", lat: 19.07, lng: 72.88, country: "IN" },
    { name: "Jakarta", lat: -6.21, lng: 106.85, country: "ID" },
    { name: "Istanbul", lat: 41.01, lng: 28.97, country: "TR" },
    { name: "Nairobi", lat: -1.29, lng: 36.82, country: "KE" },
    { name: "Bogotá", lat: 4.71, lng: -74.07, country: "CO" },
    { name: "Karachi", lat: 24.86, lng: 67.01, country: "PK" },
    { name: "Cairo", lat: 30.04, lng: 31.24, country: "EG" },
    { name: "Bangkok", lat: 13.75, lng: 100.52, country: "TH" },
    { name: "Minsk", lat: 53.90, lng: 27.57, country: "BY" },
    { name: "Hanoi", lat: 21.03, lng: 105.85, country: "VN" },
];

// SOC Headquarters location (Gujarat, India center)
const SOC_HQ = { lat: 23.21, lng: 72.63 };

const SEV_COLOR = {
    CRITICAL: "#ff0033",
    HIGH: "#ff3366",
    MEDIUM: "#ff9f43",
    LOW: "#00ff88",
};

const SEVERITIES = ["CRITICAL", "HIGH", "HIGH", "MEDIUM", "MEDIUM", "LOW"];

/* ── (legacy SVG path removed — now using Leaflet real map) ──── */
const _UNUSED =
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
    "";

export default function ThreatMap({ alerts = [], stats = null }) {
    const [allThreats, setAllThreats] = useState([]);
    const [activeAttacks, setActiveAttacks] = useState([]);
    const counterRef = useRef(0);
    const intervalRef = useRef(null);

    // Build threat markers:
    // 1. Real alerts WITH geo coords → shown as real threats
    // 2. Pad with static city list for visual richness on empty DB
    useEffect(() => {
        // Alerts that have real GeoIP data
        const realThreats = alerts
            .filter(a => a.lat != null && a.lng != null)
            .slice(0, 50)
            .map(a => ({
                name: a.city || a.ipAddress,
                lat: a.lat,
                lng: a.lng,
                country: a.country || "?",
                severity: a.severity,
                title: a.title,
                count: 1,
                isReal: true,
            }));

        // Pad with static cities if real data is sparse
        const staticThreats = THREAT_CITIES.map((city, i) => ({
            ...city,
            severity: alerts[i]?.severity || SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
            title: alerts[i]?.title || `Intrusion attempt from ${city.name}`,
            count: Math.floor(Math.random() * 120) + 1,
            isReal: false,
        }));

        // Merge: real threats first, then fill up with static
        const combined = [
            ...realThreats,
            ...staticThreats.slice(0, Math.max(0, 18 - realThreats.length))
        ];
        setAllThreats(combined);
    }, [alerts]);

    // Cycle animated attack lines from random cities → SOC HQ
    useEffect(() => {
        if (allThreats.length === 0) return;
        const fire = () => {
            const city = allThreats[counterRef.current % allThreats.length];
            counterRef.current++;
            const id = Date.now() + Math.random();
            setActiveAttacks(prev => [...prev.slice(-5), { ...city, id }]);
            setTimeout(() => setActiveAttacks(prev => prev.filter(a => a.id !== id)), 3500);
        };
        fire();
        intervalRef.current = setInterval(fire, 1800);
        return () => clearInterval(intervalRef.current);
    }, [allThreats]);

    const total = stats?.total ?? (alerts.length || 128);
    const highCount = allThreats.filter(t => t.severity === "CRITICAL" || t.severity === "HIGH").length;
    const medCount = allThreats.filter(t => t.severity === "MEDIUM").length;
    const lowCount = allThreats.filter(t => t.severity === "LOW").length;

    return (
        <div className="threat-map-container">
            {/* Header */}
            <div className="threat-map-header">
                <div className="threat-map-title">
                    <span className="threat-live-dot" />
                    LIVE THREAT MAP
                </div>
                <div className="threat-map-stats">
                    <span className="threat-stat" style={{ color: "#ff3366" }}>● CRITICAL/HIGH&nbsp;{highCount}</span>
                    <span className="threat-stat" style={{ color: "#ff9f43" }}>● MED&nbsp;{medCount}</span>
                    <span className="threat-stat" style={{ color: "#00ff88" }}>● LOW&nbsp;{lowCount}</span>
                    <span className="threat-stat-total">{total} TRACKED</span>
                </div>
            </div>

            {/* Real Leaflet Map */}
            <div className="threat-map-leaflet">
                <MapContainer
                    center={[20, 10]}
                    zoom={2}
                    minZoom={1}
                    maxZoom={5}
                    style={{ width: "100%", height: "100%" }}
                    className="hacker-map"
                    zoomControl={false}
                    scrollWheelZoom={false}
                    attributionControl={false}
                    doubleClickZoom={false}
                >
                    {/* Esri Dark Gray Base — Free, English labels, clear country borders */}
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                        attribution="&copy; Esri, HERE, Garmin, FAO, NOAA, USGS"
                        maxZoom={16}
                    />
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                        maxZoom={16}
                    />

                    {/* Animated attack polylines (city → SOC HQ) */}
                    {activeAttacks.map(attack => (
                        <Polyline
                            key={attack.id}
                            positions={[[attack.lat, attack.lng], [SOC_HQ.lat, SOC_HQ.lng]]}
                            color={SEV_COLOR[attack.severity] || "#ff3366"}
                            weight={1.5}
                            opacity={0.85}
                            dashArray="8 5"
                        />
                    ))}

                    {/* SOC HQ — cyan pulsing marker */}
                    <CircleMarker
                        center={[SOC_HQ.lat, SOC_HQ.lng]}
                        radius={9}
                        fillColor="#00d4ff"
                        color="#00d4ff"
                        weight={2}
                        fillOpacity={0.95}
                        className="soc-hq-marker"
                    >
                        <Popup className="threat-popup">
                            <strong style={{ color: "#00d4ff" }}>SOC HQ</strong><br />
                            Security Operations Center<br />
                            <small style={{ color: "#aaa" }}>Gujarat, India</small>
                        </Popup>
                    </CircleMarker>

                    {/* Threat origin city markers */}
                    {allThreats.map((threat, i) => {
                        const isActive = activeAttacks.some(a => a.name === threat.name);
                        return (
                            <CircleMarker
                                key={i}
                                center={[threat.lat, threat.lng]}
                                radius={isActive ? 9 : 5}
                                fillColor={SEV_COLOR[threat.severity]}
                                color={SEV_COLOR[threat.severity]}
                                weight={isActive ? 2 : 1}
                                fillOpacity={isActive ? 0.95 : 0.7}
                            >
                                <Popup className="threat-popup">
                                    <div style={{ fontFamily: "monospace", fontSize: "12px", minWidth: 160 }}>
                                        <span style={{ color: SEV_COLOR[threat.severity], fontWeight: 700 }}>
                                            ● {threat.severity}
                                        </span><br />
                                        <strong>{threat.name}, {threat.country}</strong><br />
                                        <span style={{ color: "#ccc" }}>{threat.title}</span><br />
                                        <small style={{ color: "#aaa" }}>Attacks: {threat.count}</small>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Bottom legend */}
            <div className="threat-map-legend">
                <span className="tl-item" style={{ color: "#ff3366" }}>■ CRITICAL</span>
                <span className="tl-item" style={{ color: "#ff9f43" }}>■ HIGH</span>
                <span className="tl-item" style={{ color: "#ffd700" }}>■ MEDIUM</span>
                <span className="tl-item" style={{ color: "#00ff88" }}>■ LOW</span>
                <span className="tl-item soc-label">◉ SOC HQ</span>
                <span className="tl-item" style={{ color: "#666" }}>— Attack Vector</span>
            </div>
        </div>
    );
}
