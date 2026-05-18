import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createTrip } from '../../../common/tripApi';

const TRANSPORT_OPTIONS = ['자동차', '대중교통', '기타'];

export default function CreateTripScreen({ navigation }) {
  const [destination, setDestination]       = useState('');
  const [startDate, setStartDate]           = useState('');
  const [endDate, setEndDate]               = useState('');
  const [transport, setTransport]           = useState('자동차');
  const [people, setPeople]                 = useState(2);
  const [budget, setBudget]                 = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participants, setParticipants]     = useState([]);
  const [loading, setLoading]               = useState(false);

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

  const handleGenerate = async () => {
    if (!destination || !startDate || !endDate || !budget) {
      Alert.alert('알림', '여행지, 날짜, 예산을 모두 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      const trip = await createTrip({
        destination,
        start_datetime: startDate,
        end_datetime: endDate,
        transport,
        group_size: people,
        budget: Number(budget),
        participant_emails: participants,
      });
      navigation.replace('MyPlanDetail', { trip });
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>여행 계획 만들기</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* 여행지 */}
        <View style={styles.field}>
          <Text style={styles.label}>여행지</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={18} color="#111827" />
            <TextInput
              style={styles.input}
              placeholder="어디로 떠나시나요?"
              placeholderTextColor="#9CA3AF"
              value={destination}
              onChangeText={setDestination}
            />
          </View>
        </View>

        {/* 날짜 */}
        <View style={styles.field}>
          <Text style={styles.label}>여행 기간</Text>
          <View style={styles.dateRow}>
            <View style={[styles.inputRow, { flex: 1 }]}>
              <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="2025-06-01"
                placeholderTextColor="#9CA3AF"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <Text style={styles.dateSep}>~</Text>
            <View style={[styles.inputRow, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                placeholder="2025-06-03"
                placeholderTextColor="#9CA3AF"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>
        </View>

        {/* 이동수단 */}
        <View style={styles.field}>
          <Text style={styles.label}>이동수단</Text>
          <View style={styles.chipGroup}>
            {TRANSPORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.optionChip, transport === opt && styles.optionChipActive]}
                onPress={() => setTransport(opt)}
              >
                <Text style={[styles.optionChipText, transport === opt && styles.optionChipTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 인원 */}
        <View style={styles.field}>
          <Text style={styles.label}>인원</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => setPeople(p => Math.max(1, p - 1))}>
              <Ionicons name="remove" size={18} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{people}명</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => setPeople(p => p + 1)}>
              <Ionicons name="add" size={18} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 예산 */}
        <View style={styles.field}>
          <Text style={styles.label}>예산</Text>
          <View style={styles.inputRow}>
            <Ionicons name="wallet-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="여행 예산을 입력하세요"
              placeholderTextColor="#9CA3AF"
              value={budget}
              onChangeText={(v) => setBudget(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
            {budget.length > 0 && (
              <Text style={styles.budgetUnit}>{Number(budget).toLocaleString()}원</Text>
            )}
          </View>
        </View>

        {/* 동행자 */}
        <View style={styles.field}>
          <Text style={styles.label}>동행자 <Text style={styles.labelOptional}>(선택)</Text></Text>
          <Text style={styles.labelDesc}>앱에 가입된 사용자의 이메일을 입력하면{'\n'}취향을 반영한 일정을 만들어드려요</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-add-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="이메일 입력 후 추가 버튼"
              placeholderTextColor="#9CA3AF"
              value={participantEmail}
              onChangeText={setParticipantEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={handleAddParticipant}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddParticipant}>
              <Text style={styles.addBtnText}>추가</Text>
            </TouchableOpacity>
          </View>
          {participants.length > 0 && (
            <View style={styles.participantList}>
              {participants.map((email) => (
                <View key={email} style={styles.participantChip}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantAvatarText}>{email[0].toUpperCase()}</Text>
                  </View>
                  <Text style={styles.participantEmail}>{email}</Text>
                  <TouchableOpacity onPress={() => setParticipants(p => p.filter(e => e !== email))}>
                    <Ionicons name="close-circle" size={18} color="#D1D5DB" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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

      </ScrollView>
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

  content: { padding: 22, gap: 24, paddingBottom: 48 },

  field: { gap: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  labelOptional: { fontSize: 13, fontWeight: '400', color: '#9CA3AF' },
  labelDesc: { fontSize: 12, color: '#9CA3AF', lineHeight: 18, marginTop: -4 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  input: { flex: 1, fontSize: 15, color: '#111827', padding: 0 },
  budgetUnit: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateSep: { color: '#9CA3AF', fontSize: 15 },

  chipGroup: { flexDirection: 'row', gap: 8 },
  optionChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
  },
  optionChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  optionChipText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  optionChipTextActive: { color: '#FFFFFF' },

  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  counterValue: { fontSize: 16, fontWeight: '600', color: '#111827', minWidth: 40, textAlign: 'center' },

  addBtn: {
    backgroundColor: '#111827', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

  participantList: { gap: 8 },
  participantChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  participantAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center',
  },
  participantAvatarText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  participantEmail: { flex: 1, fontSize: 14, color: '#374151' },

  generateBtn: {
    backgroundColor: '#111827', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 8,
  },
  generateBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  generateBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
