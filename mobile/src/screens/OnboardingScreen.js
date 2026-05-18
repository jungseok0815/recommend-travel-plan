import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPreference, updatePreference } from '../common/preferenceApi';

// ── 대항목 ────────────────────────────────────────────────────
const PRIORITY_OPTIONS = [
  { value: 'A01', label: '자연',   icon: 'leaf-outline',    description: '산, 바다, 계곡, 공원 등 자연 중심' },
  { value: 'A02', label: '인문',   icon: 'library-outline', description: '역사, 문화, 예술, 박물관 등' },
  { value: 'A03', label: '레포츠', icon: 'bicycle-outline', description: '트레킹, 서핑, 스키 등 액티비티' },
  { value: 'A04', label: '쇼핑',   icon: 'bag-outline',     description: '전통시장, 쇼핑몰, 아울렛 등' },
];

// ── 중항목 ────────────────────────────────────────────────────
const SUB_OPTIONS = {
  A01: [
    { value: 'A01010500', label: '해수욕장/해변', icon: 'water-outline',        description: '바다, 해변 여행' },
    { value: 'A01010100', label: '산/트레킹',     icon: 'trail-sign-outline',   description: '등산, 트레킹' },
    { value: 'A01010800', label: '계곡',           icon: 'partly-sunny-outline', description: '계곡, 래프팅' },
    { value: 'A01011500', label: '온천/스파',      icon: 'thermometer-outline',  description: '온천, 스파 힐링' },
    { value: 'A01011200', label: '공원/수목원',    icon: 'flower-outline',       description: '공원, 식물원 산책' },
  ],
  A02: [
    { value: 'A0201', label: '역사/유적',       icon: 'business-outline',      description: '고궁, 유적지, 사찰' },
    { value: 'A0203', label: '전통문화 체험',   icon: 'color-palette-outline', description: '전통문화 체험' },
    { value: 'A0202', label: '테마파크',         icon: 'happy-outline',         description: '테마파크, 휴양지' },
    { value: 'A0205', label: '전망대/랜드마크', icon: 'eye-outline',           description: '전망대, 조형물' },
  ],
  A03: [
    { value: 'A0302', label: '육상 레포츠', icon: 'bicycle-outline',  description: '트레킹, 자전거, 승마' },
    { value: 'A0303', label: '수상 레포츠', icon: 'boat-outline',     description: '서핑, 카약, 래프팅' },
    { value: 'A0304', label: '항공 레포츠', icon: 'airplane-outline', description: '패러글라이딩, 번지점프' },
    { value: 'A0305', label: '복합 레포츠', icon: 'flash-outline',    description: '다양한 레포츠 복합' },
  ],
  A04: [
    { value: 'market',   label: '전통시장',     icon: 'storefront-outline', description: '로컬 전통시장' },
    { value: 'mall',     label: '쇼핑몰/백화점', icon: 'bag-outline',        description: '백화점, 쇼핑몰' },
    { value: 'outlet',   label: '아울렛',       icon: 'pricetag-outline',   description: '아울렛, 할인매장' },
    { value: 'dutyfree', label: '면세점',       icon: 'gift-outline',       description: '면세점 쇼핑' },
  ],
};

// ── 음식 / 숙박 ───────────────────────────────────────────────
const FOOD_OPTIONS = [
  { value: 'korean',   label: '한식',     icon: 'restaurant-outline', description: '한국 전통 음식' },
  { value: 'western',  label: '양식',     icon: 'pizza-outline',      description: '파스타, 스테이크 등' },
  { value: 'japanese', label: '일식',     icon: 'fish-outline',       description: '스시, 라멘 등' },
  { value: 'cafe',     label: '카페',     icon: 'cafe-outline',       description: '커피, 디저트 카페' },
  { value: 'market',   label: '전통시장', icon: 'storefront-outline', description: '로컬 시장 먹거리' },
  { value: 'buffet',   label: '뷔페',     icon: 'nutrition-outline',  description: '다양한 음식 한번에' },
];

const ACCOMMODATION_OPTIONS = [
  { value: 'B02010100', label: '호텔',         icon: 'business-outline',     description: '편리하고 쾌적한 호텔' },
  { value: 'B02010900', label: '펜션',         icon: 'home-outline',         description: '아늑하고 독립적인 공간' },
  { value: 'B02011400', label: '게스트하우스', icon: 'people-outline',       description: '합리적인 가격, 다양한 만남' },
  { value: 'B02011700', label: '캠핑',         icon: 'bonfire-outline',      description: '자연 속 캠핑 경험' },
  { value: 'B02011300', label: '한옥',         icon: 'partly-sunny-outline', description: '전통 한옥 숙박 체험' },
  { value: 'B02011600', label: '리조트',       icon: 'umbrella-outline',     description: '럭셔리한 리조트 휴양' },
];

// ── Step 정의 (3 step) ────────────────────────────────────────
const STEPS = [
  {
    key:     'travel_priority',
    type:    'priority_with_sub',
    title:   '여행에서 가장\n중요한 것은?',
    subtitle:'탭하는 순서대로 우선순위를 정하고\n세부 항목을 선택해요',
  },
  {
    key:     'food_types',
    type:    'multi',
    title:   '선호하는\n음식 타입은?',
    subtitle:'여행지에서 즐기고 싶은 음식을 선택해요',
    options: FOOD_OPTIONS,
  },
  {
    key:     'accommodation_type',
    type:    'multi',
    title:   '선호하는\n숙박 타입은?',
    subtitle:'편안하게 쉴 수 있는 숙소를 선택해요',
    options: ACCOMMODATION_OPTIONS,
  },
];

// ── 컴포넌트 ─────────────────────────────────────────────────
export default function OnboardingScreen({ navigation, route }) {
  const isEditing = route?.params?.isEditing ?? false;
  const existing  = route?.params?.existing  ?? null;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    if (existing) return existing;
    return {
      travel_priority:    [],   // 대항목 순위 배열 ['A01', 'A03', ...]
      sub_A01:            [],
      sub_A02:            [],
      sub_A03:            [],
      sub_A04:            [],
      food_types:         [],
      accommodation_type: [],
    };
  });
  const [loading, setLoading] = useState(false);

  const step   = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  // 대항목 탭 — 순위 부여 또는 해제
  const handleMajorSelect = (catValue) => {
    setAnswers(prev => {
      const arr = [...prev.travel_priority];
      const idx = arr.indexOf(catValue);
      if (idx !== -1) {
        arr.splice(idx, 1);  // 이미 선택 → 순위 해제
        return { ...prev, travel_priority: arr, [`sub_${catValue}`]: [] };
      }
      return { ...prev, travel_priority: [...arr, catValue] };
    });
  };

  // 중항목 탭 — 복수 선택/해제
  const handleSubSelect = (catValue, subValue) => {
    setAnswers(prev => {
      const arr = [...(prev[`sub_${catValue}`] ?? [])];
      const idx = arr.indexOf(subValue);
      return {
        ...prev,
        [`sub_${catValue}`]: idx !== -1 ? arr.filter(v => v !== subValue) : [...arr, subValue],
      };
    });
  };

  // 일반 복수 선택
  const handleMultiSelect = (value) => {
    setAnswers(prev => {
      const arr = [...(prev[step.key] ?? [])];
      const idx = arr.indexOf(value);
      return {
        ...prev,
        [step.key]: idx !== -1 ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const hasSelection = () => {
    if (step.type === 'priority_with_sub') {
      const ranked = answers.travel_priority;
      if (ranked.length !== PRIORITY_OPTIONS.length) return false;
      // 모든 대항목에 중항목 1개 이상 선택
      return ranked.every(cat => (answers[`sub_${cat}`] ?? []).length > 0);
    }
    return (answers[step.key] ?? []).length > 0;
  };

  const handleNext = async () => {
    if (!hasSelection()) return;
    if (!isLast) { setCurrentStep(prev => prev + 1); return; }
    setLoading(true);
    try {
      const body = {
        travel_priority:    answers.travel_priority,
        sub_A01:            answers.sub_A01,
        sub_A02:            answers.sub_A02,
        sub_A03:            answers.sub_A03,
        sub_A04:            answers.sub_A04,
        food_types:         answers.food_types,
        accommodation_type: answers.accommodation_type,
      };
      if (isEditing) { await updatePreference(body); navigation.goBack(); }
      else           { await createPreference(body); navigation.replace('Main'); }
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) { if (isEditing) navigation.goBack(); return; }
    setCurrentStep(prev => prev - 1);
  };

  // Step 1 완료 상태 텍스트
  const priorityGuide = () => {
    const ranked = answers.travel_priority;
    if (ranked.length < PRIORITY_OPTIONS.length)
      return `${ranked.length}/${PRIORITY_OPTIONS.length} 대항목 선택됨`;
    const missingSubCount = ranked.filter(cat => (answers[`sub_${cat}`] ?? []).length === 0).length;
    if (missingSubCount > 0) return `세부 항목을 선택해주세요 (${missingSubCount}개 남음)`;
    return '모든 선택 완료!';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {(currentStep > 0 || isEditing) ? (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
          ) : <View style={styles.backBtnPlaceholder} />}
        </View>
        <View style={styles.progressWrap}>
          {STEPS.map((_, i) => (
            <View key={i} style={[
              styles.progressBar,
              i < currentStep   && styles.progressBarDone,
              i === currentStep && styles.progressBarActive,
            ]} />
          ))}
        </View>
        <Text style={styles.stepCounter}>{currentStep + 1}/{STEPS.length}</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

        {/* 질문 */}
        <View style={styles.questionSection}>
          <View style={styles.stepBadgeRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP {currentStep + 1}</Text>
            </View>
            {step.type === 'priority_with_sub' ? (
              <View style={styles.rankingBadge}>
                <Ionicons name="trophy-outline" size={12} color="#D97706" />
                <Text style={styles.rankingBadgeText}>우선순위 + 세부 선택</Text>
              </View>
            ) : (
              <View style={styles.multiSelectBadge}>
                <Ionicons name="checkmark-done-outline" size={12} color="#2563EB" />
                <Text style={styles.multiSelectBadgeText}>복수 선택 가능</Text>
              </View>
            )}
          </View>
          <Text style={styles.questionTitle}>{step.title}</Text>
          <Text style={styles.questionSubtitle}>{step.subtitle}</Text>
        </View>

        {/* Step 1 — 대항목 + 중항목 아코디언 */}
        {step.type === 'priority_with_sub' && (
          <View style={styles.optionsWrap}>
            {PRIORITY_OPTIONS.map(opt => {
              const rank    = answers.travel_priority.indexOf(opt.value);
              const isRanked = rank !== -1;
              const subSelected = answers[`sub_${opt.value}`] ?? [];

              return (
                <View key={opt.value}>
                  {/* 대항목 카드 */}
                  <TouchableOpacity
                    style={[styles.optionCard, isRanked && styles.optionCardSelected]}
                    onPress={() => handleMajorSelect(opt.value)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.optionIconWrap, isRanked && styles.optionIconWrapSelected]}>
                      <Ionicons name={opt.icon} size={22} color={isRanked ? '#FFFFFF' : '#6B7280'} />
                    </View>
                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionLabel, isRanked && styles.optionLabelSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.optionDesc, isRanked && styles.optionDescSelected]}>
                        {opt.description}
                      </Text>
                    </View>
                    <View style={[styles.rankBadge, isRanked && styles.rankBadgeSelected]}>
                      {isRanked
                        ? <Text style={styles.rankBadgeText}>{rank + 1}</Text>
                        : <Text style={styles.rankBadgePlaceholder}>-</Text>
                      }
                    </View>
                  </TouchableOpacity>

                  {/* 중항목 — 대항목 선택 시 펼쳐짐 */}
                  {isRanked && (
                    <View style={styles.subOptionsWrap}>
                      <Text style={styles.subLabel}>세부 선택 (복수 가능)</Text>
                      <View style={styles.subGrid}>
                        {SUB_OPTIONS[opt.value].map(sub => {
                          const subChecked = subSelected.includes(sub.value);
                          return (
                            <TouchableOpacity
                              key={sub.value}
                              style={[styles.subCard, subChecked && styles.subCardSelected]}
                              onPress={() => handleSubSelect(opt.value, sub.value)}
                              activeOpacity={0.75}
                            >
                              <View style={styles.subCardTop}>
                                <Ionicons
                                  name={sub.icon}
                                  size={18}
                                  color={subChecked ? '#111827' : '#9CA3AF'}
                                />
                                <View style={[styles.subCheck, subChecked && styles.subCheckSelected]}>
                                  {subChecked && <Ionicons name="checkmark" size={10} color="#FFFFFF" />}
                                </View>
                              </View>
                              <Text style={[styles.subCardLabel, subChecked && styles.subCardLabelSelected]}>
                                {sub.label}
                              </Text>
                              <Text style={styles.subCardDesc}>{sub.description}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Step 2, 3 — 2열 그리드 복수 선택 */}
        {step.type === 'multi' && (
          <View style={styles.multiGrid}>
            {step.options.map(opt => {
              const selected = (answers[step.key] ?? []).includes(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.multiCard, selected && styles.multiCardSelected]}
                  onPress={() => handleMultiSelect(opt.value)}
                  activeOpacity={0.75}
                >
                  <View style={styles.multiCardTop}>
                    <View style={[styles.multiIconWrap, selected && styles.multiIconWrapSelected]}>
                      <Ionicons name={opt.icon} size={20} color={selected ? '#FFFFFF' : '#6B7280'} />
                    </View>
                    <View style={[styles.multiCheck, selected && styles.multiCheckSelected]}>
                      {selected && <Ionicons name="checkmark" size={10} color="#FFFFFF" />}
                    </View>
                  </View>
                  <Text style={[styles.multiCardLabel, selected && styles.multiCardLabelSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.multiCardDesc}>{opt.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <Text style={styles.guideText}>
          {step.type === 'priority_with_sub'
            ? priorityGuide()
            : `${(answers[step.key] ?? []).length}개 선택됨`}
        </Text>
        <TouchableOpacity
          style={[styles.nextBtn, !hasSelection() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!hasSelection() || loading}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : (
            <View style={styles.nextBtnInner}>
              <Text style={styles.nextBtnText}>
                {isLast ? (isEditing ? '저장하기' : '시작하기') : '다음'}
              </Text>
              {!isLast && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 10,
  },
  headerLeft: { width: 36 },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  backBtnPlaceholder: { width: 36 },
  progressWrap: { flex: 1, flexDirection: 'row', gap: 5 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  progressBarDone:   { backgroundColor: '#9CA3AF' },
  progressBarActive: { backgroundColor: '#111827' },
  stepCounter: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', width: 28, textAlign: 'right' },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingBottom: 24 },

  questionSection: { paddingTop: 24, paddingBottom: 20 },
  stepBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  stepBadge: {
    backgroundColor: '#F3F4F6', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  stepBadgeText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1 },
  rankingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFFBEB', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  rankingBadgeText: { fontSize: 11, fontWeight: '600', color: '#D97706' },
  multiSelectBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  multiSelectBadgeText: { fontSize: 11, fontWeight: '600', color: '#2563EB' },
  questionTitle: {
    fontSize: 26, fontWeight: '700', color: '#111827',
    lineHeight: 34, letterSpacing: -0.5, marginBottom: 8,
  },
  questionSubtitle: { fontSize: 14, color: '#9CA3AF', lineHeight: 20 },

  // 대항목 카드
  optionsWrap: { gap: 10 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2, borderColor: 'transparent', gap: 14,
  },
  optionCardSelected: { backgroundColor: '#FAFAFA', borderColor: '#111827' },
  optionIconWrap: {
    width: 46, height: 46, borderRadius: 13,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  optionIconWrapSelected: { backgroundColor: '#111827' },
  optionTextWrap: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  optionLabelSelected: { color: '#111827' },
  optionDesc: { fontSize: 12, color: '#9CA3AF' },
  optionDescSelected: { color: '#6B7280' },
  rankBadge: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  rankBadgeSelected: { backgroundColor: '#111827', borderColor: '#111827' },
  rankBadgeText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  rankBadgePlaceholder: { fontSize: 14, fontWeight: '700', color: '#D1D5DB' },

  // 중항목
  subOptionsWrap: {
    marginTop: 4, marginBottom: 6,
    marginLeft: 16,
    borderLeftWidth: 2, borderLeftColor: '#E5E7EB',
    paddingLeft: 12,
  },
  subLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 6 },
  subGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  subCard: {
    width: '47%',
    padding: 12, borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  subCardSelected: { backgroundColor: '#F0F9FF', borderColor: '#111827' },
  subCardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  subCardLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 2 },
  subCardLabelSelected: { color: '#111827' },
  subCardDesc: { fontSize: 11, color: '#9CA3AF', lineHeight: 15 },
  subCheck: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  subCheckSelected: { backgroundColor: '#111827', borderColor: '#111827' },

  // 복수 선택 체크 (대항목용)
  optionCheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  optionCheckSelected: { backgroundColor: '#111827', borderColor: '#111827' },

  // multi 2열 그리드 (음식/숙박)
  multiGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  multiCard: {
    width: '47%',
    padding: 14, borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2, borderColor: 'transparent',
  },
  multiCardSelected: { backgroundColor: '#FAFAFA', borderColor: '#111827' },
  multiCardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  multiIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  multiIconWrapSelected: { backgroundColor: '#111827' },
  multiCheck: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  multiCheckSelected: { backgroundColor: '#111827', borderColor: '#111827' },
  multiCardLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 3 },
  multiCardLabelSelected: { color: '#111827' },
  multiCardDesc: { fontSize: 11, color: '#9CA3AF', lineHeight: 15 },

  footer: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  guideText: {
    fontSize: 13, color: '#6B7280', fontWeight: '500',
    textAlign: 'center', marginBottom: 10,
  },
  nextBtn: {
    backgroundColor: '#111827', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
