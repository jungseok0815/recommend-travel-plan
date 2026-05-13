import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { login, openNaverLogin, openKakaoLogin } from '../services/authService';
import { saveTokens } from '../utils/tokenStorage';

const DEV_MODE = true; // DB 연결 후 false로 변경

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    if (route.params?.signupSuccess) {
      setShowSuccessBanner(true);
      const timer = setTimeout(() => setShowSuccessBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [route.params?.signupSuccess]);

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
      {showSuccessBanner && (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>✓ 회원가입이 완료되었습니다. 로그인해주세요.</Text>
        </View>
      )}
      <View style={styles.inner}>

        <View style={styles.header}>
          <Text style={styles.title}>여행 플래너</Text>
          <Text style={styles.subtitle}>다시 만나서 반가워요</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="이메일"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>로그인</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>
              계정이 없으신가요? <Text style={styles.signupLinkBold}>회원가입</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>소셜 로그인</Text>
          <View style={styles.divider} />
        </View>

        {DEV_MODE && (
          <TouchableOpacity
            style={styles.devBtn}
            onPress={async () => {
              await saveTokens('dev_token', 'dev_refresh');
              navigation.replace('Main');
            }}
          >
            <Text style={styles.devBtnText}>개발용 — 로그인 없이 시작</Text>
          </TouchableOpacity>
        )}

        <View style={styles.socialGroup}>
          <TouchableOpacity style={styles.kakaoBtn} onPress={handleKakaoLogin}>
            <Text style={styles.kakaoBtnText}>카카오로 계속하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.naverBtn} onPress={handleNaverLogin}>
            <Text style={styles.naverBtnText}>네이버로 계속하기</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  successBannerText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  form: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  loginBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  signupLink: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },
  signupLinkBold: {
    color: '#111827',
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  socialGroup: {
    gap: 10,
  },
  kakaoBtn: {
    backgroundColor: '#FEE500',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  kakaoBtnText: {
    color: '#191919',
    fontSize: 15,
    fontWeight: '600',
  },
  naverBtn: {
    backgroundColor: '#03C75A',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  naverBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  devBtn: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  devBtnText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
});
