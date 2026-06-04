import * as Haptics from 'expo-haptics';
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  Target,
  X,
  Zap,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────

type LogCategoryKey = 'biomarker' | 'victory' | 'craving';

type LogCategory = {
  key: LogCategoryKey;
  title: string;
  subtitle: string;
  confirmSubtitle: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  color: string;
  iconBg: string;
  cardBg: string;
  cardBorder: string;
  sliderTrackBg: string;
  slideLabel: string;
};

const CATEGORIES: LogCategory[] = [
  {
    key: 'biomarker',
    title: 'Log Biomarker',
    subtitle: 'Glucose · Ketones · HRV',
    confirmSubtitle: 'Mark that you took a measurement today.',
    Icon: Activity,
    color: '#0D9488',
    iconBg: '#CCFBF1',
    cardBg: '#F0FDF9',
    cardBorder: '#A7F3D0',
    sliderTrackBg: '#CCFBF1',
    slideLabel: 'Slide to log biomarker',
  },
  {
    key: 'victory',
    title: 'Record a Victory',
    subtitle: 'Nervous system · Stress · Rebuild',
    confirmSubtitle: 'Celebrate a win — small or massive.',
    Icon: Zap,
    color: '#059669',
    iconBg: '#D1FAE5',
    cardBg: '#F0FDF4',
    cardBorder: '#6EE7B7',
    sliderTrackBg: '#D1FAE5',
    slideLabel: 'Slide to log your victory',
  },
  {
    key: 'craving',
    title: 'Navigated a Craving',
    subtitle: 'Avoided a trigger or substance',
    confirmSubtitle: 'You held the line. Log this act of resilience.',
    Icon: Target,
    color: '#7C3AED',
    iconBg: '#EDE9FE',
    cardBg: '#FDFBFF',
    cardBorder: '#C4B5FD',
    sliderTrackBg: '#EDE9FE',
    slideLabel: 'Slide to log resilience',
  },
];

// ─────────────────────────────────────────────────────────────
// Slide-to-confirm
// ─────────────────────────────────────────────────────────────

const THUMB_SIZE = 64;
const TRACK_HEIGHT = 74;
const THUMB_PAD = 5;

function SlideToConfirm({
  category,
  onConfirm,
}: {
  category: LogCategory;
  onConfirm: () => void;
}) {
  const { width } = useWindowDimensions();
  const TRACK_W = width - 48;
  const MAX_X = TRACK_W - THUMB_SIZE - THUMB_PAD * 2;

  const x = useSharedValue(0);

  const triggerConfirm = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  }, [onConfirm]);

  const pan = Gesture.Pan()
    .onStart(() => {
      cancelAnimation(x);
    })
    .onChange((e) => {
      x.value = Math.max(0, Math.min(x.value + e.changeX, MAX_X));
    })
    .onEnd(() => {
      if (x.value >= MAX_X * 0.82) {
        x.value = withSpring(MAX_X, { damping: 20, stiffness: 220 });
        runOnJS(triggerConfirm)();
      } else {
        x.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: x.value + THUMB_SIZE + THUMB_PAD * 2,
    opacity: interpolate(x.value, [0, MAX_X], [0.35, 0.65]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, MAX_X * 0.38], [1, 0], 'clamp'),
  }));

  return (
    <View
      style={[
        sld.track,
        {
          width: TRACK_W,
          height: TRACK_HEIGHT,
          backgroundColor: category.sliderTrackBg,
        },
      ]}
    >
      {/* Animated fill */}
      <Animated.View
        style={[sld.fill, fillStyle, { backgroundColor: category.color }]}
        pointerEvents="none"
      />

      {/* Label */}
      <Animated.Text style={[sld.label, labelStyle]} pointerEvents="none">
        {category.slideLabel}
      </Animated.Text>

      {/* Draggable thumb */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[sld.thumb, thumbStyle, { backgroundColor: category.color }]}
        >
          <ChevronRight
            size={18}
            color="rgba(255,255,255,0.5)"
            strokeWidth={2.5}
            style={{ marginRight: -10 }}
          />
          <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const sld = StyleSheet.create({
  track: {
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: TRACK_HEIGHT / 2,
  },
  label: {
    position: 'absolute',
    left: THUMB_SIZE + THUMB_PAD * 2 + 8,
    right: 16,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  thumb: {
    position: 'absolute',
    left: THUMB_PAD,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
});

// ─────────────────────────────────────────────────────────────
// Category card (menu view)
// ─────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  onPress,
}: {
  category: LogCategory;
  onPress: () => void;
}) {
  const { Icon } = category;
  return (
    <Pressable
      style={({ pressed }) => [
        cc.card,
        {
          backgroundColor: category.cardBg,
          borderColor: category.cardBorder,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      {/* Icon circle */}
      <View style={[cc.iconCircle, { backgroundColor: category.iconBg }]}>
        <Icon size={28} color={category.color} strokeWidth={1.8} />
      </View>

      {/* Text */}
      <View style={cc.textBlock}>
        <Text style={[cc.title, { color: category.color }]}>{category.title}</Text>
        <Text style={cc.subtitle}>{category.subtitle}</Text>
      </View>

      {/* Chevron */}
      <ChevronRight size={18} color={category.color + '80'} strokeWidth={2} />
    </Pressable>
  );
}

const cc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 23,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 18,
  },
});

// ─────────────────────────────────────────────────────────────
// LogModal
// ─────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  onClose: () => void;
};

type ViewState = 'menu' | 'confirm' | 'success';

export function LogModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const [view, setView] = useState<ViewState>('menu');
  const [selected, setSelected] = useState<LogCategory | null>(null);

  const handleCardPress = (category: LogCategory) => {
    setSelected(category);
    setView('confirm');
  };

  const handleConfirm = useCallback(() => {
    setView('success');
    setTimeout(() => {
      onClose();
      // reset after the modal has animated away
      setTimeout(() => {
        setView('menu');
        setSelected(null);
      }, 400);
    }, 1400);
  }, [onClose]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setView('menu');
      setSelected(null);
    }, 400);
  };

  const sheetHeight = height * 0.88;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { height: sheetHeight }]}
          onPress={() => {}}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* ── Menu view ─────────────────────────────── */}
          {view === 'menu' && (
            <Animated.View
              style={styles.viewContainer}
              entering={withTiming as any}
            >
              {/* Close button */}
              <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
                <X size={16} color="#9CA3AF" strokeWidth={2.5} />
              </Pressable>

              <Text style={styles.menuTitle}>Quick Log</Text>
              <Text style={styles.menuSub}>What are you logging today?</Text>

              <View style={styles.cardList}>
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.key}
                    category={cat}
                    onPress={() => handleCardPress(cat)}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* ── Confirm view ─────────────────────────── */}
          {view === 'confirm' && selected && (
            <View style={styles.viewContainer}>
              {/* Back */}
              <Pressable
                style={styles.backBtn}
                onPress={() => setView('menu')}
                hitSlop={12}
              >
                <ChevronLeft size={18} color="#6B7280" strokeWidth={2} />
                <Text style={styles.backText}>Back</Text>
              </Pressable>

              {/* Icon */}
              <View style={styles.confirmIconArea}>
                <View
                  style={[
                    styles.confirmIconCircle,
                    { backgroundColor: selected.iconBg },
                  ]}
                >
                  <selected.Icon size={44} color={selected.color} strokeWidth={1.6} />
                </View>
              </View>

              {/* Title */}
              <Text style={[styles.confirmTitle, { color: selected.color }]}>
                {selected.title}
              </Text>
              <Text style={styles.confirmSubtitle}>{selected.confirmSubtitle}</Text>

              {/* Slider */}
              <View style={styles.sliderArea}>
                <SlideToConfirm
                  category={selected}
                  onConfirm={handleConfirm}
                />
              </View>

              {/* Cancel */}
              <Pressable
                onPress={() => setView('menu')}
                hitSlop={12}
                style={styles.cancelLink}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {/* ── Success view ─────────────────────────── */}
          {view === 'success' && selected && (
            <View style={[styles.viewContainer, styles.successContainer]}>
              <View
                style={[
                  styles.successCircle,
                  { backgroundColor: selected.iconBg },
                ]}
              >
                <Check size={52} color={selected.color} strokeWidth={2} />
              </View>
              <Text style={[styles.successTitle, { color: selected.color }]}>
                Logged!
              </Text>
              <Text style={styles.successSub}>{selected.title}</Text>
            </View>
          )}

          {/* Bottom safe area */}
          <View style={{ height: insets.bottom + (Platform.OS === 'ios' ? 8 : 16) }} />
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
    backgroundColor: 'rgba(3, 37, 35, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  viewContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  // Close
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 24,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Menu
  menuTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.4,
    marginTop: 32,
  },
  menuSub: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 28,
    letterSpacing: 0.1,
  },
  cardList: {
    gap: 14,
  },

  // Confirm
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  confirmIconArea: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 28,
  },
  confirmIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  sliderArea: {
    alignItems: 'center',
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    letterSpacing: 0.1,
  },

  // Success
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
    letterSpacing: 0.1,
  },
});
