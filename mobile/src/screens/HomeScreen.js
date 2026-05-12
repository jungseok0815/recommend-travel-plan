import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { clearTokens } from '../utils/tokenStorage';

export default function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await clearTokens();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✈️</Text>
        <Text style={styles.title}>여행 플래너</Text>
        <Text style={styles.subtitle}>로그인되었습니다</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});
