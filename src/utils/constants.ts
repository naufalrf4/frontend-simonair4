export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

export const API_BASE_URL = `${BASE_URL}/`;

export const SOCKET_URL = BASE_URL;

export const TOKEN_EXPIRY_MINUTES = 15;
export const REFRESH_CHECK_INTERVAL = 2 * 60 * 1000;
export const REFRESH_BUFFER_TIME = 2 * 60 * 1000;