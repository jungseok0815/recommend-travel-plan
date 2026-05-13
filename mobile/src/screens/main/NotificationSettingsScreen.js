import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notification_settings';

const defaultSettings = {
  travelAlert  : true,
  eventAlert   : false,
};

export default function NotificationSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) setSettings(JSON.parse(val));
    });
  }, []);

  const toggle = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>알림 설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>여행 알림</Text>
            <Text style={styles.rowDesc}>여행 일정 관련 알림</Text>
          </View>
          <Switch
            value={settings.travelAlert}
            onValueChange={() => toggle('travelAlert')}
            trackColor={{ false: '#E5E7EB', true: '#111827' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>이벤트 알림</Text>
            <Text style={styles.rowDesc}>프로모션 및 이벤트 소식</Text>
          </View>
          <Switch
            value={settings.eventAlert}
            onValueChange={() => toggle('eventAlert')}
            trackColor={{ false: '#E5E7EB', true: '#111827' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '600', color: '#111827' },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 22,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 16,
  },
  rowLabel: { fontSize: 15, color: '#111827', marginBottom: 2 },
  rowDesc: { fontSize: 12, color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 18 },
});
