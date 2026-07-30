import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Car,
  Gauge,
  Home,
  Route,
  Settings,
  Wifi,
} from "lucide-react";

import type { AiDiagnosis, ObdScan } from "../../types/obd";
import VehicleScene from "./VehicleScene";
import "./blackbox-dashboard.css";
import "./blackbox-dashboard-tweaks.css";

export type BlackBoxSection =
  | "home"
  | "vehicles"
  | "trips"
  | "alerts"
  | "data"
  | "ai"
  | "reports"
  | "settings";

type DashboardMonitoringStatus = {
  isEnabled: boolean;
  lastProbeAt?: string | null;
} | null;

type BlackBoxDashboardProps = {
  scan: ObdScan | null;
  diagnosis: AiDiagnosis | null;
  monitoringStatus: DashboardMonitoringStatus;
  activeSection: BlackBoxSection;
  onSectionChange: (section: BlackBoxSection) => void;
  onRunLiveScan: () => void;
  onRunSimulatedScan: () => void;
  onAnalyze: () => void;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  isScanning: boolean;
  isAnalyzing: boolean;
  isMonitoringBusy: boolean;
  errorMessage: string | null;
  saveMessage: string | null;
  detailContent: ReactNode;
};

type NavItem = {
  section: BlackBoxSection;
  label: string;
  icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { section: "home", label: "Home", icon: Home },
  { section: "vehicles", label: "Vehicles", icon: Car },
  { section: "trips", label: "Trips", icon: Route },
  { section: "alerts", label: "Alerts", icon: AlertTriangle },
  { section: "data", label: "Data Explorer", icon: Activity },
  { section: "ai", label: "AI Insights", icon: BrainCircuit },
  { section: "reports", label: "Reports", icon: BarChart3 },
  { section: "settings", label: "Settings", icon: Settings },
];

const ORBIT_ITEMS = NAV_ITEMS.filter(
  (item) => item.section !== "home" && item.section !== "settings"
);

const SECTION_COPY: Record<BlackBoxSection, { title: string; body: string }> = {
  home: {
    title: "HOME",
    body: "Vehicle history, health trends, and system status.",
  },
  vehicles: {
    title: "VEHICLES",
    body: "Vehicle identity, assignment, and long-term condition.",
  },
  trips: {
    title: "TRIPS",
    body: "Review recorded sessions and vehicle activity.",
  },
  alerts: {
    title: "ALERTS",
    body: "Review faults and anomalies detected across recorded data.",
  },
  data: {
    title: "DATA EXPLORER",
    body: "Inspect averages, baselines, trends, and stored logger output.",
  },
  ai: {
    title: "AI INSIGHTS",
    body: "Analyze recorded and historical vehicle data.",
  },
  reports: {
    title: "REPORTS",
    body: "Review diagnostic summaries and saved history.",
  },
  settings: {
    title: "SETTINGS",
    body: "Configure logging, upload, and analysis behavior.",
  },
};

function countTroubleCodes(scan: ObdScan | null): number {
  const codes = (scan as any)?.troubleCodes;

  if (Array.isArray(codes)) return codes.length;
  if (!codes || typeof codes !== "object") return 0;

  return Object.values(codes).reduce((total: number, value) => {
    return total + (Array.isArray(value) ? value.length : 0);
  }, 0);
}

function formatValue(value: unknown, fallback: string): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function formatAverageCoolant(scan: ObdScan | null): string {
  const liveData = (scan as any)?.liveData;

  const value =
    liveData?.averageCoolantTempF ??
    liveData?.averageCoolantTemperature ??
    liveData?.coolantTempF ??
    liveData?.coolantTemperature ??
    liveData?.coolantTemp ??
    liveData?.engineCoolantTemperature;

  if (value === null || value === undefined || value === "") return "--";
  if (typeof value === "string") return value;

  return `${Math.round(Number(value))}°F`;
}

function formatLastUpload(value?: string | null): string {
  if (!value) return "No recent upload";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent upload";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BlackBoxDashboard({
  scan,
  diagnosis,
  monitoringStatus,
  activeSection,
  onSectionChange,
  onRunSimulatedScan,
  onAnalyze,
  onStartMonitoring,
  onStopMonitoring,
  isScanning,
  isAnalyzing,
  isMonitoringBusy,
  errorMessage,
  saveMessage,
  detailContent,
}: BlackBoxDashboardProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const vehicle = (scan as any)?.vehicle ?? {};
  const liveData = (scan as any)?.liveData ?? {};
  const history = (scan as any)?.historySummary ?? (scan as any)?.summary ?? {};

  const alertCount = useMemo(() => countTroubleCodes(scan), [scan]);
  const healthScore = Math.max(0, 100 - alertCount * 12);

  const vehicleName = scan
    ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ")
    : "2000 TOYOTA TUNDRA";

  const vin = formatValue(vehicle.vin, "5TBBT4412YS123456");

  const averageIdleRpm = formatValue(
    liveData.averageIdleRpm ??
      liveData.idleRpmAverage ??
      liveData.rpm,
    "--"
  );

  const tripCount = formatValue(
    history.tripCount ?? history.totalTrips ?? (scan ? 26 : null),
    "--"
  );

  const operatingHours = formatValue(
    history.operatingHours ?? history.engineHours ?? (scan ? 14.2 : null),
    "--"
  );

  const dataWindow = formatValue(
    history.dataWindow ?? history.period ?? (scan ? "Last 30 days" : null),
    "No history loaded"
  );

  const selectedCopy = SECTION_COPY[activeSection];
  const isMonitoring = Boolean(monitoringStatus?.isEnabled);

  return (
    <div className="bb-shell">
      <header className="bb-header">
        <div>
          <h1>BLACK BOX</h1>
          <p>VEHICLE INTELLIGENCE SYSTEM</p>
        </div>

        <div className="bb-clock" aria-label="Current date and time">
          <span>{now.toLocaleDateString()}</span>
          <span>
            {now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </header>

      <div className="bb-content-grid">
        <aside className="bb-sidebar" aria-label="Primary navigation">
          <nav className="bb-sidebar-nav">
            {NAV_ITEMS.map(({ section, label, icon: Icon }) => (
              <button
                key={section}
                type="button"
                className={`bb-nav-item ${
                  activeSection === section ? "is-active" : ""
                }`}
                onClick={() => onSectionChange(section)}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="bb-main-stage">
          {activeSection === "home" ? (
            <>
              <div className="bb-scene-canvas" aria-label="3D vehicle view">
                <VehicleScene />
              </div>

              <div className="bb-orbit-menu" aria-label="Quick navigation">
                {ORBIT_ITEMS.map(({ section, label, icon: Icon }) => (
                  <button
                    key={section}
                    type="button"
                    className={`bb-orbit-button bb-orbit-${section}`}
                    onClick={() => onSectionChange(section)}
                  >
                    <span className="bb-orbit-icon">
                      <Icon size={25} strokeWidth={1.8} />
                    </span>
                    <span className="bb-orbit-label">{label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <section className="bb-detail-stage">
              <div className="bb-detail-heading">
                <div>
                  <span>MODULE</span>
                  <h2>{selectedCopy.title}</h2>
                </div>
                <p>{selectedCopy.body}</p>
              </div>

              <div className="bb-detail-scroll">{detailContent}</div>
            </section>
          )}
        </main>

        <aside className="bb-right-rail">
          <section className="bb-panel bb-vehicle-panel">
            <div className="bb-panel-title">SELECTED VEHICLE</div>

            <div className="bb-vehicle-heading">
              <h2>{vehicleName || "UNKNOWN VEHICLE"}</h2>
              <p>VIN: {vin}</p>
            </div>

            <div className="bb-metric-list">
              <div>
                <span>STATUS</span>
                <strong className={alertCount > 0 ? "is-warning" : "is-good"}>
                  <i /> {alertCount > 0 ? "Attention" : "Good"}
                </strong>
              </div>

              <div>
                <span>HEALTH SCORE</span>
                <strong className={healthScore < 80 ? "is-warning" : "is-good"}>
                  {healthScore} / 100
                </strong>
              </div>

              <div>
                <span>AVG IDLE RPM</span>
                <strong>
                  {averageIdleRpm === "--" ? averageIdleRpm : `${averageIdleRpm} RPM`}
                </strong>
              </div>

              <div>
                <span>AVG COOLANT TEMP</span>
                <strong>{formatAverageCoolant(scan)}</strong>
              </div>

              <button type="button" onClick={() => onSectionChange("alerts")}>
                <span>ACTIVE ALERTS</span>
                <strong className={alertCount > 0 ? "is-warning" : "is-good"}>
                  {alertCount} ›
                </strong>
              </button>
            </div>
          </section>

          <section className="bb-panel bb-activity-panel">
            <div className="bb-panel-title">VEHICLE DATA SUMMARY</div>

            <div className="bb-activity-list">
              <div>
                <Gauge size={18} />
                <span>
                  <strong>Data coverage</strong>
                  <small>
                    {scan
                      ? `${tripCount} trips · ${operatingHours} operating hours`
                      : "No recorded vehicle data loaded"}
                  </small>
                </span>
              </div>

              <div>
                <Wifi size={18} />
                <span>
                  <strong>Last upload</strong>
                  <small>{formatLastUpload(monitoringStatus?.lastProbeAt)}</small>
                </span>
              </div>

              <div>
                <Activity size={18} />
                <span>
                  <strong>Analysis window</strong>
                  <small>{dataWindow}</small>
                </span>
              </div>

              <div>
                <AlertTriangle size={18} />
                <span>
                  <strong>Trend status</strong>
                  <small>
                    {alertCount > 0
                      ? `${alertCount} issue ${
                          alertCount === 1 ? "was" : "were"
                        } detected across recorded data`
                      : "No abnormal trends detected"}
                  </small>
                </span>
              </div>

              <div>
                <BrainCircuit size={18} />
                <span>
                  <strong>AI report</strong>
                  <small>
                    {diagnosis
                      ? "Historical analysis available"
                      : "No analysis generated"}
                  </small>
                </span>
              </div>
            </div>

            <div className="bb-activity-actions">
              <button
                type="button"
                onClick={onStartMonitoring}
                disabled={isMonitoring || isMonitoringBusy}
              >
                START
              </button>

              <button
                type="button"
                onClick={onStopMonitoring}
                disabled={!isMonitoring || isMonitoringBusy}
              >
                STOP
              </button>

              <button
                type="button"
                onClick={onRunSimulatedScan}
                disabled={isScanning}
              >
                {isScanning ? "LOADING" : "DEMO"}
              </button>
            </div>
          </section>
        </aside>
      </div>

      <footer className="bb-footer">
        <span>
          <i /> {isMonitoring ? "LOGGER ACTIVE" : "LOGGER STANDBY"}
        </span>

        <span>
          <Wifi size={18} /> DATABASE CONNECTED
        </span>

        <span>v1.0.0</span>
      </footer>

      {(errorMessage || saveMessage) && (
        <div className={`bb-toast ${errorMessage ? "is-error" : "is-success"}`}>
          {errorMessage ?? saveMessage}
        </div>
      )}
    </div>
  );
}