import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, Modal,
  ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCommunityTrips } from '../../services/authService';

const REGION_MAP = {
  '서울': ['강남', '홍대·마포', '종로·광화문', '명동·을지로', '이태원·한남', '잠실·송파', '성수·건대'],
  '부산': ['해운대', '광안리', '남포동·중구', '기장', '송정'],
  '인천': ['강화도', '송도', '차이나타운', '을왕리'],
  '대구': ['동성로', '수성구', '달성군'],
  '광주': ['충장로', '상무지구', '무등산'],
  '대전': ['유성구', '대청호', '중구'],
  '경기도': ['수원', '용인', '가평', '고양·파주', '양평', '과천', '광명'],
  '강원도': ['강릉', '속초', '춘천', '원주', '평창', '태백', '정선', '동해'],
  '충청북도': ['청주', '충주', '제천', '단양'],
  '충청남도': ['천안', '공주', '부여', '태안', '보령'],
  '전라북도': ['전주', '군산', '남원', '익산'],
  '전라남도': ['여수', '순천', '목포', '담양', '보성'],
  '경상북도': ['경주', '안동', '포항', '영주', '문경'],
  '경상남도': ['거제', '통영', '남해', '창원', '하동'],
  '제주도': ['제주시', '서귀포', '애월', '성산', '중문'],
};

const PROVINCES = Object.keys(REGION_MAP);

const USE_DUMMY = true;

const DUMMY_TRIPS = [
  {
    id: 1,
    destination: '제주시',
    transport: '대중교통',
    start_datetime: '2025-04-10',
    end_datetime: '2025-04-13',
    group_size: 2,
    budget: 800000,
    total_cost: 720000,
    user_email: 'kim***@naver.com',
    days: [
      { day: 1, date: '2025-04-10', schedules: [
        { time: '10:00', activity: '제주공항 도착 후 렌터카 수령', location: '제주국제공항', cost: 0 },
        { time: '12:00', activity: '점심 - 흑돼지 구이', location: '제주시 연동', cost: 25000 },
        { time: '14:00', activity: '용두암 관광', location: '용두암', cost: 0 },
        { time: '18:00', activity: '저녁 - 해산물 뷔페', location: '제주항 근처', cost: 35000 },
      ]},
      { day: 2, date: '2025-04-11', schedules: [
        { time: '09:00', activity: '한라산 어리목 코스 등반', location: '한라산 국립공원', cost: 0 },
        { time: '14:00', activity: '점심 - 산 정상 도시락', location: '한라산', cost: 8000 },
        { time: '17:00', activity: '협재해수욕장 방문', location: '협재해수욕장', cost: 0 },
        { time: '19:00', activity: '저녁 - 갈치조림', location: '제주시', cost: 20000 },
      ]},
      { day: 3, date: '2025-04-12', schedules: [
        { time: '10:00', activity: '성산일출봉 등반', location: '성산일출봉', cost: 5000 },
        { time: '13:00', activity: '점심 - 전복죽', location: '성산읍', cost: 15000 },
        { time: '15:00', activity: '섭지코지 산책', location: '섭지코지', cost: 0 },
        { time: '19:00', activity: '저녁 - 돔베고기', location: '서귀포', cost: 22000 },
      ]},
      { day: 4, date: '2025-04-13', schedules: [
        { time: '10:00', activity: '면세점 쇼핑', location: '제주공항 면세점', cost: 50000 },
        { time: '13:00', activity: '공항 출발', location: '제주국제공항', cost: 0 },
      ]},
    ],
  },
  {
    id: 2,
    destination: '해운대',
    transport: '자동차',
    start_datetime: '2025-03-22',
    end_datetime: '2025-03-24',
    group_size: 4,
    budget: 600000,
    total_cost: 580000,
    user_email: 'lee***@gmail.com',
    days: [
      { day: 1, date: '2025-03-22', schedules: [
        { time: '11:00', activity: '해운대 해수욕장 도착', location: '해운대 해수욕장', cost: 0 },
        { time: '13:00', activity: '점심 - 밀면', location: '해운대 밀면 골목', cost: 9000 },
        { time: '15:00', activity: '동백섬 산책', location: '동백섬', cost: 0 },
        { time: '19:00', activity: '저녁 - 씨푸드 레스토랑', location: '해운대', cost: 45000 },
      ]},
      { day: 2, date: '2025-03-23', schedules: [
        { time: '10:00', activity: '광안리 해수욕장', location: '광안리', cost: 0 },
        { time: '12:00', activity: '점심 - 돼지국밥', location: '광안리', cost: 10000 },
        { time: '14:00', activity: '부산 영화의 전당', location: '해운대', cost: 0 },
        { time: '18:00', activity: '광안대교 야경 감상', location: '광안리', cost: 0 },
        { time: '19:30', activity: '저녁 - 조개구이', location: '민락수변공원', cost: 35000 },
      ]},
      { day: 3, date: '2025-03-24', schedules: [
        { time: '09:00', activity: '자갈치 시장 구경', location: '자갈치 시장', cost: 0 },
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
    total_cost: null,
    user_email: 'par***@kakao.com',
    days: [
      { day: 1, date: '2025-02-14', schedules: [
        { time: '11:00', activity: '경주역 도착', location: '경주역', cost: 0 },
        { time: '12:00', activity: '점심 - 쌈밥정식', location: '경주 시내', cost: 13000 },
        { time: '14:00', activity: '불국사 관람', location: '불국사', cost: 6000 },
        { time: '17:00', activity: '석굴암 방문', location: '석굴암', cost: 6000 },
        { time: '19:00', activity: '저녁 - 한정식', location: '경주 황리단길', cost: 28000 },
      ]},
      { day: 2, date: '2025-02-15', schedules: [
        { time: '09:00', activity: '첨성대 & 동궁과 월지', location: '첨성대', cost: 3000 },
        { time: '12:00', activity: '점심 - 경주 교리 김밥', location: '교리김밥', cost: 6000 },
        { time: '14:00', activity: '대릉원 고분군 관람', location: '대릉원', cost: 3000 },
        { time: '16:00', activity: '황리단길 카페 투어', location: '황리단길', cost: 15000 },
        { time: '19:00', activity: '저녁 - 삼겹살', location: '경주 시내', cost: 18000 },
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
    user_email: 'cho***@naver.com',
    days: [
      { day: 1, date: '2025-01-03', schedules: [
        { time: '10:00', activity: '강릉 도착 - 안목 해변 커피거리', location: '안목해변', cost: 5000 },
        { time: '12:00', activity: '점심 - 초당순두부', location: '초당동', cost: 10000 },
        { time: '14:00', activity: '경포대 & 경포해수욕장', location: '경포대', cost: 0 },
        { time: '19:00', activity: '저녁 - 물회', location: '강릉 시내', cost: 18000 },
      ]},
      { day: 2, date: '2025-01-04', schedules: [
        { time: '09:00', activity: '오죽헌 관람', location: '오죽헌', cost: 3000 },
        { time: '11:00', activity: '강릉 중앙시장 구경', location: '중앙시장', cost: 10000 },
        { time: '13:00', activity: '점심 - 곰치국', location: '강릉 시내', cost: 14000 },
        { time: '15:00', activity: '정동진 해돋이 전망대', location: '정동진', cost: 0 },
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
    user_email: 'jun***@gmail.com',
    days: [
      { day: 1, date: '2024-12-28', schedules: [
        { time: '12:00', activity: '여수엑스포역 도착', location: '여수엑스포역', cost: 0 },
        { time: '13:00', activity: '점심 - 게장백반', location: '여수 시내', cost: 15000 },
        { time: '15:00', activity: '오동도 관람', location: '오동도', cost: 0 },
        { time: '19:00', activity: '여수 밤바다 낭만포차', location: '낭만포차', cost: 30000 },
      ]},
      { day: 2, date: '2024-12-29', schedules: [
        { time: '09:00', activity: '돌산도 & 향일암 일출', location: '향일암', cost: 2000 },
        { time: '12:00', activity: '점심 - 갓김치 정식', location: '돌산도', cost: 12000 },
        { time: '14:00', activity: '이순신광장 & 거북선', location: '이순신광장', cost: 0 },
        { time: '16:00', activity: '여수 케이블카', location: '여수 해상케이블카', cost: 15000 },
        { time: '19:00', activity: '저녁 - 서대회무침', location: '여수', cost: 20000 },
      ]},
      { day: 3, date: '2024-12-30', schedules: [
        { time: '10:00', activity: '예술랜드 관람', location: '예술랜드', cost: 8000 },
        { time: '12:00', activity: '점심 - 꼬막비빔밥', location: '여수 시내', cost: 13000 },
        { time: '14:00', activity: '여수엑스포역 출발', location: '여수엑스포역', cost: 0 },
      ]},
    ],
  },
  {
    id: 6,
    destination: '전주',
    transport: '대중교통',
    start_datetime: '2025-05-01',
    end_datetime: '2025-05-03',
    group_size: 2,
    budget: 300000,
    total_cost: 280000,
    user_email: 'han***@daum.net',
    days: [
      { day: 1, date: '2025-05-01', schedules: [
        { time: '11:00', activity: '전주역 도착', location: '전주역', cost: 0 },
        { time: '12:00', activity: '점심 - 전주비빔밥', location: '한옥마을 인근', cost: 12000 },
        { time: '14:00', activity: '전주한옥마을 산책', location: '전주한옥마을', cost: 0 },
        { time: '16:00', activity: '경기전 관람', location: '경기전', cost: 3000 },
        { time: '19:00', activity: '저녁 - 콩나물국밥', location: '전주 시내', cost: 8000 },
      ]},
      { day: 2, date: '2025-05-02', schedules: [
        { time: '09:00', activity: '전동성당 방문', location: '전동성당', cost: 0 },
        { time: '11:00', activity: '남부시장 야시장 구경', location: '남부시장', cost: 15000 },
        { time: '13:00', activity: '점심 - 피순대', location: '전주 남부시장', cost: 7000 },
        { time: '15:00', activity: '덕진공원 산책', location: '덕진공원', cost: 0 },
        { time: '19:00', activity: '저녁 - 전주 막걸리 골목', location: '삼천동', cost: 20000 },
      ]},
      { day: 3, date: '2025-05-03', schedules: [
        { time: '09:00', activity: '전주 한옥마을 카페 투어', location: '한옥마을', cost: 10000 },
        { time: '11:00', activity: '기념품 쇼핑', location: '한옥마을 상점', cost: 20000 },
        { time: '13:00', activity: '전주역 출발', location: '전주역', cost: 0 },
      ]},
    ],
  },
];

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 3)}***@${domain}`;
};

const TripCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
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
        <Text style={styles.infoText}>{item.start_datetime} ~ {item.end_datetime}</Text>
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
  </TouchableOpacity>
);

function RegionModal({ visible, onClose, onApply, initialSelected }) {
  const [step, setStep] = useState('province');
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [tempSelected, setTempSelected] = useState([]);

  useEffect(() => {
    if (visible) setTempSelected(initialSelected);
  }, [visible]);

  const toggleCity = (city) => {
    setTempSelected((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const handleClose = () => {
    setStep('province');
    setSelectedProvince(null);
    onClose();
  };

  const handleApply = () => {
    onApply(tempSelected);
    setStep('province');
    setSelectedProvince(null);
  };

  const getCityCountForProvince = (province) =>
    REGION_MAP[province].filter((c) => tempSelected.includes(c)).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose} />
      <SafeAreaView style={styles.modalSheet}>

        <View style={styles.modalHandle} />

        <View style={styles.modalHeader}>
          {step === 'city' ? (
            <TouchableOpacity onPress={() => setStep('province')} style={styles.modalBackBtn}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 30 }} />
          )}
          <Text style={styles.modalTitle}>
            {step === 'province' ? '지역 선택' : selectedProvince}
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {step === 'province' ? (
          <ScrollView contentContainerStyle={styles.modalGrid}>
            {PROVINCES.map((province) => {
              const count = getCityCountForProvince(province);
              return (
                <TouchableOpacity
                  key={province}
                  style={styles.provinceItem}
                  onPress={() => { setSelectedProvince(province); setStep('city'); }}
                >
                  <Text style={styles.provinceItemText}>{province}</Text>
                  <View style={styles.provinceRight}>
                    {count > 0 && (
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{count}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.modalGrid}>
            {REGION_MAP[selectedProvince].map((city) => {
              const checked = tempSelected.includes(city);
              return (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityItem, checked && styles.cityItemChecked]}
                  onPress={() => toggleCity(city)}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={checked ? '#111827' : '#6B7280'}
                  />
                  <Text style={[styles.cityItemText, checked && styles.cityItemTextChecked]}>
                    {city}
                  </Text>
                  {checked && <Ionicons name="checkmark" size={18} color="#111827" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.resetBtn} onPress={() => setTempSelected([])}>
            <Text style={styles.resetBtnText}>초기화</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>
              {tempSelected.length > 0 ? `${tempSelected.length}개 지역 적용` : '전체 보기'}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

export default function ExploreScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);

  const filteredTrips = useMemo(() => {
    if (selectedCities.length === 0) return trips;
    return trips.filter((t) => selectedCities.some((c) => t.destination.includes(c)));
  }, [trips, selectedCities]);

  const fetchTrips = useCallback(async () => {
    try {
      setError(null);
      if (USE_DUMMY) {
        setTrips(DUMMY_TRIPS);
      } else {
        const data = await getCommunityTrips();
        setTrips(data);
      }
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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>여행 탐색</Text>
            <Text style={styles.subtitle}>다른 여행자의 완료된 계획을 확인해보세요</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="options-outline" size={18} color="#FFFFFF" />
            <Text style={styles.filterBtnText}>
              {selectedCities.length === 0 ? '지역' : selectedCities.length === 1 ? selectedCities[0] : `${selectedCities.length}개 지역`}
            </Text>
            {selectedCities.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedCities.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {selectedCities.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {selectedCities.map((city) => (
              <TouchableOpacity
                key={city}
                style={styles.resetChip}
                onPress={() => setSelectedCities((prev) => prev.filter((c) => c !== city))}
              >
                <Text style={styles.resetChipText}>{city}</Text>
                <Ionicons name="close" size={13} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
          data={filteredTrips}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
              <TripCard item={item} onPress={() => navigation.navigate('TripDetail', { trip: item })} />
            )}
          contentContainerStyle={filteredTrips.length === 0 ? styles.center : styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="compass-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {selectedCities.length > 0 ? `선택한 지역의 여행 계획이 없어요` : '아직 공유된 여행 계획이 없어요'}
              </Text>
            </View>
          }
        />
      )}

      <RegionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={(cities) => { setSelectedCities(cities); setModalVisible(false); }}
        initialSelected={selectedCities}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111827',
    marginTop: 4,
  },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  filterBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 2,
  },
  filterBadgeText: { fontSize: 11, fontWeight: '700', color: '#111827' },

  chipRow: { paddingTop: 10, gap: 8 },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  resetChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  list: { paddingHorizontal: 22, paddingBottom: 24, gap: 14 },
  emptyBox: { alignItems: 'center', gap: 10, marginTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF', marginTop: 8 },
  retryBtn: {
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#111827', borderRadius: 10,
  },
  retryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },

  // 카드
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  destinationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#111827', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 20,
  },
  destinationText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  userEmail: { fontSize: 12, color: '#9CA3AF' },
  cardBody: { gap: 8, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: '#6B7280' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },
  cardFooter: {
    flexDirection: 'row', gap: 16,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12,
  },
  budgetBox: { gap: 2 },
  budgetLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  budgetValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  totalCostValue: { color: '#2563EB' },

  // 모달
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalBackBtn: { padding: 4 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  modalGrid: { padding: 20, gap: 10 },

  provinceItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F9FAFB', borderRadius: 12,
  },
  provinceRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  provinceItemText: { fontSize: 15, fontWeight: '500', color: '#111827' },
  countBadge: {
    backgroundColor: '#111827', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  cityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F9FAFB', borderRadius: 12,
  },
  cityItemChecked: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  cityItemText: { fontSize: 15, color: '#111827' },
  cityItemTextChecked: { fontWeight: '600', color: '#111827' },

  modalFooter: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  resetBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center',
  },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  applyBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#111827', alignItems: 'center',
  },
  applyBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
