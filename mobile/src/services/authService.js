import * as WebBrowser from 'expo-web-browser';
import { getAccessToken, saveTokens, clearTokens } from '../utils/tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8000';

const request = async (url, options = {}) => {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // access_token 만료 시 refresh_token으로 자동 갱신
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) throw new Error('SESSION_EXPIRED');

    const newToken = await getAccessToken();
    const retryRes = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      },
    });
    return retryRes;
  }

  return res;
};

const tryRefreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const res = await fetch(`${BASE_URL}/user/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      await clearTokens();
      return false;
    }
    const { access_token, refresh_token } = await res.json();
    await saveTokens(access_token, refresh_token);
    return true;
  } catch {
    await clearTokens();
    return false;
  }
};

export const checkEmailDuplicate = async (email) => {
  const res = await fetch(`${BASE_URL}/user/check-email?email=${encodeURIComponent(email)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '이메일 확인 중 오류가 발생했습니다');
  return data.available; // true: 사용 가능, false: 중복
};

export const signup = async (email, password, address) => {
  const res = await fetch(`${BASE_URL}/user/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, address }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '회원가입에 실패했습니다');
  return data;
};

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '로그인에 실패했습니다');
  return data; // { access_token, refresh_token, token_type }
};

export const getMe = async () => {
  const res = await request('/user/me');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '유저 정보를 불러올 수 없습니다');
  return data; // { id, email, address }
};

export const updateMe = async (body) => {
  const res = await request('/user/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '정보 수정에 실패했습니다');
  return data;
};

export const openNaverLogin = async () => {
  const res = await fetch(`${BASE_URL}/user/auth/naver`);
  const data = await res.json();

  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    'travelplanner://auth/callback'
  );

  if (result.type !== 'success') return null;

  const query = result.url.split('?')[1] ?? '';
  const params = Object.fromEntries(query.split('&').map(p => p.split('=').map(decodeURIComponent)));
  if (!params.access_token) return null;

  return { access_token: params.access_token, refresh_token: params.refresh_token };
};

export const openKakaoLogin = async () => {
  const res = await fetch(`${BASE_URL}/user/auth/kakao`);
  const data = await res.json();

  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    'travelplanner://auth/callback'
  );

  if (result.type !== 'success') return null;

  const query = result.url.split('?')[1] ?? '';
  const params = Object.fromEntries(query.split('&').map(p => p.split('=').map(decodeURIComponent)));
  if (!params.access_token) return null;

  return { access_token: params.access_token, refresh_token: params.refresh_token };
};

export const getCommunityTrips = async () => {
  const res = await request('/trip/community');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '커뮤니티 여행 목록을 불러올 수 없습니다');
  return data;
};

export { request };
