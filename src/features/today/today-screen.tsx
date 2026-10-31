import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';

import { CoachFace } from './coach-face';
import { daySections, formatDay, greeting, levelHint, MOCK_NAME, skyPhase } from './day';
import { DayPath } from './day-path';
import { LevelCard } from './level-card';
import { Sky } from './sky';
import { useDay } from './use-day';

export default function TodayScreen() {
  const now = useNow();
  const day = useDay();
  const { next, say } = day;
  const minutes = now.getHours() * 60 + now.getMinutes();

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Sky
          phase={skyPhase(now)}
          date={formatDay(now)}
          greeting={greeting(now, MOCK_NAME)}
          initial={MOCK_NAME[0]}
          coach={say?.coach ?? next?.coach ?? 'luna'}
          say={say}
        />
        <View style={styles.page}>
          <Animated.View entering={riseIn(0)}>
            <LevelCard
              points={day.points}
              hint={day.levelUp ?? levelHint(day.points, next)}
              hot={day.hot}
              gain={day.gain}
            />
          </Animated.View>
          <Animated.View entering={riseIn(1)}>
            <DayPath
              sections={daySections(day.steps, minutes)}
              steps={day.steps}
              next={next}
              openId={day.openId}
              justDone={day.justDone}
              expanded={day.expanded}
              onOpen={day.open}
              onFinish={day.finish}
              onUndo={day.undo}
              onToggleSection={day.toggleSection}
            />
          </Animated.View>
          {next ? null : (
            <Animated.View entering={riseIn(0)} style={styles.allDone}>
              <CoachFace coach="luna" size={40} />
              <Text style={styles.allDoneText}>
                {minutes >= 20 * 60
                  ? `That's everything for today. Sleep well, ${MOCK_NAME}.`
                  : `All done for today. Nice work, ${MOCK_NAME}.`}
              </Text>
            </Animated.View>
          )}
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
    gap: 20,
    paddingHorizontal: 20,
  },
  allDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allDoneText: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textMuted,
  },
});
