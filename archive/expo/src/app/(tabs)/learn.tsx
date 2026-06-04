import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LessonModule = {
  title: string;
  description: string;
};

const LESSON_MODULES: LessonModule[] = [
  {
    title: 'Therapeutic Integration of Nutritional Ketosis',
    description:
      'Understand how a well-formulated ketogenic approach can stabilize brain energy, reduce glucose volatility, and support metabolic flexibility.',
  },
  {
    title: 'Circadian Health & Deep Sleep Stabilization',
    description:
      'Learn how light timing, sleep consistency, and evening wind-down cues protect your recovery window and next-day metabolic control.',
  },
  {
    title: 'Sustained Energy & Mitochondria Activation',
    description:
      'Build steady energy through gentle movement, mitochondrial demand signals, and habits that reduce afternoon crashes.',
  },
];

export default function LearnScreen() {
  const [openSection, setOpenSection] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Learn</Text>
          <Text style={styles.screenSub}>Core metabolic lessons</Text>
        </View>

        <View style={styles.lessonList}>
          {LESSON_MODULES.map((lesson, index) => {
            const isOpen = openSection === index;

            return (
              <View key={lesson.title} style={styles.lessonCard}>
                <Pressable
                  style={styles.lessonHeader}
                  onPress={() => setOpenSection(isOpen ? null : index)}
                  activeOpacity={0.76}
                >
                  <Text style={styles.lessonNumber}>{index + 1}</Text>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.toggleGlyph}>{isOpen ? '-' : '+'}</Text>
                </Pressable>

                {isOpen ? (
                  <View style={styles.lessonBody}>
                    <Text style={styles.lessonDescription}>{lesson.description}</Text>
                    <Pressable
                      style={styles.learnMoreButton}
                      onPress={() => Alert.alert(lesson.title, lesson.description)}
                      activeOpacity={0.82}
                    >
                      <Text style={styles.learnMoreText}>Learn More</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F0FDF8',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
  },
  screenHeader: {
    paddingBottom: 18,
    gap: 2,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#134E4A',
    letterSpacing: -0.3,
  },
  screenSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B9E98',
    letterSpacing: 0.1,
  },
  lessonList: {
    gap: 12,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonHeader: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  lessonNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 28,
    backgroundColor: '#ECFDF5',
    color: '#0D9488',
    fontSize: 14,
    fontWeight: '800',
  },
  lessonTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#134E4A',
    lineHeight: 22,
  },
  toggleGlyph: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 28,
    backgroundColor: '#ECFDF5',
    color: '#0D9488',
    fontSize: 20,
    fontWeight: '700',
  },
  lessonBody: {
    borderTopWidth: 1,
    borderTopColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  lessonDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B7B77',
  },
  learnMoreButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#0D9488',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
