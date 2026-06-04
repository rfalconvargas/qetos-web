import 'react-native-get-random-values';
import 'polyfill-crypto.getrandomvalues';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* Forcing light content style to create beautiful contrast against Maricarmen's Jade gradients */}
      <StatusBar style="light" />
      
      <Stack
        screenOptions={{
          headerShown: false,
          // 10X Hotfix: Turning off the default screen slide animation completely prevents
          // Reanimated lifecycle conflicts ('Cannot set property undefined of undefined')
          animation: 'none',
          contentStyle: { backgroundColor: '#115E59' }, // Locked to matching deep Jade base canvas
        }}
      >
        {/* Force clean layout evaluation straight to your active conversational tab stack */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animation: 'none'
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}