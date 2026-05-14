import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InfoChip = ({ icon, label }) => (
  <View style={styles.chip}>
    <Ionicons name={icon} size={14} color="#6B7280" />
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

export default function TripDetailScreen({ navigation, route }) {
  const { trip } = route.params;

  const totalDays = trip.days?.length ?? 0;
  const dayCosts = trip.days?.map((d) =>
    d.schedules.reduce((sum, s) => sum + (s.cost ?? 0), 0)
  ) ?? [];

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>여행 상세</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 히어로 */}
        <View style={styles.hero}>
          <View style={styles.destinationRow}>
            <Ionicons name="location" size={20} color="#111827" />
            <Text style={styles.destination}>{trip.destination}</Text>
          </View>
          <Text style={styles.userEmail}>{trip.user_email}</Text>
        </View>

        {/* 기본 정보 칩 */}
        <View style={styles.chipRow}>
          <InfoChip icon="calendar-outline" label={`${trip.start_datetime} ~ ${trip.end_datetime}`} />
          <InfoChip icon="car-outline" label={trip.transport} />
          <InfoChip icon="people-outline" label={`${trip.group_size}명`} />
        </View>

        {/* 예산 요약 */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>계획 예산</Text>
            <Text style={styles.budgetValue}>{trip.budget.toLocaleString()}원</Text>
          </View>
          {trip.total_cost != null && (
            <>
              <View style={styles.budgetDivider} />
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>실제 비용</Text>
                <Text style={[styles.budgetValue, styles.actualCost]}>
                  {trip.total_cost.toLocaleString()}원
                </Text>
              </View>
              <View style={styles.budgetDivider} />
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>절감 금액</Text>
                <Text style={[styles.budgetValue, styles.savedCost]}>
                  {(trip.budget - trip.total_cost).toLocaleString()}원
                </Text>
              </View>
            </>
          )}
        </View>

        {/* 일정 */}
        {trip.days && trip.days.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>일정</Text>
            {trip.days.map((day, di) => (
              <View key={di} style={styles.dayBlock}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                  </View>
                  <Text style={styles.dayDate}>{day.date}</Text>
                  <Text style={styles.dayCost}>
                    {dayCosts[di].toLocaleString()}원
                  </Text>
                </View>

                {day.schedules.map((s, si) => (
                  <View key={si} style={styles.scheduleItem}>
                    <View style={styles.scheduleTimeline}>
                      <Text style={styles.scheduleTime}>{s.time}</Text>
                      <View style={styles.timelineDot} />
                      {si < day.schedules.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.scheduleBody}>
                      <Text style={styles.scheduleActivity}>{s.activity}</Text>
                      <View style={styles.scheduleMetaRow}>
                        <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.scheduleLocation}>{s.location}</Text>
                        {s.cost > 0 && (
                          <>
                            <View style={styles.metaDot} />
                            <Text style={styles.scheduleCost}>{s.cost.toLocaleString()}원</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },

  content: { padding: 22, gap: 20, paddingBottom: 40 },

  hero: { gap: 6 },
  destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  destination: { fontSize: 26, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },
  userEmail: { fontSize: 13, color: '#9CA3AF' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F3F4F6', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipText: { fontSize: 13, color: '#6B7280' },

  budgetCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  budgetItem: { flex: 1, alignItems: 'center', gap: 4 },
  budgetDivider: { width: 1, height: 36, backgroundColor: '#F3F4F6' },
  budgetLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  budgetValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  actualCost: { color: '#2563EB' },
  savedCost: { color: '#16A34A' },

  section: { gap: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  dayBlock: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 16,
  },
  dayBadge: {
    backgroundColor: '#111827', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  dayBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  dayDate: { fontSize: 13, color: '#6B7280', flex: 1 },
  dayCost: { fontSize: 13, fontWeight: '600', color: '#374151' },

  scheduleItem: { flexDirection: 'row', gap: 12, minHeight: 52 },
  scheduleTimeline: { alignItems: 'center', width: 44 },
  scheduleTime: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 },
  timelineDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#111827', marginBottom: 2,
  },
  timelineLine: { flex: 1, width: 1, backgroundColor: '#E5E7EB' },

  scheduleBody: { flex: 1, paddingBottom: 12 },
  scheduleActivity: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 4 },
  scheduleMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scheduleLocation: { fontSize: 12, color: '#9CA3AF' },
  metaDot: { width: 2, height: 2, borderRadius: 1, backgroundColor: '#D1D5DB' },
  scheduleCost: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
});
