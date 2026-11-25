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

  // If a localhost / 127.0.0.1 URL was saved in storage or state, strip the local origin
  if (path.includes('localhost:') || path.includes('127.0.0.1:')) {
    path = path.replace(/^https?:\/\/[^/]+/, '');
  }

  // If already base64 data, blob URL, or external HTTPS link, return directly
  if (
    path.startsWith('data:image/') ||
    path.startsWith('blob:') ||
    path.startsWith('https://')
  ) {
    return path;
  }

  // If non-local HTTP link
  if (path.startsWith('http://') && !path.includes('localhost') && !path.includes('127.0.0.1')) {
    return path;
  }

  // Determine backend origin
  const isBrowser = typeof window !== 'undefined';
  const isRemoteEnv = isBrowser && window.location.hostname && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');

  let base = envConfig.socketUrl;
  const isLocalBase = !base || base.includes('localhost') || base.includes('127.0.0.1');

  if (isRemoteEnv || isLocalBase) {
    const apiBase = envConfig.apiBaseUrl;
    if (apiBase && apiBase.startsWith('http') && !apiBase.includes('localhost') && !apiBase.includes('127.0.0.1')) {
      base = apiBase.replace(/\/api(\/v\d+)?\/?$/, '');
    } else {
      base = PROD_BACKEND_ORIGIN;
    }
  }

  const cleanBase = (base || PROD_BACKEND_ORIGIN).replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default envConfig;

