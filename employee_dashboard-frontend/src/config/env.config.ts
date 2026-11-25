export const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  appName: import.meta.env.VITE_APP_NAME || 'Godavari Wave EMS',
};

const PROD_BACKEND_ORIGIN = 'https://godavariwaves-dashboard.onrender.com';

export const getAssetUrl = (rawPath?: string | null): string | null => {
  if (!rawPath || typeof rawPath !== 'string') return null;
  let path = rawPath.trim();
  if (!path) return null;

  // Clean localhost, 127.0.0.1, or misconfigured backend hosts (e.g. godavariwaves-backend)
  if (
    path.includes('localhost:') ||
    path.includes('127.0.0.1:') ||
    path.includes('godavariwaves-backend.onrender.com')
  ) {
    path = path.replace(/^https?:\/\/[^/]+/, '');
  }

  // If already base64 data, blob URL, or external HTTPS link, return directly
  if (
    path.startsWith('data:image/') ||
    path.startsWith('blob:') ||
    (path.startsWith('https://') && !path.includes('godavariwaves-backend.onrender.com'))
  ) {
    return path;
  }

  // If non-local external HTTP link
  if (path.startsWith('http://') && !path.includes('localhost') && !path.includes('127.0.0.1')) {
    return path;
  }

  // Assets are served by the REST API backend origin
  let base = PROD_BACKEND_ORIGIN;
  const apiBase = envConfig.apiBaseUrl;

  if (apiBase && apiBase.startsWith('http')) {
    // If apiBaseUrl is localhost and we are running on localhost, use localhost
    const isBrowser = typeof window !== 'undefined';
    const isLocalBrowser = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocalBrowser && (apiBase.includes('localhost') || apiBase.includes('127.0.0.1'))) {
      base = apiBase.replace(/\/api(\/v\d+)?\/?$/, '');
    } else if (!apiBase.includes('localhost') && !apiBase.includes('127.0.0.1')) {
      base = apiBase.replace(/\/api(\/v\d+)?\/?$/, '');
    }
  }

  const cleanBase = (base || PROD_BACKEND_ORIGIN).replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default envConfig;

