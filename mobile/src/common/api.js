import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken, saveTokens, clearTokens } from '../utils/tokenStorage';

const BASE_URL = 'http://localhost:8000';

// ── Base ─────────────────────────────────────────────────────

// access_token 만료(401) 시 refresh_token으로 새 토큰 발급 후 저장
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

// 인증이 필요한 API 요청의 공통 함수
// Authorization 헤더를 자동으로 추가하고, 401 응답 시 토큰 갱신 후 재시도
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

// ── User ─────────────────────────────────────────────────────

// 이메일 중복 여부 확인 - true: 사용 가능, false: 중복
export const checkEmailDuplicate = async (email) => {
  const res = await fetch(`${BASE_URL}/user/check-email?email=${encodeURIComponent(email)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '이메일 확인 중 오류가 발생했습니다');
  return data.available;
};

// 이메일·비밀번호·출발지(address)로 회원가입
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

// 이메일·비밀번호 로그인 - { access_token, refresh_token } 반환
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

// 로그인된 사용자 정보 조회 - { id, email, address } 반환
export const getMe = async () => {
  const res = await request('/user/me');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '유저 정보를 불러올 수 없습니다');
  return data;
};

// 내 정보 수정 (이메일·비밀번호·출발지 부분 변경 가능)
export const updateMe = async (body) => {
  const res = await request('/user/me', { method: 'PATCH', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '정보 수정에 실패했습니다');
  return data;
};

// 네이버 소셜 로그인 - 브라우저 열어 OAuth 진행 후 토큰 반환
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

// 카카오 소셜 로그인 - 브라우저 열어 OAuth 진행 후 토큰 반환
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

// ── Trip ─────────────────────────────────────────────────────

// 다른 사용자들의 여행 일정 목록 조회 (탐색 화면)
export const getCommunityTrips = async () => {
  const res = await request('/trip/community');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '커뮤니티 여행 목록을 불러올 수 없습니다');
  return data;
};

// 여행 리뷰 작성 또는 수정 (완료된 여행만 가능)
export const saveReview = async (tripId, rating, content) => {
  const res = await request(`/trip/${tripId}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating, content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '리뷰 저장에 실패했습니다');
  return data;
};

// 특정 여행의 리뷰 조회 - 없으면 null 반환
export const fetchReview = async (tripId) => {
  const res = await request(`/trip/${tripId}/review`);
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '리뷰를 불러올 수 없습니다');
  return data;
};

// 여행 동행자 목록 조회 (방장 포함, is_owner 필드로 구분)
export const getParticipants = async (tripId) => {
  const res = await request(`/trip/${tripId}/participants`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '참여자 목록을 불러올 수 없습니다');
  return data;
};

// 이메일로 동행자 초대 (방장만 가능)
export const addParticipant = async (tripId, email) => {
  const res = await request(`/trip/${tripId}/participants`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '참여자 추가에 실패했습니다');
  return data;
};

// 동행자 제거 (방장만 가능)
export const removeParticipant = async (tripId, userId) => {
  const res = await request(`/trip/${tripId}/participants/${userId}`, { method: 'DELETE' });
  if (res.status === 204) return;
  const data = await res.json();
  throw new Error(data.detail || '참여자 제거에 실패했습니다');
};

// ── Preference ───────────────────────────────────────────────

// 취향 설문 선택지 목록 조회 (로그인 불필요, 온보딩 화면에서 사용)
export const fetchPreferenceOptions = async () => {
  const res = await fetch(`${BASE_URL}/preference/options`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '선택지를 불러올 수 없습니다');
  return data;
};

// 내 취향 정보 조회 - 설정한 적 없으면 null 반환 (최초 로그인 판단에 활용)
export const getPreference = async () => {
  const res = await request('/preference');
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '취향 정보를 불러올 수 없습니다');
  return data;
};

// 취향 최초 설정 (온보딩 완료 시 호출)
export const createPreference = async (body) => {
  const res = await request('/preference', { method: 'POST', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '취향 설정에 실패했습니다');
  return data;
};

// 취향 수정 (프로필 > 취향 설정에서 호출)
export const updatePreference = async (body) => {
  const res = await request('/preference', { method: 'PUT', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '취향 수정에 실패했습니다');
  return data;
};
