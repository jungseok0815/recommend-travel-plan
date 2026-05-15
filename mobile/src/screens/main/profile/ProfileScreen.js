import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clearTokens } from '../../../utils/tokenStorage';
import { getMe, logout } from '../../../common/userApi';
import { getPreference } from '../../../common/preferenceApi';
import { navigationRef } from '../../../utils/navigationRef';

const PREF_LABELS = {
  travel_style:     '여행 스타일',
  environment:      '선호 환경',
  accommodation:    '숙박 유형',
  interest:         '관심사',
  travel_frequency: '여행 빈도',
};

const MenuItem = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={20} color={danger ? '#EF4444' : '#6B7280'} />
    <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const [user, setUser]           = useState(null);
  const [preference, setPreference] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      getMe().catch(() => null),
      getPreference().catch(() => null),
    ]).then(([u, p]) => {
      setUser(u);
      setPreference(p);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    console.log("test1234")
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃', style: 'destructive',
        onPress: async () => {
          try { await logout(); } catch {}
          await clearTokens();
          navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <Text style={styles.title}>프로필</Text>
      </View>

      {/* 유저 정보 */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#9CA3AF" />
        </View>
        {loading ? (
          <ActivityIndicator color="#111827" />
        ) : (
          <View>
            <Text style={styles.profileEmail}>{user?.email ?? '-'}</Text>
            <Text style={styles.profileAddress}>{user?.address ?? '-'}</Text>
          </View>
        )}
      </View>

      {/* 취향 정보 */}
      {!loading && (
        <View style={styles.menuGroup}>
          <Text style={styles.menuGroupTitle}>취향 정보</Text>
          <View style={styles.menuCard}>
            {preference ? (
              <>
                {Object.entries(PREF_LABELS).map(([key, label], idx, arr) => {
                  const val = preference[key];
                  const display = Array.isArray(val) ? val.join(', ') : val;
                  return (
                    <View key={key}>
                      <View style={styles.prefRow}>
                        <Text style={styles.prefLabel}>{label}</Text>
                        <Text style={styles.prefValue}>{display || '-'}</Text>
                      </View>
                      {idx < arr.length - 1 && <View style={styles.menuDivider} />}
                    </View>
                  );
                })}
              </>
            ) : (
              <View style={styles.prefEmpty}>
                <Text style={styles.prefEmptyText}>취향 정보가 없어요</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 메뉴 */}
      <View style={styles.menuGroup}>
        <Text style={styles.menuGroupTitle}>계정</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" label="내 정보 수정" onPress={() => navigation.navigate('EditProfile', { user })} />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="color-wand-outline"
            label="취향 설정"
            onPress={() => navigation.navigate('Onboarding', { isEditing: true, existing: preference })}
          />
          <View style={styles.menuDivider} />
          <MenuItem icon="notifications-outline" label="알림 설정" onPress={() => navigation.navigate('NotificationSettings')} />
        </View>
      </View>

      <View style={styles.menuGroup}>
        <Text style={styles.menuGroupTitle}>기타</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="log-out-outline" label="로그아웃" onPress={handleLogout} danger />
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingBottom: 40 },

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
  profileEmail: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 3 },
  profileAddress: { fontSize: 13, color: '#9CA3AF' },

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
  menuDivider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 18 },

  prefRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 18, paddingVertical: 14, gap: 12,
  },
  prefLabel: { fontSize: 14, color: '#9CA3AF', width: 80 },
  prefValue: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '500', flexWrap: 'wrap' },
  prefEmpty: { paddingHorizontal: 18, paddingVertical: 20, alignItems: 'center' },
  prefEmptyText: { fontSize: 14, color: '#9CA3AF' },
});
