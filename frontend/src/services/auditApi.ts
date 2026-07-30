export interface SystemAuditLogItem {
  id: number;
  session_uuid?: string;
  module_id: string;
  action: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  operator_role: string;
  source_node?: string;
  destination_node?: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface SystemAuditStats {
  total_events: number;
  critical_events: number;
  warning_events: number;
  success_events: number;
  info_events: number;
  module_breakdown: Record<string, number>;
  success_rate_pct: number;
}

const API_BASE = '/api/v1/audit';

export async function fetchAuditLogs(params?: {
  module_id?: string;
  severity?: string;
  session_uuid?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<SystemAuditLogItem[]> {
  const query = new URLSearchParams();
  if (params?.module_id) query.append('module_id', params.module_id);
  if (params?.severity) query.append('severity', params.severity);
  if (params?.session_uuid) query.append('session_uuid', params.session_uuid);
  if (params?.search) query.append('search', params.search);
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.offset) query.append('offset', params.offset.toString());

  const response = await fetch(`${API_BASE}/logs?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch system audit logs');
  }
  return response.json();
}

export async function fetchAuditStats(): Promise<SystemAuditStats> {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch audit stats');
  }
  return response.json();
}
