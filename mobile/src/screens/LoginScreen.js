import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { login, openNaverLogin, openKakaoLogin } from '../services/authService';
import { saveTokens } from '../utils/tokenStorage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      const { access_token, refresh_token } = await login(email, password);
      await saveTokens(access_token, refresh_token);
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('로그인 실패', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    try {
      await openNaverLogin();
    } catch (e) {
      Alert.alert('오류', '네이버 로그인을 열 수 없습니다');
    }
  };

  const handleKakaoLogin = async () => {
    try {
      await openKakaoLogin();
    } catch (e) {
      Alert.alert('오류', '카카오 로그인을 열 수 없습니다');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>여행 플래너</Text>
        <Text style={styles.subtitle}>로그인</Text>

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

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>로그인</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>계정이 없으신가요? <Text style={styles.signupLinkBold}>회원가입</Text></Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.kakaoBtn} onPress={handleKakaoLogin}>
          <Text style={styles.kakaoBtnText}>카카오로 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.naverBtn} onPress={handleNaverLogin}>
          <Text style={styles.naverBtnText}>네이버로 로그인</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FF6B6B', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 36 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
    marginBottom: 14, backgroundColor: '#fafafa',
  },
  loginBtn: {
    backgroundColor: '#FF6B6B', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 6,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  signupLink: { textAlign: 'center', marginTop: 16, color: '#888', fontSize: 14 },
  signupLinkBold: { color: '#FF6B6B', fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { marginHorizontal: 12, color: '#aaa', fontSize: 13 },
  kakaoBtn: {
    backgroundColor: '#FEE500', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  kakaoBtnText: { color: '#3C1E1E', fontSize: 16, fontWeight: 'bold' },
  naverBtn: {
    backgroundColor: '#03C75A', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  naverBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
