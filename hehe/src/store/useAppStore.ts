import { create } from 'zustand';
import { TelemetryItem, ZeroTrustDecision, SecurityAlert, TopologyNode } from '../types';

interface AppStore {
  activeTab: string;
  theme: 'dark' | 'light';
  wsConnected: boolean;
  telemetry: TelemetryItem[];
  latestMetrics: Record<string, any> | null;
  securityAlerts: SecurityAlert[];
  lastDecision: ZeroTrustDecision | null;
  selectedDevice: string;
  selectedRole: string;
  selectedCommand: string;
  breakerStateOverrides: Record<string, 'OPEN' | 'CLOSED'>;
  selectedNode: TopologyNode | null;
  isolatedDevices: string[];
  logFilterCategory: string;
  logFilterSeverity: string;
  logSearchQuery: string;

  setActiveTab: (tab: string) => void;
  toggleTheme: () => void;
  setWsConnected: (connected: boolean) => void;
  setTelemetry: (data: TelemetryItem[]) => void;
  setLatestMetrics: (metrics: Record<string, any>) => void;
  addSecurityAlert: (alert: { type: string; description: string; severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) => void;
  setLastDecision: (decision: ZeroTrustDecision) => void;
  setSelectedDevice: (device: string) => void;
  setSelectedRole: (role: string) => void;
  setSelectedCommand: (command: string) => void;
  toggleBreakerState: (deviceId: string) => void;
  setSelectedNode: (node: TopologyNode | null) => void;
  toggleDeviceIsolation: (deviceId: string) => void;
  setLogFilterCategory: (category: string) => void;
  setLogFilterSeverity: (severity: string) => void;
  setLogSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: 'dashboard',
  theme: (localStorage.getItem('quant_theme') as 'dark' | 'light') || 'dark',
  wsConnected: false,
  telemetry: [],
  latestMetrics: null,
  securityAlerts: [
    { id: 'ALT_01', type: 'HMAC_VERIFIED', description: 'Zero-Trust pipeline verified HMAC-SHA256 signature for BRK_12', severity: 'LOW', timestamp: Date.now() / 1000 - 120 },
    { id: 'ALT_02', type: 'QKD_SESSION_ROTATION', description: 'HKDF session key version rotated to v2.0 cleanly', severity: 'LOW', timestamp: Date.now() / 1000 - 300 },
  ],
  lastDecision: null,
  selectedDevice: 'BRK_12',
  selectedRole: 'CONTROL_OPERATOR',
  selectedCommand: 'OPEN_BREAKER',
  breakerStateOverrides: {
    'BRK_12': 'OPEN',
    'RELAY_04': 'CLOSED',
  },
  selectedNode: null,
  isolatedDevices: [],
  logFilterCategory: 'ALL',
  logFilterSeverity: 'ALL',
  logSearchQuery: '',

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('quant_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: nextTheme };
  }),
  setWsConnected: (connected) => set({ wsConnected: connected }),
  setTelemetry: (data) => set({ telemetry: data }),
  setLatestMetrics: (metrics) => set({ latestMetrics: metrics }),
  addSecurityAlert: (alert) => set((state) => ({
    securityAlerts: [
      {
        id: 'ALT_' + Math.random().toString(36).substring(2, 7),
        type: alert.type,
        description: alert.description,
        severity: alert.severity || 'LOW',
        timestamp: Date.now() / 1000
      },
      ...state.securityAlerts.slice(0, 49)
    ]
  })),
  setLastDecision: (decision) => set({ lastDecision: decision }),
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  setSelectedCommand: (command) => set({ selectedCommand: command }),
  toggleBreakerState: (deviceId) => set((state) => ({
    breakerStateOverrides: {
      ...state.breakerStateOverrides,
      [deviceId]: state.breakerStateOverrides[deviceId] === 'OPEN' ? 'CLOSED' : 'OPEN'
    }
  })),
  setSelectedNode: (node) => set({ selectedNode: node }),
  toggleDeviceIsolation: (deviceId) => set((state) => {
    const isIsolated = state.isolatedDevices.includes(deviceId);
    return {
      isolatedDevices: isIsolated
        ? state.isolatedDevices.filter(id => id !== deviceId)
        : [...state.isolatedDevices, deviceId]
    };
  }),
  setLogFilterCategory: (category) => set({ logFilterCategory: category }),
  setLogFilterSeverity: (severity) => set({ logFilterSeverity: severity }),
  setLogSearchQuery: (query) => set({ logSearchQuery: query }),
}));
