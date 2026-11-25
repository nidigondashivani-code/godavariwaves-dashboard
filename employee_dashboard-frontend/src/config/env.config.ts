export const envConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  appName: import.meta.env.VITE_APP_NAME || 'Godavari Wave EMS',
};

export const getAssetUrl = (path?: string | null): string | null => {
  if (!path) return null;
  // If already an absolute URL, data URI, or blob URL, return as-is
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:image/') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Derive backend origin dynamically
  let base = envConfig.socketUrl;
  const isLocalBase = !base || base.includes('localhost') || base.includes('127.0.0.1');
  const apiBase = envConfig.apiBaseUrl;

  if (isLocalBase) {
    if (apiBase && !apiBase.includes('localhost') && !apiBase.includes('127.0.0.1')) {
      // e.g. "https://godavariwaves-dashboard.onrender.com/api/v1" -> "https://godavariwaves-dashboard.onrender.com"
      base = apiBase.replace(/\/api(\/v\d+)?\/?$/, '');
    } else if (typeof window !== 'undefined' && window.location.hostname && !window.location.hostname.includes('localhost')) {
      // Running in deployed web app (Vercel)
      base = 'https://godavariwaves-dashboard.onrender.com';
    }
  }

  const cleanBase = (base || '').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default envConfig;

