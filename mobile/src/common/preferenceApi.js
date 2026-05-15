import { BASE_URL, request } from './http';

export const fetchPreferenceOptions = async () => {
  const res = await fetch(`${BASE_URL}/preference/options`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '선택지를 불러올 수 없습니다');
  return data;
};

export const getPreference = async () => {
  const res = await request('/preference');
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '취향 정보를 불러올 수 없습니다');
  return data;
};

export const createPreference = async (body) => {
  const res = await request('/preference', { method: 'POST', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '취향 설정에 실패했습니다');
  return data;
};

export const updatePreference = async (body) => {
  const res = await request('/preference', { method: 'PUT', body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '취향 수정에 실패했습니다');
  return data;
};
