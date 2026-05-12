import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { signup } from '../services/authService';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !address) {
      Alert.alert('알림', '모든 항목을 입력해주세요');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다');
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, address);
      Alert.alert('회원가입 완료', '로그인해주세요', [
        { text: '확인', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert('회원가입 실패', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>회원가입</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="거주지 (예: 서울시 강남구)"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupBtnText}>회원가입</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>이미 계정이 있으신가요? <Text style={styles.loginLinkBold}>로그인</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FF6B6B', textAlign: 'center', marginBottom: 36 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
    marginBottom: 14, backgroundColor: '#fafafa',
  },
  signupBtn: {
    backgroundColor: '#FF6B6B', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 6,
  },
  signupBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginLink: { textAlign: 'center', marginTop: 16, color: '#888', fontSize: 14 },
  loginLinkBold: { color: '#FF6B6B', fontWeight: 'bold' },
});
