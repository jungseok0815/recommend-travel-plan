import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { signup, checkEmailDuplicate } from '../services/authService';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | 'available' | 'taken'
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailStatus(null);
    setEmailError(null);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError(null);
  };

  const handlePasswordConfirmChange = (text) => {
    setPasswordConfirm(text);
    setPasswordError(null);
  };

  const handleCheckEmail = async () => {
    if (!email) {
      setEmailError('이메일을 입력해주세요');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다');
      return;
    }
    setEmailError(null);
    setEmailCheckLoading(true);
    try {
      const available = await checkEmailDuplicate(email);
      setEmailStatus(available ? 'available' : 'taken');
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleSignup = async () => {
    let hasError = false;

    if (!email || !isValidEmail(email)) {
      setEmailError(!email ? '이메일을 입력해주세요' : '올바른 이메일 형식이 아닙니다');
      hasError = true;
    } else if (emailStatus !== 'available') {
      setEmailError('이메일 중복확인을 해주세요');
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (!password || password !== passwordConfirm) {
      setPasswordError(!password ? '비밀번호를 입력해주세요' : '비밀번호가 일치하지 않습니다');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (!address) {
      Alert.alert('알림', '거주지를 입력해주세요');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      await signup(email, password, address);
      Alert.alert('가입 완료', '로그인해주세요', [
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

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← 뒤로</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>계정 만들기</Text>
          <Text style={styles.subtitle}>여행 플래너를 시작해보세요</Text>
        </View>

        <View style={styles.emailRow}>
          <TextInput
            style={[
              styles.input, styles.emailInput,
              emailStatus === 'available' && styles.inputVerified,
              emailStatus === 'taken' && styles.inputError,
            ]}
            placeholder="이메일"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[
              styles.checkBtn,
              emailStatus === 'available' && styles.checkBtnDone,
              emailStatus === 'taken' && styles.checkBtnError,
            ]}
            onPress={handleCheckEmail}
            disabled={emailCheckLoading}
          >
            {emailCheckLoading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.checkBtnText}>{emailStatus === 'available' ? '확인됨' : '중복확인'}</Text>
            }
          </TouchableOpacity>
        </View>
        {emailError ? (
          <Text style={styles.emailStatusErr}>✗ {emailError}</Text>
        ) : emailStatus === 'available' ? (
          <Text style={styles.emailStatusOk}>✓ 사용 가능한 이메일입니다</Text>
        ) : emailStatus === 'taken' ? (
          <Text style={styles.emailStatusErr}>✗ 이미 사용 중인 이메일입니다</Text>
        ) : null}
        <TextInput
          style={[styles.input, passwordError && styles.inputError]}
          placeholder="비밀번호"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, passwordError && styles.inputError]}
          placeholder="비밀번호 확인"
          placeholderTextColor="#9CA3AF"
          value={passwordConfirm}
          onChangeText={handlePasswordConfirmChange}
          secureTextEntry
        />
        {passwordError && (
          <Text style={styles.fieldErr}>✗ {passwordError}</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="거주지 (예: 서울시 강남구)"
          placeholderTextColor="#9CA3AF"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.signupBtnText}>가입하기</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>
            이미 계정이 있으신가요? <Text style={styles.loginLinkBold}>로그인</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 32,
  },
  backBtnText: {
    color: '#6B7280',
    fontSize: 15,
  },
  header: {
    marginBottom: 36,
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
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  emailStatusOk: {
    fontSize: 12,
    color: '#10B981',
    marginBottom: 10,
    marginLeft: 4,
  },
  emailStatusErr: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 10,
    marginLeft: 4,
  },
  fieldErr: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 4,
  },
  emailInput: {
    flex: 1,
    marginBottom: 0,
  },
  inputVerified: {
    borderWidth: 1,
    borderColor: '#10B981',
  },
  checkBtn: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  checkBtnDone: {
    backgroundColor: '#10B981',
  },
  checkBtnError: {
    backgroundColor: '#EF4444',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  checkBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
  signupBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  signupBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  loginLink: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },
  loginLinkBold: {
    color: '#111827',
    fontWeight: '600',
  },
});
