import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddParticipant = () => {
    const email = participantEmail.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요');
      return;
    }
    if (participants.includes(email)) {
      Alert.alert('알림', '이미 추가된 이메일입니다');
      return;
    }
    setParticipants(prev => [...prev, email]);
    setParticipantEmail('');
  };

  const handleRemoveParticipant = (email) => {
    setParticipants(prev => prev.filter(e => e !== email));
  };

  const handleGenerate = async () => {
    if (!departure || !destination || !startDate || !endDate) {
      Alert.alert('알림', '모든 항목을 입력해주세요');
      return;
    }
    setLoading(true);
    // TODO: 백엔드 AI 플랜 생성 API 연동
    // 전달 데이터: { departure, destination, startDate, endDate, people, budget, participant_emails: participants }
    setTimeout(() => {
      setLoading(false);
      Alert.alert('준비 중', 'AI 여행 계획 생성 기능은 백엔드 연동 후 사용 가능합니다');
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요 👋</Text>
        <Text style={styles.title}>오늘 어디로{'\n'}떠나볼까요?</Text>
      </View>

      {/* 여행 입력 카드 */}
      <View style={styles.card}>

        {/* 출발지 */}
        <View style={styles.inputRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="radio-button-on-outline" size={18} color="#9CA3AF" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="출발지"
            placeholderTextColor="#9CA3AF"
            value={departure}
            onChangeText={setDeparture}
          />
        </View>

        <View style={styles.rowDivider} />

        {/* 여행지 */}
        <View style={styles.inputRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="location-outline" size={18} color="#111827" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="여행지"
            placeholderTextColor="#9CA3AF"
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <View style={styles.rowDivider} />

        {/* 날짜 */}
        <View style={styles.inputRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
          </View>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="2025-06-01"
            placeholderTextColor="#9CA3AF"
            value={startDate}
            onChangeText={setStartDate}
          />
          <Text style={styles.dateSep}>~</Text>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="2025-06-03"
            placeholderTextColor="#9CA3AF"
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>

        <View style={styles.rowDivider} />

        {/* 여행 경비 */}
        <View style={styles.inputRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="wallet-outline" size={18} color="#9CA3AF" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="여행 경비 (원)"
            placeholderTextColor="#9CA3AF"
            value={budget}
            onChangeText={(v) => setBudget(v.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
          {budget.length > 0 && (
            <Text style={styles.budgetUnit}>
              {Number(budget).toLocaleString()}원
            </Text>
          )}
        </View>

        <View style={styles.rowDivider} />

        {/* 인원 */}
        <View style={styles.inputRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="people-outline" size={18} color="#9CA3AF" />
          </View>
          <Text style={styles.peopleLabel}>인원</Text>
          <View style={styles.counterWrap}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setPeople(p => Math.max(1, p - 1))}
            >
              <Ionicons name="remove" size={16} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{people}명</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setPeople(p => p + 1)}
            >
              <Ionicons name="add" size={16} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rowDivider} />

        {/* 동행자 */}
        <View style={styles.participantSection}>
          <View style={styles.inputRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="person-add-outline" size={18} color="#9CA3AF" />
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="동행자 이메일 (선택)"
              placeholderTextColor="#9CA3AF"
              value={participantEmail}
              onChangeText={setParticipantEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={handleAddParticipant}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addEmailBtn} onPress={handleAddParticipant}>
              <Ionicons name="add" size={18} color="#2563EB" />
            </TouchableOpacity>
          </View>
          {participants.length > 0 && (
            <View style={styles.participantChips}>
              {participants.map((email) => (
                <View key={email} style={styles.participantChip}>
                  <Text style={styles.participantChipText}>{email}</Text>
                  <TouchableOpacity onPress={() => handleRemoveParticipant(email)}>
                    <Ionicons name="close" size={14} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

      </View>

      {/* 생성 버튼 */}
      <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : (
            <View style={styles.generateBtnInner}>
              <Ionicons name="sparkles-outline" size={18} color="#fff" />
              <Text style={styles.generateBtnText}>AI 여행 계획 생성</Text>
            </View>
          )
        }
      </TouchableOpacity>

      {/* 최근 여행 계획 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최근 여행 계획</Text>
        <View style={styles.emptyBox}>
          <Ionicons name="map-outline" size={36} color="#D1D5DB" />
          <Text style={styles.emptyText}>아직 여행 계획이 없어요</Text>
          <Text style={styles.emptySubText}>위에서 첫 번째 계획을 만들어보세요</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 40 },

  header: { marginBottom: 28 },
  greeting: { fontSize: 14, color: '#9CA3AF', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', lineHeight: 36, letterSpacing: -0.5 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrap: { width: 28, alignItems: 'center' },
  input: { flex: 1, minWidth: 0, fontSize: 15, color: '#111827', padding: 0, marginLeft: 8 },
  dateInput: { flex: 1, minWidth: 0 },
  dateSep: { marginHorizontal: 8, color: '#9CA3AF', fontSize: 14 },
  budgetUnit: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  rowDivider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 28 },

  participantSection: { paddingBottom: 6 },
  addEmailBtn: {
    padding: 6, marginLeft: 4,
  },
  participantChips: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 36, paddingBottom: 10,
  },
  participantChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EFF6FF', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  participantChipText: { fontSize: 12, color: '#2563EB', fontWeight: '500' },

  peopleLabel: { flex: 1, fontSize: 15, color: '#111827' },
  counterWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  counterValue: { fontSize: 15, fontWeight: '600', color: '#111827', minWidth: 28, textAlign: 'center' },

  generateBtn: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 36,
  },
  generateBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  generateBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 14 },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 15, color: '#6B7280', fontWeight: '500', marginTop: 4 },
  emptySubText: { fontSize: 13, color: '#9CA3AF' },
});
