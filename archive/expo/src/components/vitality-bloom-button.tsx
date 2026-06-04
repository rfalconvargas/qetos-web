import * as Haptics from 'expo-haptics';
import { Leaf } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const RING_SIZE = 64;
const BLOOM_DURATION = 1000;
const BLOOM_SCALE = 4.2;

type Props = {
  isDone: boolean;
  onPress: () => void;
  label?: string;
};

export function VitalityBloomButton({
  isDone,
  onPress,
  label = 'Log habit in Vitality Bank',
}: Props) {
  const btnScale = useSharedValue(1);
  const r1Scale = useSharedValue(0.15);
  const r1Opacity = useSharedValue(0);
  const r2Scale = useSharedValue(0.15);
  const r2Opacity = useSharedValue(0);
  const r3Scale = useSharedValue(0.15);
  const r3Opacity = useSharedValue(0);

  const triggerBloom = () => {
    btnScale.value = withSequence(
      withTiming(0.94, { duration: 80, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 8, stiffness: 150 })
    );

    r1Scale.value = 0.15;
    r1Opacity.value = 0.52;
    r1Scale.value = withTiming(BLOOM_SCALE, { duration: BLOOM_DURATION, easing: Easing.out(Easing.cubic) });
    r1Opacity.value = withTiming(0, { duration: BLOOM_DURATION, easing: Easing.out(Easing.quad) });

    r2Scale.value = 0.15;
    r2Scale.value = withDelay(180, withTiming(BLOOM_SCALE, { duration: BLOOM_DURATION, easing: Easing.out(Easing.cubic) }));
    r2Opacity.value = withDelay(180, withSequence(
      withTiming(0.4, { duration: 60, easing: Easing.in(Easing.quad) }),
      withTiming(0, { duration: BLOOM_DURATION - 60, easing: Easing.out(Easing.quad) })
    ));

    r3Scale.value = 0.15;
    r3Scale.value = withDelay(360, withTiming(BLOOM_SCALE, { duration: BLOOM_DURATION, easing: Easing.out(Easing.cubic) }));
    r3Opacity.value = withDelay(360, withSequence(
      withTiming(0.28, { duration: 60, easing: Easing.in(Easing.quad) }),
      withTiming(0, { duration: BLOOM_DURATION - 60, easing: Easing.out(Easing.quad) })
    ));
  };

  const handlePress = async () => {
    if (isDone) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    triggerBloom();
    onPress();
  };

  const btnAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const ring1Style = useAnimatedStyle(() => ({ opacity: r1Opacity.value, transform: [{ scale: r1Scale.value }] }));
  const ring2Style = useAnimatedStyle(() => ({ opacity: r2Opacity.value, transform: [{ scale: r2Scale.value }] }));
  const ring3Style = useAnimatedStyle(() => ({ opacity: r3Opacity.value, transform: [{ scale: r3Scale.value }] }));

  return (
    <View style={styles.container}>
      <View style={styles.ringLayer} pointerEvents="none">
        <Animated.View style={[styles.ring, { backgroundColor: '#14B8A6' }, ring1Style]} />
        <Animated.View style={[styles.ring, { backgroundColor: '#2DD4BF' }, ring2Style]} />
        <Animated.View style={[styles.ring, { backgroundColor: '#5EEAD4' }, ring3Style]} />
      </View>

      <Animated.View style={[styles.btnWrapper, btnAnimStyle]}>
        <Pressable
          style={[styles.btn, isDone && styles.btnDone]}
          onPress={handlePress}
          disabled={isDone}
        >
          <Leaf size={18} color={isDone ? '#059669' : '#FFFFFF'} strokeWidth={2} />
          <Text style={[styles.btnText, isDone && styles.btnTextDone]}>
            {isDone ? 'Logged in Vitality Bank ✓' : label}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    justifyContent: 'center',
    overflow: 'visible',
    marginBottom: 4,
  },
  ringLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  btnWrapper: {},
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#14B8A6',
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  btnDone: {
    backgroundColor: '#D1FAE5',
    shadowOpacity: 0.06,
    elevation: 1,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  btnTextDone: {
    color: '#059669',
  },
});
