import { useIsFocused, useLocalSearchParams } from 'expo-router';

import TodayScreen from '@/features/today/today-screen';

export default function Today() {
  // Onboarding opens Today with `first=1`, for a new member's first day.
  const { first } = useLocalSearchParams<{ first?: string }>();
  return <TodayScreen focused={useIsFocused()} first={first === '1'} />;
}
