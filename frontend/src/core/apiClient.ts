import { API_BASE_URL } from './constants';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    let detailMsg = errorData.detail;
    if (Array.isArray(detailMsg)) {
      detailMsg = detailMsg.map((e: any) => e.msg || (typeof e === 'object' ? JSON.stringify(e) : String(e))).join(', ');
    } else if (typeof detailMsg === 'object' && detailMsg !== null) {
      detailMsg = JSON.stringify(detailMsg);
    }
    throw new Error(detailMsg || `HTTP Error ${response.status}`);
  }

  return response.json();
}
