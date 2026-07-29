export interface TelemetryItem {
  device_id: string;
  substation_id: string;
  voltage: number;
  current: number;
  power_kw: number;
  frequency_hz: number;
  breaker_state: 'OPEN' | 'CLOSED';
  relay_state: 'NORMAL' | 'TRIPPED' | 'ALARM';
  timestamp?: number;
}

export interface ScadaSummaryData {
  telemetry: TelemetryItem[];
  device_states: Record<string, 'OPEN' | 'CLOSED'>;
  transformer_load_pct: number;
  generator_output_kw: number;
  power_factor: number;
  frequency_hz: number;
  grid_status: string;
  timestamp: number;
}

export interface QuantumNodeInfo {
  id: string;
  name: string;
  status: string;
}

export interface QuantumMetrics {
  chsh_bell_score: number;
  qber_pct: number;
  fidelity_pct: number;
  secret_key_rate_kbps: number;
  entangled_pairs_per_sec: number;
  channel_status: string;
  key_generation_progress_pct: number;
  quantum_nodes?: QuantumNodeInfo[];
  timestamp?: number;
}

export interface DeviceTrustInfo {
  device_id: string;
  device_name?: string;
  substation_id?: string;
  status?: 'ACTIVE' | 'ISOLATED' | 'REVOKED';
  trust_score: number;
  reputation?: string;
}

export interface SecurityAlert {
  id: string;
  type: string;
  description: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: number;
}

export interface SecurityMetrics {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  auth_success_count: number;
  auth_failure_count: number;
  replay_attacks_blocked: number;
  integrity_failures_blocked: number;
  active_sessions_count: number;
  device_trust_inventory: Record<string, DeviceTrustInfo | number>;
  recent_alerts?: SecurityAlert[];
  timestamp?: number;
}

export interface TopologyNode {
  id: string;
  label: string;
  type: 'CONTROL_CENTRE' | 'SUBSTATION' | 'BREAKER' | 'RELAY' | 'TRANSFORMER' | 'GENERATOR';
  status: 'GREEN' | 'YELLOW' | 'RED';
  x: number;
  y: number;
  details?: Record<string, any>;
}

export interface TopologyEdge {
  id?: string;
  source: string;
  target: string;
  type: 'QUANTUM_LINK' | 'SECURE_SESSION' | 'CLASSICAL';
  label: string;
}

export interface LogItem {
  id: string;
  category: 'SCADA' | 'SECURITY' | 'QUANTUM' | 'PACKET' | 'TELEMETRY' | 'AUDIT' | 'AI' | 'SYSTEM';
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: number;
  message: string;
  details: string;
}

export interface ComparisonMetric {
  parameter: string;
  classical: string;
  quantum: string;
  advantage: string;
}

export interface RadarData {
  categories: string[];
  classical_scores: number[];
  quantum_scores: number[];
}

export interface ComparisonData {
  metrics: ComparisonMetric[];
  radar_data: RadarData;
  timestamp: number;
}

export interface StepBreakdown {
  step: number;
  name: string;
  passed: boolean;
  details: string;
}

export interface ZeroTrustDecision {
  packet_id: string;
  device_id: string;
  decision: 'ALLOW' | 'BLOCK';
  overall_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  checks_passed: number;
  checks_failed: number;
  trust_score: number;
  rationale: string;
  step_breakdown: StepBreakdown[];
  timestamp: number;
}

export interface CommunicationMetrics {
  packets_sent: number;
  packets_received: number;
  queue_size: number;
  enc_latency_ms: number;
  dec_latency_ms: number;
  throughput_kbps: number;
  packet_loss_pct: number;
  retransmissions: number;
}

export interface AnalyticsData {
  timestamps: string[];
  latency_series_ms: number[];
  throughput_series_msg_sec: number[];
  qber_series_pct: number[];
  trust_score_series: number[];
  key_generation_rate_series: number[];
  replay_attacks_series: number[];
  timestamp: number;
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'SECURITY' | 'PERFORMANCE' | 'QUANTUM' | 'AUDIT';
  generated_at: number;
  status: 'READY' | 'GENERATING' | 'FAILED';
  format: string;
}

export interface DashboardSummary {
  system_status: string;
  network_health_pct: number;
  connected_substations: number;
  active_sessions: number;
  online_devices: number;
  active_quantum_links: number;
  active_security_alerts: number;
  current_qber_pct: number;
  secret_key_rate_kbps: number;
  ai_threat_level: string;
  packet_rate_sec: number;
  throughput_kbps: number;
  metrics_snapshot: Record<string, any>;
  timestamp: number;
}
