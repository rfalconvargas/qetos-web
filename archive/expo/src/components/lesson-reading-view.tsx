import { BookOpen, Target, X } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Application, CurriculumUnit, Lesson } from '@/data/smartCurriculum';
import { PILLAR_META } from '@/data/smartCurriculum';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ContentPayload =
  | { kind: 'lesson'; lesson: Lesson }
  | { kind: 'application'; application: Application };

type Props = {
  visible: boolean;
  onClose: () => void;
  payload: ContentPayload | null;
  unit: CurriculumUnit;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function LessonReadingView({ visible, onClose, payload, unit }: Props) {
  if (!payload) return null;

  const pillarMeta = PILLAR_META[unit.pillar];
  const isLesson = payload.kind === 'lesson';

  const typeLabel = isLesson ? 'LESSON' : 'HABIT';
  const typeColor = isLesson ? '#0D9488' : '#7C3AED';
  const typeBg = isLesson ? '#F0FDF9' : '#F5F3FF';

  const title = isLesson ? payload.lesson.title : payload.application.habit;
  const bodyText = isLesson ? payload.lesson.body : payload.application.habit;
  const metaText = isLesson
    ? `${payload.lesson.readingTime} read`
    : payload.application.frequency;

  const accentCardBg = isLesson ? '#F0FDF9' : '#F5F3FF';
  const accentCardBorder = isLesson ? '#A7F3D0' : '#DDD6FE';
  const accentCardColor = isLesson ? '#0D9488' : '#7C3AED';
  const accentCardLabel = isLesson ? 'Phase Context' : 'Practice Rhythm';
  const accentCardBody = isLesson
    ? `Part of Phase ${unit.phase} — ${unit.phaseTitle}`
    : `${payload.application.frequency} · Consistency is the engine of metabolic change.`;

  const doneLabel = isLesson ? 'Done Reading' : 'Got It';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Sheet — stop propagation so tapping inside doesn't close */}
        <Pressable style={styles.sheet} onPress={() => {}}>

          {/* Handle */}
          <View style={styles.handle} />

          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <X size={16} color="#6B7280" strokeWidth={2.5} />
          </Pressable>

          {/* Scrollable content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces
          >
            {/* Pillar breadcrumb */}
            <Text style={styles.breadcrumb}>
              {pillarMeta.icon}  {pillarMeta.label.toUpperCase()} · PHASE {unit.phase}
            </Text>

            {/* Type pill */}
            <View style={[styles.typePill, { backgroundColor: typeBg }]}>
              {isLesson
                ? <BookOpen size={11} color={typeColor} strokeWidth={2} />
                : <Target size={11} color={typeColor} strokeWidth={2} />}
              <Text style={[styles.typePillText, { color: typeColor }]}>{typeLabel}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Meta row */}
            <View style={styles.metaRow}>
              {isLesson
                ? <BookOpen size={13} color="#9CA3AF" strokeWidth={1.5} />
                : <Target size={13} color="#9CA3AF" strokeWidth={1.5} />}
              <Text style={styles.metaText}>{metaText}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Section label */}
            <Text style={[styles.sectionLabel, { color: typeColor }]}>
              {isLesson ? 'OVERVIEW' : 'YOUR PRACTICE'}
            </Text>

            {/* Body content */}
            <Text style={styles.bodyText}>{bodyText}</Text>

            {/* Accent context card */}
            <View style={[styles.accentCard, { backgroundColor: accentCardBg, borderColor: accentCardBorder }]}>
              <Text style={[styles.accentCardLabel, { color: accentCardColor }]}>
                {accentCardLabel}
              </Text>
              <Text style={[styles.accentCardBody, { color: accentCardColor }]}>
                {accentCardBody}
              </Text>
            </View>

          </ScrollView>

          {/* Footer button */}
          <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 36 : 24 }]}>
            <Pressable
              style={[styles.doneBtn, { backgroundColor: typeColor }]}
              onPress={onClose}
            >
              <Text style={styles.doneBtnText}>{doneLabel}</Text>
            </Pressable>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 37, 35, 0.32)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '92%',
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
    marginTop: 14,
    marginBottom: 8,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  breadcrumb: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9CA3AF',
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 28,
    letterSpacing: 0.1,
    marginBottom: 28,
  },
  accentCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 6,
  },
  accentCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  accentCardBody: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  doneBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
