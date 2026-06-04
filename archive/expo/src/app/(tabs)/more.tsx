import {
  Bluetooth,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Palette,
  PieChart,
  Share2,
  User,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconComponent = React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;

type SettingsRow = {
  label: string;
  Icon: IconComponent;
  iconColor: string;
  iconBg: string;
};

const SETTINGS_ROWS: SettingsRow[] = [
  {
    label: 'Account',
    Icon: User,
    iconColor: '#1565C0',
    iconBg: '#EFF6FF',
  },
  {
    label: 'Profile',
    Icon: FileText,
    iconColor: '#0D9488',
    iconBg: '#F0FDF9',
  },
  {
    label: 'Target Metabolic Ranges',
    Icon: PieChart,
    iconColor: '#059669',
    iconBg: '#ECFDF5',
  },
  {
    label: 'Fasting Management',
    Icon: Clock,
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
  },
  {
    label: 'Display',
    Icon: Palette,
    iconColor: '#9333EA',
    iconBg: '#FAF5FF',
  },
  {
    label: 'Connect Apps & Devices (Chronometer, Apple Health)',
    Icon: Bluetooth,
    iconColor: '#0EA5E9',
    iconBg: '#F0F9FF',
  },
  {
    label: 'Referrals',
    Icon: Share2,
    iconColor: '#9333EA',
    iconBg: '#FAF5FF',
  },
  {
    label: 'Support',
    Icon: HelpCircle,
    iconColor: '#475569',
    iconBg: '#F8FAFC',
  },
  {
    label: 'About',
    Icon: FileText,
    iconColor: '#1565C0',
    iconBg: '#EFF6FF',
  },
];

function SettingsMenuRow({ row }: { row: SettingsRow }) {
  const { label, Icon, iconColor, iconBg } = row;

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.68}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Icon size={18} color={iconColor} strokeWidth={1.8} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>More</Text>
        <Text style={styles.screenSub}>Settings and connected health tools</Text>

        <View style={styles.card}>
          {SETTINGS_ROWS.map((row, index) => (
            <React.Fragment key={row.label}>
              <SettingsMenuRow row={row} />
              {index < SETTINGS_ROWS.length - 1 ? <View style={styles.divider} /> : null}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  screenSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
});
