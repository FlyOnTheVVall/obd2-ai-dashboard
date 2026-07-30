import type { AiDiagnosis, ObdScan } from "../types/obd";
import type { MonitoringStatus } from "../services/monitoringApi";

export const demoTundraSymptoms =
  "Intermittent exhaust tick during cold starts. No major drivability complaint.";

export const demoTundraScan: ObdScan = {
  id: "demo-tundra-exhaust-leak",
  createdAt: new Date().toISOString(),

  vehicle: {
    year: 2000,
    make: "Toyota",
    model: "Tundra",
    engine: "4.7L V8",
    vin: "5TBBT4412YS123456",
    mileage: 186420,
  },

  liveData: {
    rpm: 728,
    vehicleSpeedMph: 0,
    coolantTempF: 192,
    intakeAirTempF: 91,
    engineLoadPercent: 22.4,
    throttlePositionPercent: 14.1,
    mafGps: 5.1,
    mapKpa: 36,

    // Strong positive correction on Bank 1.
    shortTermFuelTrimBank1Percent: 18.8,
    longTermFuelTrimBank1Percent: 13.6,

    // Lean upstream snapshot and very low downstream voltage.
    o2SensorVoltageBank1Sensor1: 0.11,
    o2SensorVoltageBank1Sensor2: 0.08,

    runTimeSeconds: 1482,
    fuelLevelPercent: 58,
    barometricPressureKpa: 98,
    controlModuleVoltage: 13.9,
  },

  troubleCodes: [
    {
      code: "P0137",
      description:
        "O2 Sensor Circuit Low Voltage — Bank 1, Sensor 2",
      system: "Fuel and emissions",
      severity: "Medium",
      status: "Stored",
      possibleCauses: [
        "Exhaust leak near the Bank 1 oxygen sensors",
        "Outside air entering the exhaust ahead of the upstream sensor",
        "Damaged Bank 1 Sensor 2 or sensor wiring",
        "Persistently lean Bank 1 exhaust condition",
      ],
    },
  ],

  freezeFrame: {
    rpm: 735,
    vehicleSpeedMph: 0,
    coolantTempF: 192,
    engineLoadPercent: 22.1,

    // STFT + LTFT combined.
    fuelTrimBank1Percent: 32.4,
  },

  readinessMonitors: {
    catalyst: "Not Ready",
    evaporativeSystem: "Ready",
    oxygenSensor: "Not Ready",
    oxygenSensorHeater: "Ready",
    egrSystem: "Ready",
  },

  monitorStatus: {
    milOn: true,
    storedCodeCount: 1,
  },

  symptoms: demoTundraSymptoms,
};

export const demoTundraDiagnosis: AiDiagnosis = {
  summary:
    "Bank 1 fuel correction is approximately +32.4% at idle. The strongly positive trims, lean upstream O2 snapshot, low Bank 1 Sensor 2 voltage, and reported cold-start exhaust tick indicate a likely Bank 1 exhaust leak ahead of the upstream oxygen sensor. The downstream O2 alert may be a secondary result of outside air entering the exhaust.",

  severity: "Medium",

  likelyCauses: [
    "Bank 1 exhaust manifold gasket leak",
    "Cracked Bank 1 exhaust manifold",
    "Leak at the manifold-to-front-pipe connection",
    "Bank 1 Sensor 2 or wiring fault occurring alongside the exhaust leak",
  ],

  nextSteps: [
    "Inspect Bank 1 during a cold start for ticking, soot marks, or escaping exhaust.",
    "Smoke-test the Bank 1 exhaust manifold and front-pipe connections.",
    "Compare fuel trims at idle and 2,500 RPM; a significant decrease above idle supports a leak-related false lean condition.",
    "Repair the exhaust leak before replacing the oxygen sensor.",
    "Clear the code and verify that combined Bank 1 fuel correction returns near ±5%.",
  ],
};

export const demoTundraMonitoringStatus: MonitoringStatus = {
  isRunning: true,
  sessionId: "demo-tundra-session",
  startedAt: new Date(Date.now() - 26 * 60_000).toISOString(),
  stoppedAt: null,
  intervalMs: 5000,
  samplesCollected: 312,
  lastSampleAt: new Date().toISOString(),
  lastError: null,
  latestSnapshot: demoTundraScan,

  activeAlerts: [
    {
      id: "demo-alert-b1s2",
      createdAt: new Date().toISOString(),
      severity: "Medium",
      title: "Bank 1 O2 Sensor 2 Low Voltage",
      message:
        "Bank 1 Sensor 2 voltage has remained below its expected operating range while Bank 1 fuel correction is elevated.",
      pid: "P0137",
    },
  ],
};