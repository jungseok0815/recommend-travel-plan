import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, Modal,
  ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCommunityTrips } from '../../../common/api';

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
