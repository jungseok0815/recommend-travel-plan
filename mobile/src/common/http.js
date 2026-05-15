import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../utils/tokenStorage';
import { navigationRef } from '../utils/navigationRef';

export const BASE_URL = 'http://localhost:8000';

export const request = async (url, options = {}) => {
  const accessToken  = await getAccessToken();
  const refreshToken = await getRefreshToken();
  console.log("accesstoken : ", accessToken)

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken  ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(refreshToken ? { 'Refresh-Token': refreshToken } : {}),
      ...options.headers,
    },
  }); 

  console.log("Res : " , res)

  if (res.status === 401) {
    console.log("come in not use token")
    await clearTokens();
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
    throw new Error('SESSION_EXPIRED');
  }

  const newAccessToken  = res.headers.get('New-Access-Token');
  const newRefreshToken = res.headers.get('New-Refresh-Token');
  if (newAccessToken && newRefreshToken) {
    await saveTokens(newAccessToken, newRefreshToken);
  }

  return res;
};
