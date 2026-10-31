import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

import {
  formatDay,
  greeting,
  levelHint,
  MOCK_NAME,
  MOCK_POINTS,
  MOCK_STEPS,
  nextStep,
  skyPhase,
} from './day';
import { LevelCard } from './level-card';
import { Sky } from './sky';

export default function TodayScreen() {
  const now = useNow();
  const next = nextStep(MOCK_STEPS);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Sky
          phase={skyPhase(now)}
          date={formatDay(now)}
          greeting={greeting(now, MOCK_NAME)}
          initial={MOCK_NAME[0]}
          coach={next?.coach ?? 'luna'}
        />
        <View style={styles.page}>
          <Animated.View entering={riseIn(0)}>
            <LevelCard points={MOCK_POINTS} hint={levelHint(MOCK_POINTS, next)} />
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Cards rise in one after another when Today first opens. */
function riseIn(order: number) {
  return FadeInDown.duration(450)
    .delay(order * 40)
    .easing(Easing.out(Easing.cubic));
}

/** The time now, updated every minute so the sky and greeting change on time. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  page: {
    paddingHorizontal: 20,
  },
});
