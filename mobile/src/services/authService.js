import * as WebBrowser from 'expo-web-browser';

const BASE_URL = 'http://localhost:8000';

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

export const openNaverLogin = async () => {
  const res = await fetch(`${BASE_URL}/user/auth/naver`);
  const data = await res.json();
  await WebBrowser.openBrowserAsync(data.url);
};

export const openKakaoLogin = async () => {
  // 백엔드 카카오 OAuth 엔드포인트 구현 후 연동 필요
  const KAKAO_REST_API_KEY = 'YOUR_KAKAO_REST_API_KEY';
  const REDIRECT_URI = `${BASE_URL}/user/auth/kakao/callback`;
  const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
  await WebBrowser.openBrowserAsync(url);
};
