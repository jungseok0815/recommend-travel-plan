import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RECENT_DUMMY = [
  { id: 1, destination: '제주도', start_datetime: '2025-05-01', end_datetime: '2025-05-03', status: '완료' },
  { id: 2, destination: '부산', start_datetime: '2025-06-10', end_datetime: '2025-06-12', status: '계획 중' },
];

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요 👋</Text>
        <Text style={styles.title}>오늘 어디로{'\n'}떠나볼까요?</Text>
      </View>

      {/* 일정 생성 카드 */}
      <TouchableOpacity
        style={styles.createCard}
        onPress={() => navigation.navigate('CreateTrip')}
        activeOpacity={0.75}
      >
        <View style={styles.createCardText}>
          <Text style={styles.createCardTitle}>AI 여행 계획 생성</Text>
          <Text style={styles.createCardSub}>취향을 반영한 맞춤 일정을 만들어드려요</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </TouchableOpacity>

      {/* 최근 여행 계획 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최근 여행 계획</Text>
        {RECENT_DUMMY.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="map-outline" size={36} color="#D1D5DB" />
            <Text style={styles.emptyText}>아직 여행 계획이 없어요</Text>
            <Text style={styles.emptySubText}>위에서 첫 번째 계획을 만들어보세요</Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {RECENT_DUMMY.map((trip) => (
              <TouchableOpacity key={trip.id} style={styles.recentCard} activeOpacity={0.75}>
                <View style={styles.recentCardLeft}>
                  <Text style={styles.recentDestination}>{trip.destination}</Text>
                  <Text style={styles.recentDate}>{trip.start_datetime} ~ {trip.end_datetime}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  trip.status === '완료' ? styles.statusDone : styles.statusPlanning,
                ]}>
                  <Text style={[
                    styles.statusText,
                    trip.status === '완료' ? styles.statusDoneText : styles.statusPlanningText,
                  ]}>
                    {trip.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 40 },

  header: { marginBottom: 24 },
  greeting: { fontSize: 14, color: '#9CA3AF', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', lineHeight: 36, letterSpacing: -0.5 },

  createCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  createCardText: { flex: 1, gap: 3 },
  createCardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  createCardSub: { fontSize: 12, color: '#9CA3AF' },

  section: { gap: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },

  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 15, color: '#6B7280', fontWeight: '500', marginTop: 4 },
  emptySubText: { fontSize: 13, color: '#9CA3AF' },

  recentList: { gap: 10 },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recentCardLeft: { gap: 4 },
  recentDestination: { fontSize: 15, fontWeight: '600', color: '#111827' },
  recentDate: { fontSize: 12, color: '#9CA3AF' },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPlanning: { backgroundColor: '#EFF6FF' },
  statusDone: { backgroundColor: '#F0FDF4' },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusPlanningText: { color: '#2563EB' },
  statusDoneText: { color: '#16A34A' },
});
