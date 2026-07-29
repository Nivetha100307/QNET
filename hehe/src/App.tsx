import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { wsManager } from './websocket/wsManager';
import { AppLayout } from './components/layout/AppLayout';

import { OverviewPage } from './pages/Dashboard/OverviewPage';
import { ScadaPanelPage } from './pages/SCADA/ScadaPanelPage';
import { QuantumDashboardPage } from './pages/Quantum/QuantumDashboardPage';
import { CommDashboardPage } from './pages/Communication/CommDashboardPage';
import { SocSecurityPage } from './pages/Security/SocSecurityPage';
import { NetworkTopologyPage } from './pages/Network/NetworkTopologyPage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { LogsExplorerPage } from './pages/Logs/LogsExplorerPage';
import { ComparisonPage } from './pages/Comparison/ComparisonPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

export const App: React.FC = () => {
  const { activeTab, setWsConnected, setTelemetry, addSecurityAlert } = useAppStore();

  useEffect(() => {
    // Initialize WebSocket connection
    wsManager.connect();

    const unsubConnection = wsManager.subscribe('connection_change', (data: { connected: boolean }) => {
      setWsConnected(data.connected);
    });

    const unsubTelemetry = wsManager.subscribe('TELEMETRY_STREAM', (data: any) => {
      if (data && data.telemetry) {
        setTelemetry(data.telemetry);
      }
    });

    return () => {
      unsubConnection();
      unsubTelemetry();
    };
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard': return <OverviewPage />;
      case 'scada': return <ScadaPanelPage />;
      case 'quantum': return <QuantumDashboardPage />;
      case 'comm': return <CommDashboardPage />;
      case 'security': return <SocSecurityPage />;
      case 'topology': return <NetworkTopologyPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'logs': return <LogsExplorerPage />;
      case 'comparison': return <ComparisonPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      default: return <OverviewPage />;
    }
  };

  return <AppLayout>{renderActivePage()}</AppLayout>;
};

export default App;
