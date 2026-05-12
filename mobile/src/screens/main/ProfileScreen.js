import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clearTokens } from '../../utils/tokenStorage';

const MenuItem = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={20} color={danger ? '#EF4444' : '#6B7280'} />
    <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃', style: 'destructive',
        onPress: async () => {
          await clearTokens();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>프로필</Text>
      </View>

      {/* 유저 정보 */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#9CA3AF" />
        </View>
        <View>
          <Text style={styles.profileName}>여행자</Text>
          <Text style={styles.profileEmail}>이메일을 불러오는 중...</Text>
        </View>
      </View>

      {/* 메뉴 */}
      <View style={styles.menuGroup}>
        <Text style={styles.menuGroupTitle}>계정</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" label="내 정보 수정" onPress={() => {}} />
          <View style={styles.menuDivider} />
          <MenuItem icon="lock-closed-outline" label="비밀번호 변경" onPress={() => {}} />
          <View style={styles.menuDivider} />
          <MenuItem icon="notifications-outline" label="알림 설정" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.menuGroup}>
        <Text style={styles.menuGroupTitle}>기타</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="log-out-outline" label="로그아웃" onPress={handleLogout} danger />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 22,
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  profileName: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 3 },
  profileEmail: { fontSize: 13, color: '#9CA3AF' },

  menuGroup: { marginHorizontal: 22, marginBottom: 20 },
  menuGroupTitle: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, color: '#111827' },
  menuLabelDanger: { color: '#EF4444' },
  menuDivider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 52 },
});
