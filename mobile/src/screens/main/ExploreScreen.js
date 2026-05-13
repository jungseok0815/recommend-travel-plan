import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCommunityTrips } from '../../services/authService';

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
};

const TripCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.destinationBadge}>
        <Ionicons name="location" size={14} color="#FFFFFF" />
        <Text style={styles.destinationText}>{item.destination}</Text>
      </View>
      <Text style={styles.userEmail}>{maskEmail(item.user_email)}</Text>
    </View>

    <View style={styles.cardBody}>
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={15} color="#6B7280" />
        <Text style={styles.infoText}>
          {item.start_datetime} ~ {item.end_datetime}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="car-outline" size={15} color="#6B7280" />
        <Text style={styles.infoText}>{item.transport}</Text>
        <View style={styles.dot} />
        <Ionicons name="people-outline" size={15} color="#6B7280" />
        <Text style={styles.infoText}>{item.group_size}명</Text>
      </View>
    </View>

    <View style={styles.cardFooter}>
      <View style={styles.budgetBox}>
        <Text style={styles.budgetLabel}>예산</Text>
        <Text style={styles.budgetValue}>{item.budget.toLocaleString()}원</Text>
      </View>
      {item.total_cost != null && (
        <View style={styles.budgetBox}>
          <Text style={styles.budgetLabel}>실제 비용</Text>
          <Text style={[styles.budgetValue, styles.totalCostValue]}>
            {item.total_cost.toLocaleString()}원
          </Text>
        </View>
      )}
    </View>
  </View>
);

export default function ExploreScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      setError(null);
      const data = await getCommunityTrips();
      setTrips(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>여행 탐색</Text>
        <Text style={styles.subtitle}>다른 여행자의 완료된 계획을 확인해보세요</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>불러오기 실패</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchTrips}>
            <Text style={styles.retryBtnText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <TripCard item={item} />}
          contentContainerStyle={trips.length === 0 ? styles.center : styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="compass-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>아직 공유된 여행 계획이 없어요</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  list: { paddingHorizontal: 22, paddingBottom: 24, gap: 14 },

  emptyBox: { alignItems: 'center', gap: 10, marginTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF', marginTop: 8 },

  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderRadius: 10,
  },
  retryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  destinationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  destinationText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  userEmail: { fontSize: 12, color: '#9CA3AF' },

  cardBody: { gap: 8, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: '#6B7280' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },

  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  budgetBox: { gap: 2 },
  budgetLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  budgetValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  totalCostValue: { color: '#2563EB' },
});
