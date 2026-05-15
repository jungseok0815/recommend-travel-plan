import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateMe } from '../../../common/userApi';

export default function EditProfileScreen({ navigation, route }) {
  const { user } = route.params ?? {};
  const [email] = useState(user?.email ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!address) {
      Alert.alert('알림', '거주지를 입력해주세요');
      return;
    }
    setSaving(true);
    try {
      await updateMe({ address });
      Alert.alert('완료', '정보가 수정되었습니다', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>내 정보 수정</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>이메일</Text>
        <View style={styles.readonlyInput}>
          <Text style={styles.readonlyText}>{email}</Text>
        </View>
        <Text style={styles.labelHint}>이메일은 변경할 수 없습니다</Text>

        <Text style={[styles.label, { marginTop: 20 }]}>거주지</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 서울시 강남구"
          placeholderTextColor="#9CA3AF"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>저장</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '600', color: '#111827' },
  form: { padding: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  labelHint: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  readonlyInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  readonlyText: { fontSize: 15, color: '#6B7280' },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
