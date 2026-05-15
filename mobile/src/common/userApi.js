import * as WebBrowser from 'expo-web-browser';
import { BASE_URL, request } from './http';

export const checkEmailDuplicate = async (email) => {
  const res = await fetch(`${BASE_URL}/user/check-email?email=${encodeURIComponent(email)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '이메일 확인 중 오류가 발생했습니다');
  return data.available;
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
  return data;
};

export const logout = async () => {
  await request('/user/logout', { method: 'POST' });
};

export const getMe = async () => {
  const res = await request('/user/me');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '유저 정보를 불러올 수 없습니다');
  return data;
};

export const updateMe = async (body) => {
  const res = await request('/user/me', { method: 'PATCH', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '정보 수정에 실패했습니다');
  return data;
};

export const openNaverLogin = async () => {
  const res = await fetch(`${BASE_URL}/user/auth/naver`);
  const data = await res.json();
  const result = await WebBrowser.openAuthSessionAsync(data.url, 'travelplanner://auth/callback');
  if (result.type !== 'success') return null;
  const params = Object.fromEntries(
    (result.url.split('?')[1] ?? '').split('&').map(p => p.split('=').map(decodeURIComponent))
  );
  if (!params.access_token) return null;
  return { access_token: params.access_token, refresh_token: params.refresh_token };
};

export const openKakaoLogin = async () => {
  const res = await fetch(`${BASE_URL}/user/auth/kakao`);
  const data = await res.json();
  const result = await WebBrowser.openAuthSessionAsync(data.url, 'travelplanner://auth/callback');
  if (result.type !== 'success') return null;
  const params = Object.fromEntries(
    (result.url.split('?')[1] ?? '').split('&').map(p => p.split('=').map(decodeURIComponent))
  );
  if (!params.access_token) return null;
  return { access_token: params.access_token, refresh_token: params.refresh_token };
};
