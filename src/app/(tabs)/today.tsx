import { useIsFocused } from 'expo-router';

import TodayScreen from '@/features/today/today-screen';

export default function Today() {
  return <TodayScreen focused={useIsFocused()} />;
}
