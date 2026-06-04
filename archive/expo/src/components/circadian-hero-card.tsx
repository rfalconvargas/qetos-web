import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type HabitCardData = {
  id: string;
  chunk: string;
  title: string;
  action: string;
  accent: string;
  iconBg: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  learnPillar: string;
  learnPhase: number;
};

type Props = {
  habit: HabitCardData;
  isDone: boolean;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function CircadianHeroCard({ habit, isDone }: Props) {
  const { chunk, title, action, accent, iconBg, Icon, learnPillar, learnPhase } = habit;

  const handleWhyPress = () => {
    router.navigate({
      pathname: '/learn',
      params: { pillar: learnPillar, phase: String(learnPhase) },
    });
  };

  return (
    <View style={[styles.card, isDone && styles.cardDone]}>

      {/* Done badge — top-right corner */}
      {isDone && (
        <View style={styles.doneBadge}>
          <Check size={11} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}

      {/* Icon */}
      <View style={[styles.iconBg, { backgroundColor: isDone ? '#D1FAE5' : iconBg }]}>
        <Icon
          size={40}
          color={isDone ? '#059669' : accent}
          strokeWidth={1.6}
        />
      </View>

      {/* Chunk badge */}
      <View style={styles.badgeRow}>
        <View style={[styles.badgeDot, { backgroundColor: isDone ? '#059669' : accent }]} />
        <Text style={[styles.badge, { color: isDone ? '#059669' : accent }]}>
          {isDone ? 'Logged' : chunk}
        </Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, isDone && styles.titleDone]}>{title}</Text>

      {/* Action */}
      <Text style={[styles.action, isDone && styles.actionDone]}>{action}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Why link */}
      <Pressable onPress={handleWhyPress} hitSlop={12}>
        <Text style={[styles.whyLink, { color: isDone ? '#6EE7B7' : accent }]}>
          Why this works →
        </Text>
      </Pressable>

    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E6FAF7',
  },
  cardDone: {
    borderColor: '#A7F3D0',
    shadowOpacity: 0.05,
  },
  doneBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: '#134E4A',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  titleDone: {
    color: '#6B7280',
  },
  action: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B7B77',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.1,
    marginBottom: 28,
  },
  actionDone: {
    color: '#9CA3AF',
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: '#D1FAE5',
    marginBottom: 20,
  },
  whyLink: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
