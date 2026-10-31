import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedRef,
  useScrollOffset,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';

import { AskPill } from './ask-pill';
import { CoachFace } from './coach-face';
import {
  daySections,
  forYou,
  formatDay,
  greeting,
  levelHint,
  MOCK_NAME,
  proteinToday,
  skyPhase,
  thisWeek,
} from './day';
import { DayPath, MOVE } from './day-path';
import { FloatingStart } from './floating-start';
import { ForYou } from './for-you';
import { LevelCard } from './level-card';
import { PreviewSheet } from './preview-sheet';
import { Sky } from './sky';
import { Tiles } from './tiles';
import { useDay } from './use-day';

export default function TodayScreen() {
  const now = useNow();
  const day = useDay();
  const { next, say } = day;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const scrollRef = useAnimatedRef();
  const offset = useScrollOffset(scrollRef);
  const workoutRef = useAnimatedRef();
  const starting = useSharedValue(false);
  const workout = day.steps.find((step) => step.id === 'workout');

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <Animated.ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
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
              workoutRef={workoutRef}
              onOpen={day.open}
              onPreview={day.openPreview}
              onFinish={day.finish}
              onUndo={day.undo}
              onToggleSection={day.toggleSection}
            />
          </Animated.View>
          {next ? null : (
            <Animated.View entering={riseIn(0)} layout={MOVE} style={styles.allDone}>
              <CoachFace coach="luna" size={40} />
              <Text style={styles.allDoneText}>
                {minutes >= 20 * 60
                  ? `That's everything for today. Sleep well, ${MOCK_NAME}.`
                  : `All done for today. Nice work, ${MOCK_NAME}.`}
              </Text>
            </Animated.View>
          )}
          {/* These slide along as the day above changes size. */}
          <Animated.View entering={riseIn(2)} layout={MOVE}>
            <Tiles
              protein={proteinToday(day.steps)}
              week={thisWeek(now, workout?.doneAt !== undefined)}
            />
          </Animated.View>
          <Animated.View entering={riseIn(3)} layout={MOVE}>
            <ForYou reads={forYou(day.steps)} />
          </Animated.View>
        </View>
      </Animated.ScrollView>
      {workout ? (
        <FloatingStart
          workout={workout}
          // While its big card is on Today, and no sheet is over it.
          live={
            workout.doneAt === undefined && (day.openId ?? next?.id) === workout.id && !day.preview
          }
          scrollRef={scrollRef}
          offset={offset}
          cardRef={workoutRef}
          showing={starting}
          onStart={day.finish}
        />
      ) : null}
      <AskPill offset={offset} crowded={starting} />
      <PreviewSheet step={day.preview} onStart={day.startPreview} onClose={day.closePreview} />
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
  // Room at the bottom for the floating Start.
  content: {
    paddingBottom: 80,
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
