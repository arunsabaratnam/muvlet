import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View, type ColorValue } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(icon: IconName, focusedIcon: IconName) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? focusedIcon : icon} size={24} color={color} />;
  };
}

function FormCheckIcon() {
  return (
    <View style={styles.formCheckIcon}>
      <Ionicons name="scan" size={24} color={colors.onPrimary} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Today', tabBarIcon: tabIcon('today-outline', 'today') }}
      />
      <Tabs.Screen
        name="workouts"
        options={{ title: 'Workouts', tabBarIcon: tabIcon('barbell-outline', 'barbell') }}
      />
      <Tabs.Screen name="form-check" options={{ title: 'Form check', tabBarIcon: FormCheckIcon }} />
      <Tabs.Screen
        name="food"
        options={{ title: 'Food', tabBarIcon: tabIcon('restaurant-outline', 'restaurant') }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: tabIcon('stats-chart-outline', 'stats-chart') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // The centre tab is raised slightly so the main feature stands out.
  formCheckIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: -14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
  },
});
