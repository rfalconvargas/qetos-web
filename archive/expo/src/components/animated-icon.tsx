import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Sparkles } from 'lucide-react-native';

export function AnimatedIcon() {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleValue]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glow, { transform: [{ scale: scaleValue }] }]}>
        <Sparkles size={32} color="#00B4D8" />
      </Animated.View>
    </View>
  );
}

// Solid fallback export to shield the root layout tree
export default AnimatedIcon;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  glow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2F3EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});