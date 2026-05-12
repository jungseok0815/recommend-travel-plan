import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { clearTokens } from '../utils/tokenStorage';

export default function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await clearTokens();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>여행 플래너</Text>
      <Text style={styles.subtitle}>로그인에 성공했습니다!</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 28 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 48 },
  logoutBtn: {
    borderWidth: 1.5, borderColor: '#FF6B6B', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  logoutBtnText: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' },
});
