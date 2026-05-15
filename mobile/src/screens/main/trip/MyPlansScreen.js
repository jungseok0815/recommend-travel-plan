import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getTripList } from '../../../common/api';

const TABS = ['전체', '계획 중', '완료'];

const STATUS_COLOR = {
  '계획 중': { bg: '#EFF6FF', text: '#2563EB' },
  '완료':   { bg: '#F0FDF4', text: '#16A34A' },
};

const PlanCard = ({ item, onPress }) => {
  const sc = STATUS_COLOR[item.status];
  const saved = item.total_cost != null ? item.budget - item.total_cost : null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.destinationRow}>
          <Ionicons name="location" size={15} color="#111827" />
          <Text style={styles.destination}>{item.destination}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
        <Text style={styles.infoText}>{item.start_datetime} ~ {item.end_datetime}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="car-outline" size={13} color="#9CA3AF" />
        <Text style={styles.infoText}>{item.transport}</Text>
        <View style={styles.dot} />
        <Ionicons name="people-outline" size={13} color="#9CA3AF" />
        <Text style={styles.infoText}>{item.group_size}명</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.budgetBox}>
          <Text style={styles.budgetLabel}>예산</Text>
          <Text style={styles.budgetValue}>{item.budget.toLocaleString()}원</Text>
        </View>
        {item.total_cost != null && (
          <>
            <View style={styles.budgetBox}>
              <Text style={styles.budgetLabel}>실제 비용</Text>
              <Text style={[styles.budgetValue, { color: '#2563EB' }]}>
                {item.total_cost.toLocaleString()}원
              </Text>
            </View>
            {saved > 0 && (
              <View style={styles.budgetBox}>
                <Text style={styles.budgetLabel}>절감</Text>
                <Text style={[styles.budgetValue, { color: '#16A34A' }]}>
                  {saved.toLocaleString()}원
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function MyPlansScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(0);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlans = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getTripList();
      setPlans(data);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

  const filtered = useMemo(() => {
    if (activeTab === 0) return plans;
    return plans.filter((p) => p.status === TABS[activeTab]);
  }, [activeTab, plans]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 여행 계획</Text>
      </View>

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

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PlanCard item={item} onPress={() => navigation.navigate('MyPlanDetail', { trip: item })} />
          )}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPlans(true)} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Ionicons name="airplane-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>여행 계획이 없어요</Text>
              <Text style={styles.emptySubText}>홈에서 AI 여행 계획을 만들어보세요</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 22, gap: 8, marginBottom: 20 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  tabActive: { backgroundColor: '#111827' },
  tabText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#FFFFFF' },

  list: { paddingHorizontal: 22, paddingBottom: 24, gap: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '500', marginTop: 12 },
  emptySubText: { fontSize: 13, color: '#9CA3AF' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  destination: { fontSize: 17, fontWeight: '700', color: '#111827' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  infoText: { fontSize: 13, color: '#6B7280' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },

  cardFooter: {
    flexDirection: 'row', gap: 20,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    marginTop: 12, paddingTop: 12,
  },
  budgetBox: { gap: 3 },
  budgetLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  budgetValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
});
