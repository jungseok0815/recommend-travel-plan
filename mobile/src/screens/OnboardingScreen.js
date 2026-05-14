import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPreference, updatePreference, fetchPreferenceOptions } from '../common/api';

export default function OnboardingScreen({ navigation, route }) {
  const isEditing = route?.params?.isEditing ?? false;
  const existing  = route?.params?.existing  ?? null;

  const [steps, setSteps] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPreferenceOptions()
      .then(setSteps)
      .catch(() => Alert.alert('오류', '선택지를 불러오지 못했습니다'))
      .finally(() => setOptionsLoading(false));
  }, []);

  useEffect(() => {
    if (existing) {
      setAnswers({
        travel_style:     existing.travel_style,
        environment:      existing.environment,
        accommodation:    existing.accommodation,
        interest:         existing.interest,
        travel_frequency: existing.travel_frequency,
      });
    }
  }, [existing]);

  if (optionsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const getSelected = () => answers[step.key] ?? (step.multiSelect ? [] : null);

  const hasSelection = () => {
    const sel = getSelected();
    return step.multiSelect ? sel.length > 0 : sel !== null;
  };

  const isOptionSelected = (value) => {
    const sel = getSelected();
    return step.multiSelect ? sel.includes(value) : sel === value;
  };

  const handleSelect = (value) => {
    if (step.multiSelect) {
      setAnswers(prev => {
        const current = prev[step.key] ?? [];
        return {
          ...prev,
          [step.key]: current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value],
        };
      });
    } else {
      setAnswers(prev => ({ ...prev, [step.key]: value }));
    }
  };

  const handleNext = async () => {
    if (!hasSelection()) return;
    if (!isLast) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    setLoading(true);
    try {
      const body = {
        travel_style:     answers.travel_style,
        environment:      answers.environment,
        accommodation:    answers.accommodation,
        interest:         answers.interest,
        travel_frequency: answers.travel_frequency,
      };
      if (isEditing) {
        await updatePreference(body);
        navigation.goBack();
      } else {
        await createPreference(body);
        navigation.replace('Main');
      }
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      if (isEditing) navigation.goBack();
      return;
    }
    setCurrentStep(prev => prev - 1);
  };

  const selectedCount = step.multiSelect ? (getSelected()).length : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {(currentStep > 0 || isEditing) ? (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtnPlaceholder} />
          )}
        </View>
        <View style={styles.progressWrap}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressBar,
                i < currentStep   && styles.progressBarDone,
                i === currentStep && styles.progressBarActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepCounter}>{currentStep + 1}/{steps.length}</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 질문 */}
        <View style={styles.questionSection}>
          <View style={styles.stepBadgeRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP {currentStep + 1}</Text>
            </View>
            {step.multiSelect && (
              <View style={styles.multiSelectBadge}>
                <Ionicons name="checkmark-done-outline" size={12} color="#2563EB" />
                <Text style={styles.multiSelectBadgeText}>복수 선택 가능</Text>
              </View>
            )}
          </View>
          <Text style={styles.questionTitle}>{step.title}</Text>
          <Text style={styles.questionSubtitle}>{step.subtitle}</Text>
        </View>

        {/* 옵션 카드 */}
        <View style={styles.optionsWrap}>
          {step.options.map((opt) => {
            const selected = isOptionSelected(opt.value);
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIconWrap, selected && styles.optionIconWrapSelected]}>
                  <Ionicons
                    name={opt.icon}
                    size={22}
                    color={selected ? '#FFFFFF' : '#6B7280'}
                  />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.optionDesc, selected && styles.optionDescSelected]}>
                    {opt.desc}
                  </Text>
                </View>
                <View style={[styles.optionCheck, selected && styles.optionCheckSelected]}>
                  {selected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        {step.multiSelect && selectedCount > 0 && (
          <Text style={styles.selectedCountText}>{selectedCount}개 선택됨</Text>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, !hasSelection() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!hasSelection() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.nextBtnInner}>
              <Text style={styles.nextBtnText}>
                {isLast ? (isEditing ? '저장하기' : '시작하기') : '다음'}
              </Text>
              {!isLast && (
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  headerLeft: { width: 36 },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: { width: 36 },
  progressWrap: { flex: 1, flexDirection: 'row', gap: 5 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  progressBarDone:   { backgroundColor: '#9CA3AF' },
  progressBarActive: { backgroundColor: '#111827' },
  stepCounter: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', width: 28, textAlign: 'right' },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingBottom: 16 },

  questionSection: { paddingTop: 24, paddingBottom: 24 },
  stepBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  stepBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepBadgeText: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1 },
  multiSelectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  multiSelectBadgeText: { fontSize: 11, fontWeight: '600', color: '#2563EB' },

  questionTitle: {
    fontSize: 26, fontWeight: '700', color: '#111827',
    lineHeight: 34, letterSpacing: -0.5, marginBottom: 8,
  },
  questionSubtitle: { fontSize: 14, color: '#9CA3AF', lineHeight: 20 },

  optionsWrap: { gap: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 14,
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
  optionCheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  optionCheckSelected: { backgroundColor: '#111827', borderColor: '#111827' },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  selectedCountText: {
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
