import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TABS = ['전체', '계획 중', '완료'];

const DUMMY_PLANS = [
  {
    id: 1,
    destination: '제주도',
    transport: '대중교통',
    start_datetime: '2025-07-10',
    end_datetime: '2025-07-13',
    group_size: 2,
    budget: 800000,
    total_cost: null,
    status: '계획 중',
    days: [
      { day: 1, date: '2025-07-10', schedules: [
        { time: '10:00', activity: '제주공항 도착', location: '제주국제공항', cost: 0 },
        { time: '12:00', activity: '점심 - 흑돼지 구이', location: '제주시 연동', cost: 25000 },
        { time: '14:00', activity: '용두암 관광', location: '용두암', cost: 0 },
        { time: '19:00', activity: '저녁 - 해산물', location: '제주항 근처', cost: 35000 },
      ]},
      { day: 2, date: '2025-07-11', schedules: [
        { time: '09:00', activity: '한라산 어리목 코스 등반', location: '한라산 국립공원', cost: 0 },
        { time: '14:00', activity: '협재해수욕장', location: '협재해수욕장', cost: 0 },
        { time: '19:00', activity: '저녁 - 갈치조림', location: '제주시', cost: 20000 },
      ]},
      { day: 3, date: '2025-07-12', schedules: [
        { time: '10:00', activity: '성산일출봉 등반', location: '성산일출봉', cost: 5000 },
        { time: '13:00', activity: '점심 - 전복죽', location: '성산읍', cost: 15000 },
        { time: '15:00', activity: '섭지코지 산책', location: '섭지코지', cost: 0 },
        { time: '19:00', activity: '저녁 - 돔베고기', location: '서귀포', cost: 22000 },
      ]},
      { day: 4, date: '2025-07-13', schedules: [
        { time: '10:00', activity: '면세점 쇼핑', location: '제주공항 면세점', cost: 50000 },
        { time: '13:00', activity: '공항 출발', location: '제주국제공항', cost: 0 },
      ]},
    ],
  },
  {
    id: 2,
    destination: '부산',
    transport: '자동차',
    start_datetime: '2025-06-05',
    end_datetime: '2025-06-07',
    group_size: 4,
    budget: 600000,
    total_cost: null,
    status: '계획 중',
    days: [
      { day: 1, date: '2025-06-05', schedules: [
        { time: '11:00', activity: '해운대 해수욕장 도착', location: '해운대 해수욕장', cost: 0 },
        { time: '13:00', activity: '점심 - 밀면', location: '해운대 밀면 골목', cost: 9000 },
        { time: '15:00', activity: '동백섬 산책', location: '동백섬', cost: 0 },
        { time: '19:00', activity: '저녁 - 씨푸드', location: '해운대', cost: 45000 },
      ]},
      { day: 2, date: '2025-06-06', schedules: [
        { time: '10:00', activity: '광안리 해수욕장', location: '광안리', cost: 0 },
        { time: '12:00', activity: '점심 - 돼지국밥', location: '광안리', cost: 10000 },
        { time: '18:00', activity: '광안대교 야경', location: '광안리', cost: 0 },
        { time: '19:30', activity: '저녁 - 조개구이', location: '민락수변공원', cost: 35000 },
      ]},
      { day: 3, date: '2025-06-07', schedules: [
        { time: '09:00', activity: '자갈치 시장', location: '자갈치 시장', cost: 0 },
        { time: '11:00', activity: '국제시장 쇼핑', location: '국제시장', cost: 30000 },
        { time: '13:00', activity: '점심 - 비빔밥', location: '남포동', cost: 12000 },
        { time: '15:00', activity: '귀가 출발', location: '부산', cost: 0 },
      ]},
    ],
  },
  {
    id: 3,
    destination: '경주',
    transport: '기차',
    start_datetime: '2025-02-14',
    end_datetime: '2025-02-16',
    group_size: 2,
    budget: 400000,
    total_cost: 370000,
    status: '완료',
    days: [
      { day: 1, date: '2025-02-14', schedules: [
        { time: '11:00', activity: '경주역 도착', location: '경주역', cost: 0 },
        { time: '12:00', activity: '점심 - 쌈밥정식', location: '경주 시내', cost: 13000 },
        { time: '14:00', activity: '불국사 관람', location: '불국사', cost: 6000 },
        { time: '17:00', activity: '석굴암 방문', location: '석굴암', cost: 6000 },
        { time: '19:00', activity: '저녁 - 한정식', location: '황리단길', cost: 28000 },
      ]},
      { day: 2, date: '2025-02-15', schedules: [
        { time: '09:00', activity: '첨성대 & 동궁과 월지', location: '첨성대', cost: 3000 },
        { time: '12:00', activity: '점심 - 교리 김밥', location: '교리김밥', cost: 6000 },
        { time: '14:00', activity: '대릉원 관람', location: '대릉원', cost: 3000 },
        { time: '16:00', activity: '황리단길 카페 투어', location: '황리단길', cost: 15000 },
      ]},
      { day: 3, date: '2025-02-16', schedules: [
        { time: '09:00', activity: '양동마을 방문', location: '양동마을', cost: 4000 },
        { time: '12:00', activity: '점심 - 순두부 백반', location: '경주', cost: 9000 },
        { time: '14:00', activity: '경주역 출발', location: '경주역', cost: 0 },
      ]},
    ],
  },
  {
    id: 4,
    destination: '강릉',
    transport: '자동차',
    start_datetime: '2025-01-03',
    end_datetime: '2025-01-05',
    group_size: 3,
    budget: 500000,
    total_cost: 460000,
    status: '완료',
    days: [
      { day: 1, date: '2025-01-03', schedules: [
        { time: '10:00', activity: '안목 해변 커피거리', location: '안목해변', cost: 5000 },
        { time: '12:00', activity: '점심 - 초당순두부', location: '초당동', cost: 10000 },
        { time: '14:00', activity: '경포대 & 경포해수욕장', location: '경포대', cost: 0 },
        { time: '19:00', activity: '저녁 - 물회', location: '강릉 시내', cost: 18000 },
      ]},
      { day: 2, date: '2025-01-04', schedules: [
        { time: '09:00', activity: '오죽헌 관람', location: '오죽헌', cost: 3000 },
        { time: '13:00', activity: '점심 - 곰치국', location: '강릉 시내', cost: 14000 },
        { time: '15:00', activity: '정동진 전망대', location: '정동진', cost: 0 },
        { time: '19:00', activity: '저녁 - 닭갈비', location: '강릉', cost: 16000 },
      ]},
      { day: 3, date: '2025-01-05', schedules: [
        { time: '09:00', activity: '주문진 수산시장', location: '주문진', cost: 20000 },
        { time: '12:00', activity: '점심 - 해물라면', location: '주문진', cost: 8000 },
        { time: '14:00', activity: '귀가 출발', location: '강릉', cost: 0 },
      ]},
    ],
  },
  {
    id: 5,
    destination: '여수',
    transport: '대중교통',
    start_datetime: '2024-12-28',
    end_datetime: '2024-12-30',
    group_size: 2,
    budget: 350000,
    total_cost: 320000,
    status: '완료',
    days: [
      { day: 1, date: '2024-12-28', schedules: [
        { time: '12:00', activity: '여수엑스포역 도착', location: '여수엑스포역', cost: 0 },
        { time: '13:00', activity: '점심 - 게장백반', location: '여수 시내', cost: 15000 },
        { time: '15:00', activity: '오동도 관람', location: '오동도', cost: 0 },
        { time: '19:00', activity: '여수 밤바다 낭만포차', location: '낭만포차', cost: 30000 },
      ]},
      { day: 2, date: '2024-12-29', schedules: [
        { time: '09:00', activity: '향일암 일출', location: '향일암', cost: 2000 },
        { time: '14:00', activity: '이순신광장 & 거북선', location: '이순신광장', cost: 0 },
        { time: '16:00', activity: '여수 케이블카', location: '해상케이블카', cost: 15000 },
        { time: '19:00', activity: '저녁 - 서대회무침', location: '여수', cost: 20000 },
      ]},
      { day: 3, date: '2024-12-30', schedules: [
        { time: '10:00', activity: '예술랜드 관람', location: '예술랜드', cost: 8000 },
        { time: '12:00', activity: '점심 - 꼬막비빔밥', location: '여수 시내', cost: 13000 },
        { time: '14:00', activity: '여수엑스포역 출발', location: '여수엑스포역', cost: 0 },
      ]},
    ],
  },
];

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

  const filtered = useMemo(() => {
    if (activeTab === 0) return DUMMY_PLANS;
    return DUMMY_PLANS.filter((p) => p.status === TABS[activeTab]);
  }, [activeTab]);

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

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
            <PlanCard item={item} onPress={() => navigation.navigate('MyPlanDetail', { trip: item })} />
          )}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Ionicons name="airplane-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>여행 계획이 없어요</Text>
            <Text style={styles.emptySubText}>홈에서 AI 여행 계획을 만들어보세요</Text>
          </View>
        }
      />
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
