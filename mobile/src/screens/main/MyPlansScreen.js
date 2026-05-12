import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TABS = ['전체', '계획 중', '완료'];

export default function MyPlansScreen() {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>내 여행 계획</Text>
      </View>

      {/* 탭 */}
      <View style={styles.tabRow}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 빈 상태 */}
      <ScrollView contentContainerStyle={styles.emptyContainer}>
        <Ionicons name="airplane-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>여행 계획이 없어요</Text>
        <Text style={styles.emptySubText}>홈에서 AI 여행 계획을 만들어보세요</Text>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: '#111827' },
  tabText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#FFFFFF' },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 80,
  },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '500', marginTop: 12 },
  emptySubText: { fontSize: 13, color: '#9CA3AF' },
});
