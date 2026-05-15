import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveTokens = async (accessToken, refreshToken) => {
  await AsyncStorage.setItem('access_token', accessToken);
  await AsyncStorage.setItem('refresh_token', refreshToken);
};

export const getAccessToken = () => AsyncStorage.getItem('access_token');
export const getRefreshToken = () => AsyncStorage.getItem("refresh_token")

export const clearTokens = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
};
