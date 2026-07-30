import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  CarFront,
  ChevronRight,
  CircleAlert,
  Gauge,
  House,
  Radio,
  Route,
  ScanLine,
  Settings,
  ShieldAlert,
  TriangleAlert,
  Wifi
} from "lucide-react";
import type { AiDiagnosis, ObdScan } from "../../types/obd";
import VehicleScene from "./VehicleScene";
import "./blackbox-dashboard.css";

export type BlackBoxSection =
  | "home"
  | "vehicles"
  | "trips"
  | "alerts"
  | "data"
  | "ai"
  | "reports"
  | "settings";

type MonitoringStatusLike = {
  isEnabled?: boolean;
  isIgnitionOn?: boolean;
  lastProbeAt?: string | null;
};

type BlackBoxDashboardProps = {
  scan: ObdScan | null;
  diagnosis?: AiDiagnosis | null;
  monitoringStatus?: MonitoringStatusLike | null;
  activeSection: BlackBoxSection;
  onSectionChange: (section: BlackBoxSection) => void;
  onRunLiveScan?: () => void;
  onRunSimulatedScan?: () => void;
  onAnalyze?: () => void;
  onStartMonitoring?: () => void;
  onStopMonitoring?: () => void;
  isScanning?: boolean;
  isAnalyzing?: boolean;
  isMonitoringBusy?: boolean;
  errorMessage?: string | null;
  saveMessage?: string | null;
  detailContent?: ReactNode;
};

const navItems: Array<{
  key: BlackBoxSection;
  label: string;
  icon: typeof House;
  description: string;
}> = [
  { key: "home", label: "Home", icon: House, description: "Vehicle health overview and system status." },
  { key: "vehicles", label: "Vehicles", icon: CarFront, description: "View and manage vehicles, identity, and current health." },
  { key: "trips", label: "Trips", icon: Route, description: "Review routes, drive cycles, and operational history." },
  { key: "alerts", label: "Alerts", icon: TriangleAlert, description: "Inspect faults, anomalies, and pre-failure warnings." },
  { key: "data", label: "Data Explorer", icon: Activity, description: "Explore recorded signals, trends, and CAN/OBD data." },
  { key: "ai", label: "AI Insights", icon: BrainCircuit, description: "Generate diagnosis, likely causes, and next actions." },
  { key: "reports", label: "Reports", icon: BarChart3, description: "Build maintenance and fleet health reports." },
  { key: "settings", label: "Settings", icon: Settings, description: "Configure logging, upload, vehicle, and account settings." }
];

const orbitalKeys: BlackBoxSection[] = ["vehicles", "trips", "alerts", "data", "ai", "reports"];

function fallbackScan(): ObdScan {
  return {
    id: "preview",
    createdAt: new Date().toISOString(),
    vehicle: {
      year: 2000,
      make: "Toyota",
      model: "Tundra",
      engine: "4.7L V8",
      vin: "5TBBT4412YS123456",
      mileage: 186420
    },
    liveData: {
      rpm: 0,
      vehicleSpeedMph: 0,
      coolantTempF: 188,
      intakeAirTempF: 82,
      engineLoadPercent: 18,
      throttlePositionPercent: 14,
      mafGps: 3.8,
      shortTermFuelTrimBank1Percent: 1.6,
      longTermFuelTrimBank1Percent: -0.8,
      o2SensorVoltageBank1Sensor1: 0.71,
      controlModuleVoltage: 13.9
    },
    troubleCodes: [],
    freezeFrame: {
      rpm: 0,
      vehicleSpeedMph: 0,
      coolantTempF: 188,
      engineLoadPercent: 18,
      fuelTrimBank1Percent: 0.8
    },
    readinessMonitors: {
      catalyst: "Ready",
      evaporativeSystem: "Ready",
      oxygenSensor: "Ready",
      oxygenSensorHeater: "Ready",
      egrSystem: "Ready"
    }
  };
}

function formatVehicle(scan: ObdScan) {
  return `${scan.vehicle.year} ${scan.vehicle.make} ${scan.vehicle.model}`.toUpperCase();
}

function formatTime(value?: string | null) {
  if (!value) return "No recent upload";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

function calculateHealth(scan: ObdScan) {
  const high = scan.troubleCodes.filter((code) => code.severity === "High").length;
  const medium = scan.troubleCodes.filter((code) => code.severity === "Medium").length;
  return Math.max(20, 100 - high * 24 - medium * 11 - scan.troubleCodes.length * 3);
}

export default function BlackBoxDashboard({
  scan,
  diagnosis,
  monitoringStatus,
  activeSection,
  onSectionChange,
  onRunLiveScan,
  onRunSimulatedScan,
  onAnalyze,
  onStartMonitoring,
  onStopMonitoring,
  isScanning = false,
  isAnalyzing = false,
  isMonitoringBusy = false,
  errorMessage,
  saveMessage,
  detailContent
}: BlackBoxDashboardProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const currentScan = scan ?? fallbackScan();
  const selected = navItems.find((item) => item.key === activeSection) ?? navItems[0];
  const SelectedIcon = selected.icon;
  const healthScore = calculateHealth(currentScan);
  const isOnline = monitoringStatus?.isEnabled ?? false;
  const activeAlerts = currentScan.troubleCodes.length;

  return (
    <main className="blackbox-shell">
      <header className="blackbox-header">
        <div>
          <div className="blackbox-wordmark">BLACK BOX</div>
          <div className="blackbox-subtitle">VEHICLE INTELLIGENCE SYSTEM</div>
        </div>
        <div className="blackbox-clock">
          <span>{now.toLocaleDateString()}</span>
          <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </header>

      <aside className="blackbox-sidebar" aria-label="Primary navigation">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`blackbox-nav-item ${activeSection === key ? "is-active" : ""}`}
            onClick={() => onSectionChange(key)}
          >
            <span className="nav-dot" />
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </aside>

      <section className="blackbox-stage">
        {activeSection === "home" ? (
          <>
            <div className="vehicle-canvas-wrap">
              <VehicleScene />
            </div>

            <div className="orbital-menu" aria-label="Dashboard shortcuts">
              {orbitalKeys.map((key, index) => {
                const item = navItems.find((entry) => entry.key === key)!;
                const Icon = item.icon;
                return (
                  <button
                    key={key}
                    className={`orbital-button orbital-${index + 1} ${activeSection === key ? "is-active" : ""}`}
                    onClick={() => onSectionChange(key)}
                    title={item.description}
                  >
                    <span className="orbital-icon"><Icon size={27} /></span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="detail-stage-panel">
            <div className="detail-stage-heading">
              <SelectedIcon size={26} />
              <div>
                <span className="eyebrow">BLACK BOX MODULE</span>
                <h1>{selected.label}</h1>
                <p>{selected.description}</p>
              </div>
            </div>
            {detailContent ?? (
              <div className="empty-module">
                <ScanLine size={38} />
                <strong>{selected.label} module ready</strong>
                <span>Move your existing dashboard component into this panel.</span>
              </div>
            )}
          </div>
        )}

        {(errorMessage || saveMessage) && (
          <div className={`system-message ${errorMessage ? "is-error" : "is-success"}`}>
            {errorMessage ?? saveMessage}
          </div>
        )}

        <div className="selection-card">
          <div className="selection-icon"><SelectedIcon size={34} /></div>
          <div>
            <span className="selection-title">{selected.label.toUpperCase()}</span>
            <p>{selected.description}</p>
          </div>
          <div className="selection-actions">
            <button onClick={onRunLiveScan} disabled={isScanning || !onRunLiveScan}>
              <Radio size={16} /> {isScanning ? "SCANNING" : "LIVE SCAN"}
            </button>
            <button onClick={onAnalyze} disabled={isAnalyzing || !scan || !onAnalyze}>
              <BrainCircuit size={16} /> {isAnalyzing ? "ANALYZING" : "AI ANALYZE"}
            </button>
          </div>
        </div>
      </section>

      <aside className="blackbox-right-rail">
        <section className="hud-panel selected-vehicle-panel">
          <div className="panel-title">SELECTED VEHICLE</div>
          <h2>{formatVehicle(currentScan)}</h2>
          <p className="vin">VIN: {currentScan.vehicle.vin || "VIN unavailable"}</p>

          <div className="mini-vehicle">
            <CarFront size={104} strokeWidth={0.8} />
          </div>

          <dl className="vehicle-metrics">
            <div><dt>STATUS</dt><dd className={healthScore > 70 ? "good" : "warn"}>{healthScore > 70 ? "● Good" : "● Inspect"}</dd></div>
            <div><dt>HEALTH SCORE</dt><dd className={healthScore > 70 ? "good" : "warn"}>{healthScore} / 100</dd></div>
            <div><dt>RPM</dt><dd>{currentScan.liveData.rpm.toLocaleString()}</dd></div>
            <div><dt>COOLANT</dt><dd>{currentScan.liveData.coolantTempF} °F</dd></div>
            <div><dt>ACTIVE ALERTS</dt><dd className={activeAlerts ? "warn" : "good"}>{activeAlerts}<ChevronRight size={17} /></dd></div>
          </dl>
        </section>

        <section className="hud-panel activity-panel">
          <div className="panel-title">SYSTEM ACTIVITY</div>
          <div className="activity-row">
            <Gauge size={19} />
            <div><strong>Logger status</strong><span>{isOnline ? "Monitoring enabled" : "Monitoring stopped"}</span></div>
          </div>
          <div className="activity-row">
            <Wifi size={19} />
            <div><strong>Last probe</strong><span>{formatTime(monitoringStatus?.lastProbeAt)}</span></div>
          </div>
          <div className="activity-row">
            {activeAlerts ? <ShieldAlert size={19} /> : <CircleAlert size={19} />}
            <div><strong>Diagnostic state</strong><span>{diagnosis?.summary ?? `${activeAlerts} active trouble codes`}</span></div>
          </div>
          <div className="panel-buttons">
            <button onClick={onStartMonitoring} disabled={isMonitoringBusy || isOnline || !onStartMonitoring}>START</button>
            <button onClick={onStopMonitoring} disabled={isMonitoringBusy || !isOnline || !onStopMonitoring}>STOP</button>
            <button onClick={onRunSimulatedScan} disabled={isScanning || !onRunSimulatedScan}>DEMO</button>
          </div>
        </section>
      </aside>

      <footer className="blackbox-statusbar">
        <div><span className={`status-light ${isOnline ? "online" : "offline"}`} />{isOnline ? "SYSTEM ONLINE" : "SYSTEM STANDBY"}</div>
        <div><Wifi size={20} /> {monitoringStatus?.isIgnitionOn ? "IGNITION ACTIVE" : "CONNECTED"}</div>
        <div>v1.0.0</div>
      </footer>
    </main>
  );
}
