import React from 'react';
import { View } from 'react-native';

// 1. Named export support
export function WebBadge() {
  return <View />;
}

// 2. Default export fallback support to satisfy _layout.tsx
export default WebBadge;