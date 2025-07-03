interface ApiConfig {
  baseUrl: string;
  wsUrl: string;
}

function getApiConfig(): ApiConfig {
  const isDev = window.location.hostname === 'localhost' && window.location.port === '5173';
  
  if (isDev) {
    return {
      baseUrl: 'http://localhost:3100/api',
      wsUrl: 'ws://localhost:3100'
    };
  } else {
    return {
      baseUrl: 'https://mrlouf.studio/api',
      wsUrl: 'wss://mrlouf.studio'
    };
  }
}

export const API_CONFIG = getApiConfig();

// Helper functions for building URLs
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

export function getWsUrl(endpoint: string): string {
  // Handle empty string case
  if (!endpoint || endpoint === '') {
    return `${API_CONFIG.wsUrl}/ws`;
  }
  
  // Handle non-empty endpoints
  return `${API_CONFIG.wsUrl}/ws${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}