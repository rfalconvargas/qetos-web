import { X } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─────────────────────────────────────────────────────────────
// Types & science content
// ─────────────────────────────────────────────────────────────

export type TimeChunk = 'Morning' | 'Mid-Day' | 'Evening';

type Insight = { label: string; body: string };

type Lesson = { habitTitle: string; insights: [Insight, Insight, Insight] };

const LESSONS: Record<TimeChunk, Lesson> = {
  Morning: {
    habitTitle: 'Get Morning Sunlight',
    insights: [
      {
        label: 'The Signal',
        body: 'Light activates specialized retinal cells (ipRGCs) that send a "time is now" message to your brain\'s master clock — the suprachiasmatic nucleus.',
      },
      {
        label: 'The Cascade',
        body: 'This fires a natural cortisol pulse within 30–45 min of waking — your cleanest activation signal — and starts a 12–14 hour sleep countdown timer.',
      },
      {
        label: 'Your Protocol Advantage',
        body: 'Anchoring this timer daily keeps cortisol low at night, reducing late-evening glucose production and directly supporting ketosis the next morning.',
      },
    ],
  },
  'Mid-Day': {
    habitTitle: 'Take a Post-Meal Walk',
    insights: [
      {
        label: 'The Signal',
        body: 'Muscle contractions activate GLUT4 glucose transporters independent of insulin, pulling glucose from the bloodstream straight into working muscle cells.',
      },
      {
        label: 'The Cascade',
        body: 'A 10-minute post-meal walk can reduce blood glucose area-under-curve by up to 22% — more potent per minute than almost any dietary swap.',
      },
      {
        label: 'Your Protocol Advantage',
        body: 'A blunted glucose peak means a smaller insulin spike and a faster return to fat-burning — the cornerstone of your therapeutic ketogenic protocol.',
      },
    ],
  },
  Evening: {
    habitTitle: 'Dim Your Lights',
    insights: [
      {
        label: 'The Signal',
        body: 'Blue-wavelength light tells the pineal gland to halt melatonin production. Even dim overhead LEDs carry enough blue light to cause a measurable delay.',
      },
      {
        label: 'The Cascade',
        body: 'Each 100 lux of bright light at night delays melatonin onset by ~30 minutes, compressing your recovery window and reducing sleep quality.',
      },
      {
        label: 'Your Protocol Advantage',
        body: 'Poor sleep spikes next-morning cortisol and ghrelin — both drive glucose production and carb cravings that directly undermine the next day\'s ketosis.',
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
  chunk: TimeChunk;
};

export function IcebergLessonModal({ visible, onClose, chunk }: Props) {
  const { habitTitle, insights } = LESSONS[chunk];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>The Science Behind It</Text>
              <Text style={styles.headerSub}>{habitTitle}</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <X size={15} color="#7C3AED" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {insights.map((insight, i) => (
              <View key={i} style={styles.insightCard}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                <View style={styles.insightBody}>
                  <Text style={styles.insightLabel}>{insight.label}</Text>
                  <Text style={styles.insightText}>{insight.body}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable style={styles.gotItBtn} onPress={onClose}>
            <Text style={styles.gotItText}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles  (soft lavender / violet palette)
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 75, 0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF8FF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 44,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: '#C4B5FD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#2D1B69',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8B5CF6',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    maxHeight: 360,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 10,
    paddingBottom: 4,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  insightBody: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
    letterSpacing: 0.1,
  },
  insightText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  gotItBtn: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  gotItText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
