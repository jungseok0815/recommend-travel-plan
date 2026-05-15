import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken, saveTokens, clearTokens } from '../utils/tokenStorage';

export const BASE_URL = 'http://localhost:8000';

const tryRefreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const res = await fetch(`${BASE_URL}/user/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) { await clearTokens(); return false; }
    const { access_token, refresh_token } = await res.json();
    await saveTokens(access_token, refresh_token);
    return true;
  } catch {
    await clearTokens();
    return false;
  }
};

export const request = async (url, options = {}) => {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) throw new Error('SESSION_EXPIRED');
    const newToken = await getAccessToken();
    return fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      },
    });
  }

  return res;
};
