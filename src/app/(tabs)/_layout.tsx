import { Tabs } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { colors, fonts, tabColors } from '@/constants/theme';

// Line icons from the mockup, drawn on a 24 × 24 grid.
const ICONS = {
  today: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  workouts: 'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12',
  food: 'M7 3v8a2 2 0 0 0 2 2v8M11 3v8M9 3v8M17 21V3c-2 1-3 4-3 8h3',
  progress: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
};

type LineIconProps = { size: number; color: ColorValue; children: ReactNode };

function LineIcon({ size, color, children }: LineIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </G>
    </Svg>
  );
}

function tabIcon(path: string) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return (
      <LineIcon size={24} color={color}>
        <Path d={path} />
      </LineIcon>
    );
  };
}

// Form check is the main feature, so it's a raised camera button in the middle.
function FormCheckIcon() {
  return (
    <View style={styles.formCheck}>
      <LineIcon size={26} color={colors.onPrimary}>
        <Path d="M4 8h3l2-3h6l2 3h3v11H4z" />
        <Circle cx={12} cy={13} r={3.5} />
      </LineIcon>
    </View>
  );
}

// The bar is this tall above the home indicator.
const BAR_HEIGHT = 66;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        // The open tab sits in a soft pill of its colour.
        tabBarActiveBackgroundColor: tabColors.active,
        tabBarItemStyle: styles.item,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [
          styles.bar,
          { height: BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom + 6 },
        ],
      }}>
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: tabIcon(ICONS.today) }} />
      <Tabs.Screen
        name="workouts"
        options={{ title: 'Workouts', tabBarIcon: tabIcon(ICONS.workouts) }}
      />
      <Tabs.Screen
        name="form-check"
        options={{
          title: 'Form check',
          tabBarIcon: FormCheckIcon,
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: 'Form check',
          tabBarActiveBackgroundColor: 'transparent',
          // Not clipped, so the button can rise above the bar.
          tabBarItemStyle: styles.formCheckItem,
        }}
      />
      <Tabs.Screen name="food" options={{ title: 'Food', tabBarIcon: tabIcon(ICONS.food) }} />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: tabIcon(ICONS.progress) }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  // Clipped round, so the open tab's tint is a pill.
  item: {
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  formCheckItem: {
    marginHorizontal: 8,
  },
  label: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 11,
  },
  formCheck: {
    width: 54,
    height: 54,
    borderRadius: 18,
    marginTop: -18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tabColors.formCheck,
    boxShadow: '0 6px 16px rgba(255, 146, 84, 0.4)',
  },
});
