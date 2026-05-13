import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveReview } from '../../services/authService';

const USE_DUMMY = true;

function StarRating({ rating, onSelect, readonly = false }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onSelect && onSelect(star)}
          disabled={readonly}
          activeOpacity={readonly ? 1 : 0.7}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={28}
            color={star <= rating ? '#F59E0B' : '#D1D5DB'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ReviewModal({ visible, existing, onSave, onClose }) {
  const [rating, setRating]   = useState(existing?.rating ?? 0);
  const [content, setContent] = useState(existing?.content ?? '');

  React.useEffect(() => {
    if (visible) {
      setRating(existing?.rating ?? 0);
      setContent(existing?.content ?? '');
    }
  }, [visible]);

  const handleSave = () => {
    if (rating === 0) { Alert.alert('알림', '별점을 선택해주세요'); return; }
    if (!content.trim()) { Alert.alert('알림', '리뷰 내용을 입력해주세요'); return; }
    onSave({ rating, content });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{existing ? '리뷰 수정' : '리뷰 작성'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.fieldLabel}>별점</Text>
            <StarRating rating={rating} onSelect={setRating} />
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>리뷰</Text>
            <TextInput
              style={[styles.fieldInput, { height: 120, textAlignVertical: 'top' }]}
              value={content}
              onChangeText={setContent}
              placeholder="여행 후기를 남겨주세요"
              placeholderTextColor="#9CA3AF"
              multiline
            />
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EditModal({ visible, schedule, onSave, onClose }) {
  const [time, setTime] = useState(schedule?.time ?? '');
  const [activity, setActivity] = useState(schedule?.activity ?? '');
  const [location, setLocation] = useState(schedule?.location ?? '');
  const [cost, setCost] = useState(schedule?.cost != null ? String(schedule.cost) : '');

  React.useEffect(() => {
    if (schedule) {
      setTime(schedule.time ?? '');
      setActivity(schedule.activity ?? '');
      setLocation(schedule.location ?? '');
      setCost(schedule.cost != null ? String(schedule.cost) : '');
    }
  }, [schedule]);

  const handleSave = () => {
    if (!activity.trim()) {
      Alert.alert('알림', '활동 내용을 입력해주세요');
      return;
    }
    onSave({ time, activity, location, cost: Number(cost) || 0 });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>일정 수정</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.fieldLabel}>시간</Text>
            <TextInput
              style={styles.fieldInput}
              value={time}
              onChangeText={setTime}
              placeholder="예: 10:00"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>활동</Text>
            <TextInput
              style={styles.fieldInput}
              value={activity}
              onChangeText={setActivity}
              placeholder="활동 내용을 입력하세요"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>장소</Text>
            <TextInput
              style={styles.fieldInput}
              value={location}
              onChangeText={setLocation}
              placeholder="장소를 입력하세요"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>비용 (원)</Text>
            <TextInput
              style={styles.fieldInput}
              value={cost}
              onChangeText={(v) => setCost(v.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function MyPlanDetailScreen({ navigation, route }) {
  const { trip } = route.params;
  const [days, setDays] = useState(trip.days ?? []);
  const [editTarget, setEditTarget] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [review, setReview] = useState(trip.review ?? null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const currentSchedule =
    editTarget != null
      ? days[editTarget.dayIndex]?.schedules[editTarget.scheduleIndex]
      : null;

  const handleEdit = (dayIndex, scheduleIndex) => {
    setEditTarget({ dayIndex, scheduleIndex });
    setModalVisible(true);
  };

  const handleReviewSave = async (data) => {
    if (!USE_DUMMY) {
      try {
        const saved = await saveReview(trip.id, data.rating, data.content);
        setReview(saved);
      } catch (e) {
        Alert.alert('오류', e.message);
        return;
      }
    } else {
      setReview(data);
    }
    setReviewModalVisible(false);
  };

  const handleSave = (updated) => {
    setDays((prev) => {
      const next = prev.map((d, di) => {
        if (di !== editTarget.dayIndex) return d;
        return {
          ...d,
          schedules: d.schedules.map((s, si) =>
            si === editTarget.scheduleIndex ? { ...s, ...updated } : s
          ),
        };
      });
      return next;
    });
    setModalVisible(false);
    setEditTarget(null);
  };

  const handleDelete = (dayIndex, scheduleIndex) => {
    Alert.alert('일정 삭제', '이 일정을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: () => {
          setDays((prev) =>
            prev.map((d, di) => {
              if (di !== dayIndex) return d;
              return {
                ...d,
                schedules: d.schedules.filter((_, si) => si !== scheduleIndex),
              };
            })
          );
        },
      },
    ]);
  };

  const dayCosts = days.map((d) =>
    d.schedules.reduce((sum, s) => sum + (s.cost ?? 0), 0)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 여행 상세</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 히어로 */}
        <View style={styles.hero}>
          <View style={styles.destinationRow}>
            <Ionicons name="location" size={20} color="#111827" />
            <Text style={styles.destination}>{trip.destination}</Text>
            <View style={[styles.statusBadge, trip.status === '완료' ? styles.statusDone : styles.statusPlanning]}>
              <Text style={[styles.statusText, trip.status === '완료' ? styles.statusDoneText : styles.statusPlanningText]}>
                {trip.status}
              </Text>
            </View>
          </View>
        </View>

        {/* 기본 정보 */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.chipText}>{trip.start_datetime} ~ {trip.end_datetime}</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="car-outline" size={14} color="#6B7280" />
            <Text style={styles.chipText}>{trip.transport}</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.chipText}>{trip.group_size}명</Text>
          </View>
        </View>

        {/* 예산 */}
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
                <Text style={[styles.budgetValue, { color: '#2563EB' }]}>
                  {trip.total_cost.toLocaleString()}원
                </Text>
              </View>
              <View style={styles.budgetDivider} />
              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>절감</Text>
                <Text style={[styles.budgetValue, { color: '#16A34A' }]}>
                  {(trip.budget - trip.total_cost).toLocaleString()}원
                </Text>
              </View>
            </>
          )}
        </View>

        {/* 일정 */}
        {trip.status === '완료' && (
          <View style={styles.section}>
            <View style={styles.reviewSectionHeader}>
              <Text style={styles.sectionTitle}>리뷰</Text>
              <TouchableOpacity
                style={styles.reviewEditBtn}
                onPress={() => setReviewModalVisible(true)}
              >
                <Ionicons name={review ? 'pencil-outline' : 'add'} size={16} color="#6B7280" />
                <Text style={styles.reviewEditBtnText}>{review ? '수정' : '작성'}</Text>
              </TouchableOpacity>
            </View>
            {review ? (
              <View style={styles.reviewCard}>
                <StarRating rating={review.rating} readonly />
                <Text style={styles.reviewContent}>{review.content}</Text>
              </View>
            ) : (
              <View style={styles.reviewEmpty}>
                <Ionicons name="chatbubble-outline" size={32} color="#D1D5DB" />
                <Text style={styles.reviewEmptyText}>아직 리뷰가 없어요{'\n'}여행 후기를 남겨보세요</Text>
              </View>
            )}
          </View>
        )}

        {days.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>일정</Text>
            {days.map((day, di) => (
              <View key={di} style={styles.dayBlock}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                  </View>
                  <Text style={styles.dayDate}>{day.date}</Text>
                  <Text style={styles.dayCost}>{dayCosts[di].toLocaleString()}원</Text>
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
                    {trip.status !== '완료' && (
                      <View style={styles.scheduleActions}>
                        <TouchableOpacity onPress={() => handleEdit(di, si)} style={styles.actionBtn}>
                          <Ionicons name="pencil-outline" size={16} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(di, si)} style={styles.actionBtn}>
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <EditModal
        visible={modalVisible}
        schedule={currentSchedule}
        onSave={handleSave}
        onClose={() => { setModalVisible(false); setEditTarget(null); }}
      />
      <ReviewModal
        visible={reviewModalVisible}
        existing={review}
        onSave={handleReviewSave}
        onClose={() => setReviewModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },

  content: { padding: 22, gap: 20, paddingBottom: 40 },

  hero: { gap: 6 },
  destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  destination: { fontSize: 26, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPlanning: { backgroundColor: '#EFF6FF' },
  statusDone: { backgroundColor: '#F0FDF4' },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusPlanningText: { color: '#2563EB' },
  statusDoneText: { color: '#16A34A' },

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

  section: { gap: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  dayBlock: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16,
  },
  dayBadge: {
    backgroundColor: '#111827', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  dayBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  dayDate: { fontSize: 13, color: '#6B7280', flex: 1 },
  dayCost: { fontSize: 13, fontWeight: '600', color: '#374151' },

  scheduleItem: { flexDirection: 'row', gap: 12, minHeight: 52 },
  scheduleTimeline: { alignItems: 'center', width: 44 },
  scheduleTime: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 },
  timelineDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#111827', marginBottom: 2,
  },
  timelineLine: { flex: 1, width: 1, backgroundColor: '#E5E7EB' },

  scheduleBody: { flex: 1, paddingBottom: 12 },
  scheduleActivity: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 4 },
  scheduleMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scheduleLocation: { fontSize: 12, color: '#9CA3AF' },
  metaDot: { width: 2, height: 2, borderRadius: 1, backgroundColor: '#D1D5DB' },
  scheduleCost: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  scheduleActions: { flexDirection: 'row', gap: 4, alignItems: 'flex-start', paddingTop: 2 },
  actionBtn: { padding: 6 },

  reviewSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewEditBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  reviewEditBtnText: { fontSize: 13, color: '#6B7280' },
  reviewCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  reviewContent: { fontSize: 14, color: '#374151', lineHeight: 22 },
  reviewEmpty: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28,
    alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  reviewEmptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },

  // 모달
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  modalBody: { padding: 20, gap: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  fieldInput: {
    backgroundColor: '#F3F4F6', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#111827',
  },
  modalFooter: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  saveBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#111827', alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
