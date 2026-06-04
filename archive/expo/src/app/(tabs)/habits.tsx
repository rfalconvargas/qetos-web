import {
  Activity,
  BarChart2,
  Brain,
  ChevronRight,
  Clock,
  Heart,
  Lock,
  Moon,
  Shield,
  Sun,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;

type PillarData = {
  key: string;
  label: string;
  Icon: IconComponent;
  color: string;
  iconBg: string;
  points: number;
  progress: number;
  locked: boolean;
  lockReason?: string;
};

type TimeWindow = {
  key: 'bedtime' | 'wake';
  label: string;
  Icon: IconComponent;
  color: string;
  iconBg: string;
  pillBg: string;
  pillBorder: string;
  options: string[];
};

// ─────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────

const TOTAL_BLOOMS = 1240;

const PILLARS: PillarData[] = [
  {
    key: 'THINK',
    label: 'Think',
    Icon: Brain,
    color: '#7C3AED',
    iconBg: '#F5F3FF',
    points: 340,
    progress: 68,
    locked: false,
  },
  {
    key: 'SLEEP',
    label: 'Sleep',
    Icon: Moon,
    color: '#1D4ED8',
    iconBg: '#EFF6FF',
    points: 280,
    progress: 58,
    locked: false,
  },
  {
    key: 'MOVE',
    label: 'Move',
    Icon: Activity,
    color: '#059669',
    iconBg: '#ECFDF5',
    points: 310,
    progress: 72,
    locked: false,
  },
  {
    key: 'AVOID',
    label: 'Avoid',
    Icon: Shield,
    color: '#9333EA',
    iconBg: '#FAF5FF',
    points: 190,
    progress: 45,
    locked: false,
  },
  {
    key: 'REBUILD',
    label: 'Rebuild',
    Icon: Heart,
    color: '#0E7490',
    iconBg: '#ECFEFF',
    points: 120,
    progress: 38,
    locked: false,
  },
  {
    key: 'TRACK',
    label: 'Track',
    Icon: BarChart2,
    color: '#D97706',
    iconBg: '#FFFBEB',
    points: 0,
    progress: 0,
    locked: true,
    lockReason: 'Unlocks after 7 days of circadian consistency',
  },
];

const TIME_WINDOWS: TimeWindow[] = [
  {
    key: 'bedtime',
    label: 'Set Bedtime Window',
    Icon: Moon,
    color: '#1D4ED8',
    iconBg: '#EFF6FF',
    pillBg: '#EFF6FF',
    pillBorder: '#BFDBFE',
    options: ['9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'],
  },
  {
    key: 'wake',
    label: 'Set Wake Window',
    Icon: Sun,
    color: '#F59E0B',
    iconBg: '#FFFBEB',
    pillBg: '#FFFBEB',
    pillBorder: '#FDE68A',
    options: ['5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM'],
  },
];

// ─────────────────────────────────────────────────────────────
// Balance card
// ─────────────────────────────────────────────────────────────

function BalanceCard() {
  return (
    <View style={bc.card}>
      <View style={bc.topRow}>
        <View style={bc.iconCircle}>
          <Sun size={18} color="#0D9488" strokeWidth={1.8} />
        </View>
        <Text style={bc.label}>VITALITY BALANCE</Text>
      </View>

      <Text style={bc.score}>
        {TOTAL_BLOOMS.toLocaleString()}
        <Text style={bc.unit}> Blooms</Text>
      </Text>

      <View style={bc.streakRow}>
        <View style={bc.streakDot} />
        <Text style={bc.streakText}>7-day circadian streak</Text>
      </View>
    </View>
  );
}

const bc = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6FAF7',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  score: {
    fontSize: 52,
    fontWeight: '700',
    color: '#0D9488',
    letterSpacing: -1.5,
    lineHeight: 58,
  },
  unit: {
    fontSize: 22,
    fontWeight: '400',
    color: '#14B8A6',
    letterSpacing: -0.2,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
  },
  streakDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  streakText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B9E98',
    letterSpacing: 0.1,
  },
});

// ─────────────────────────────────────────────────────────────
// Pillar row
// ─────────────────────────────────────────────────────────────

function PillarRow({ pillar }: { pillar: PillarData }) {
  const { label, Icon, color, iconBg, points, progress, locked, lockReason } = pillar;
  return (
    <View style={[pr.row, locked && pr.rowLocked]}>
      <View style={[pr.iconCircle, { backgroundColor: iconBg }]}>
        <Icon size={18} color={color} strokeWidth={1.8} />
      </View>

      <View style={pr.body}>
        <View style={pr.labelRow}>
          <Text style={pr.label}>{label}</Text>
          {locked && <Lock size={11} color="#D1D5DB" strokeWidth={2} />}
        </View>

        {locked ? (
          <Text style={pr.lockReason} numberOfLines={1}>{lockReason}</Text>
        ) : (
          <View style={pr.trackRow}>
            <View style={pr.track}>
              <View style={[pr.fill, { width: `${progress}%`, backgroundColor: color }]} />
            </View>
            <Text style={[pr.pct, { color }]}>{progress}%</Text>
          </View>
        )}
      </View>

      <View style={pr.right}>
        {locked ? (
          <Text style={pr.ptsLocked}>—</Text>
        ) : (
          <>
            <Text style={[pr.pts, { color }]}>{points}</Text>
            <Text style={pr.ptsLabel}>pts</Text>
          </>
        )}
      </View>
    </View>
  );
}

const pr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowLocked: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    gap: 7,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#134E4A',
    letterSpacing: -0.1,
  },
  lockReason: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 0.1,
    lineHeight: 15,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
  pct: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    width: 34,
    textAlign: 'right',
  },
  right: {
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 44,
  },
  pts: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  ptsLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    letterSpacing: 0.2,
    textAlign: 'right',
  },
  ptsLocked: {
    fontSize: 20,
    fontWeight: '300',
    color: '#D1D5DB',
  },
});

// ─────────────────────────────────────────────────────────────
// Protocol row
// ─────────────────────────────────────────────────────────────

function ProtocolRow({
  tw,
  value,
  onPress,
}: {
  tw: TimeWindow;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={pw.row} onPress={onPress} activeOpacity={0.72}>
      <View style={[pw.iconCircle, { backgroundColor: tw.iconBg }]}>
        <tw.Icon size={18} color={tw.color} strokeWidth={1.8} />
      </View>

      <Text style={pw.label}>{tw.label}</Text>

      <View style={[pw.valuePill, { backgroundColor: tw.pillBg, borderColor: tw.pillBorder }]}>
        <Clock size={10} color={tw.color} strokeWidth={2} />
        <Text style={[pw.valueText, { color: tw.color }]}>{value}</Text>
      </View>

      <ChevronRight size={15} color="#D1D5DB" strokeWidth={2} />
    </TouchableOpacity>
  );
}

const pw = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#134E4A',
    letterSpacing: -0.1,
  },
  valuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

// ─────────────────────────────────────────────────────────────
// Time picker modal
// ─────────────────────────────────────────────────────────────

type PickerModalProps = {
  tw: TimeWindow | null;
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
};

function TimePickerModal({ tw, selected, onSelect, onClose }: PickerModalProps) {
  if (!tw) return null;
  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={pm.overlay} onPress={onClose}>
        <Pressable style={pm.sheet} onPress={() => {}}>
          <View style={pm.handle} />

          <Pressable style={pm.closeBtn} onPress={onClose} hitSlop={12}>
            <X size={15} color="#6B7280" strokeWidth={2.5} />
          </Pressable>

          <Text style={pm.title}>{tw.label}</Text>

          <View style={pm.grid}>
            {tw.options.map((opt) => {
              const active = opt === selected;
              return (
                <Pressable
                  key={opt}
                  style={[
                    pm.chip,
                    active && { backgroundColor: tw.color, borderColor: tw.color },
                  ]}
                  onPress={() => {
                    onSelect(opt);
                    onClose();
                  }}
                >
                  <Text style={[pm.chipText, active && pm.chipTextActive]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ height: Platform.OS === 'ios' ? 36 : 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const pm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 37, 35, 0.32)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#134E4A',
    letterSpacing: -0.2,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    flexBasis: '30%',
    flexGrow: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

// ─────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────

export default function HabitsScreen() {
  const [bedtime, setBedtime] = useState('10:00 PM');
  const [wake, setWake] = useState('6:00 AM');
  const [activePicker, setActivePicker] = useState<'bedtime' | 'wake' | null>(null);

  const activeWindow = activePicker
    ? TIME_WINDOWS.find((w) => w.key === activePicker) ?? null
    : null;

  const activeSelected = activePicker === 'bedtime' ? bedtime : wake;

  const handleSelect = (v: string) => {
    if (activePicker === 'bedtime') setBedtime(v);
    else setWake(v);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Vitality Bank</Text>

        <BalanceCard />

        <Text style={styles.sectionLabel}>Pillar Breakdown</Text>
        <View style={styles.card}>
          {PILLARS.map((p, i) => (
            <React.Fragment key={p.key}>
              <PillarRow pillar={p} />
              {i < PILLARS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Circadian Optimization Window</Text>
        <View style={styles.card}>
          {TIME_WINDOWS.map((tw, i) => (
            <React.Fragment key={tw.key}>
              <ProtocolRow
                tw={tw}
                value={tw.key === 'bedtime' ? bedtime : wake}
                onPress={() => setActivePicker(tw.key)}
              />
              {i < TIME_WINDOWS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      <TimePickerModal
        tw={activeWindow}
        selected={activeSelected}
        onSelect={handleSelect}
        onClose={() => setActivePicker(null)}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared screen styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F0FDF8',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#134E4A',
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 32,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  bottomPad: {
    height: 36,
  },
});
