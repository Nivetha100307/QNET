import { apiRequest } from '../core/apiClient';

export interface SecurityAnalysisResponse {
  session_uuid: string;
  bell_test_result: string;
  chsh_value: number;
  qber: number;
  fidelity: number;
  security_score: number;
  security_status: string;
  measurement_count: number;
  analysis_time_ms: number;
  bell_correlations: Record<string, number>;
  report_timestamp: string;
}

export interface SecurityStatusResponse {
  session_uuid: string;
  security_status: string;
  security_score: number;
  chsh_value: number;
  qber: number;
}

export async function analyzeSecurity(session_uuid: string): Promise<SecurityAnalysisResponse> {
  return apiRequest<SecurityAnalysisResponse>('/security/analyze', {
    method: 'POST',
    body: JSON.stringify({ session_uuid }),
  });
}

export async function fetchSecurityReport(session_uuid: string): Promise<SecurityAnalysisResponse> {
  return apiRequest<SecurityAnalysisResponse>(`/security/${session_uuid}`);
}

export async function fetchSecurityStatus(session_uuid: string): Promise<SecurityStatusResponse> {
  return apiRequest<SecurityStatusResponse>(`/security/status/${session_uuid}`);
}
