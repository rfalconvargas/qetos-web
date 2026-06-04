import { Tabs } from 'expo-router';
import { BookOpen, Camera, List, Menu, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const COBALT = '#1565C0';
const INACTIVE = '#94A3B8';
const WHITE = '#FFFFFF';
const MINT_BORDER = '#C8EDE1';

function handleScanAction(action: string) {
  Alert.alert(action, 'This intake flow is ready to connect to the processing pipeline.');
}

function openScanActions() {
  const options = [
    'Scan Health Document / Protocol',
    'Upload Medical PDF',
    'Manual Biometric Entry',
  ];

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', ...options],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex > 0) {
          handleScanAction(options[buttonIndex - 1]);
        }
      }
    );
    return;
  }

  Alert.alert('Add Health Data', 'Choose an intake method.', [
    ...options.map((option) => ({
      text: option,
      onPress: () => handleScanAction(option),
    })),
    { text: 'Cancel', style: 'cancel' },
  ]);
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COBALT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopColor: MINT_BORDER,
          borderTopWidth: 1,
          elevation: 12,
          shadowColor: '#0D47A1',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.25,
        },
      }}
    >
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <BookOpen size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Scan',
          tabBarButton: (props) => (
            <Pressable
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityLabel={props.accessibilityLabel}
              testID={props.testID}
              style={[props.style, styles.fabItem]}
              onPress={openScanActions}
            >
              <View style={styles.fabButton}>
                <Camera size={24} color={WHITE} strokeWidth={2.4} />
              </View>
              <Text style={styles.fabLabel}>Scan</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, focused }) => (
            <List size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Menu size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    transform: [{ translateY: 0 }],
  },
  fabButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COBALT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COBALT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  fabLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: COBALT,
    letterSpacing: 0.25,
  },
});
