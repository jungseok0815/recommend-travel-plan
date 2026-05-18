import { request } from './http';

export const createTrip = async (tripData) => {
  console.log("tripdata : ", tripData)
  const res = await request('/trip', {
    method: 'POST',
    body: JSON.stringify(tripData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '여행 일정 생성에 실패했습니다');
  return data;
};

export const getTripList = async () => {
  const res = await request('/trip');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '여행 목록을 불러올 수 없습니다');
  return data;
};

export const getCommunityTrips = async () => {
  const res = await request('/trip/community');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '커뮤니티 여행 목록을 불러올 수 없습니다');
  return data;
};

export const saveReview = async (tripId, rating, content) => {
  const res = await request(`/trip/${tripId}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating, content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '리뷰 저장에 실패했습니다');
  return data;
};

export const fetchReview = async (tripId) => {
  const res = await request(`/trip/${tripId}/review`);
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '리뷰를 불러올 수 없습니다');
  return data;
};

export const getParticipants = async (tripId) => {
  const res = await request(`/trip/${tripId}/participants`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '참여자 목록을 불러올 수 없습니다');
  return data;
};

export const addParticipant = async (tripId, email) => {
  const res = await request(`/trip/${tripId}/participants`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || '참여자 추가에 실패했습니다');
  return data;
};

export const removeParticipant = async (tripId, userId) => {
  const res = await request(`/trip/${tripId}/participants/${userId}`, { method: 'DELETE' });
  if (res.status === 204) return;
  const data = await res.json();
  throw new Error(data.detail || '참여자 제거에 실패했습니다');
};
