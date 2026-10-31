import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOut,
  useAnimatedRef,
  useScrollOffset,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';

import { AskPill } from './ask-pill';
import { CoachCard } from './coach-card';
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
import { CARD_COACH, DAYS, type Day, type DayKey } from './days';
import { FloatingStart } from './floating-start';
import { ForYou } from './for-you';
import { LevelCard } from './level-card';
import { PreviewSheet } from './preview-sheet';
import { Sky } from './sky';
import { Tiles } from './tiles';
import { TryDaySheet } from './try-day-sheet';
import { useDay } from './use-day';

export default function TodayScreen() {
  const [dayKey, setDayKey] = useState<DayKey>('normal');
  const [trying, setTrying] = useState(false);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {/* A fresh Today for each day tried. */}
      <TodayDay
        key={dayKey}
        start={DAYS[dayKey]}
        // Development builds can open Today on other days to check them.
        onTryDay={__DEV__ ? () => setTrying(true) : undefined}
      />
      {__DEV__ ? (
        <TryDaySheet
          visible={trying}
          current={dayKey}
          onPick={(key) => {
            setTrying(false);
            setDayKey(key);
          }}
          onClose={() => setTrying(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function TodayDay({ start, onTryDay }: { start: Day; onTryDay?: () => void }) {
  const now = useNow(start.at);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const day = useDay(start, minutes);
  const { next, say } = day;
  const scrollRef = useAnimatedRef();
  const offset = useScrollOffset(scrollRef);
  const workoutRef = useAnimatedRef();
  const starting = useSharedValue(false);
  const workout = day.steps.find((step) => step.id === 'workout');

  return (
    <>
      <Animated.ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Sky
          phase={skyPhase(now)}
          date={formatDay(now)}
          greeting={greeting(now, MOCK_NAME)}
          initial={MOCK_NAME[0]}
          coach={say?.coach ?? (day.card && CARD_COACH[day.card]) ?? next?.coach ?? 'luna'}
          say={say}
          onAvatarLongPress={onTryDay}
        />
        <View style={styles.page}>
          <Animated.View entering={riseIn(0)}>
            <LevelCard
              points={day.points}
              hint={day.levelUp ?? levelHint(day.points, next, day.paused)}
              hot={day.hot}
              gain={day.gain}
            />
          </Animated.View>
          {day.card ? (
            <Animated.View entering={riseIn(1)} exiting={FadeOut.duration(250)}>
              <CoachCard card={day.card} pausedUntil={day.week.pausedUntil} onAct={day.act} />
            </Animated.View>
          ) : null}
          <Animated.View entering={riseIn(1)} layout={MOVE}>
            <DayPath
              sections={daySections(day.steps, minutes)}
              steps={day.steps}
              now={minutes}
              paused={day.paused}
              next={next}
              openId={day.openId}
              justDone={day.justDone}
              expanded={day.expanded}
              workoutRef={workoutRef}
              onOpen={day.open}
              onPreview={day.openPreview}
              onFinish={day.finish}
              onSkip={day.skip}
              onUndo={day.undo}
              onToggleSection={day.toggleSection}
            />
          </Animated.View>
          {day.steps.some((step) => step.doneAt === undefined) ? null : (
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
              protein={proteinToday(day.steps, start.protein)}
              week={thisWeek(now, day.week, workout)}
            />
          </Animated.View>
          <Animated.View entering={riseIn(3)} layout={MOVE}>
            <ForYou reads={forYou(day.steps, day.paused)} />
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
    </>
  );
}

/** Cards rise in one after another when Today first opens. */
function riseIn(order: number) {
  return FadeInDown.duration(450)
    .delay(order * 40)
    .easing(Easing.out(Easing.cubic));
}

/**
 * The time now, updated every minute so the sky and greeting change on time. A day tried
 * at a fixed moment stays there.
 */
function useNow(fixed?: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (fixed) return;
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, [fixed]);
  return fixed ?? now;
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
