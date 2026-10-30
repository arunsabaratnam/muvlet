import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui';
import { coachColors, colors, fonts } from '@/constants/theme';

import {
  ageOptions,
  BODY_ONLY,
  GYM_KIT,
  heightOptions,
  nearestRow,
  toggle,
  useAnswers,
  weightOptions,
  type Answers,
  type Experience,
  type Goal,
  type Place,
  type WheelOptions,
} from './answers';
import {
  CheckRow,
  DayPicker,
  OptionRows,
  PickerRow,
  Section,
  Segmented,
  Tile,
  TileGrid,
  type Option,
} from './controls';
import {
  BodyIcon,
  BodyweightIcon,
  BothIcon,
  CheckCircleIcon,
  DialIcon,
  DotsIcon,
  DumbbellIcon,
  FlameIcon,
  GymIcon,
  HeartIcon,
  HomeIcon,
  PlusIcon,
  SeedIcon,
  SproutIcon,
  StarIcon,
  TreeIcon,
  type BodyArea,
} from './icons';
import { extrasIn, HOME_KIT, KitFinder, KitWell } from './kit';
import { usePlayCoach } from './onboarding-layout';
import { StepScreen } from './step-screen';
import { GOAL_COACH, goOn, STEPS, type StepId } from './steps';
import { WheelSheet } from './wheel-sheet';

/* The intro and the questions (design spec 4.2). The coach and bubble live in the layout. */

// Continue pulses once Rex has finished typing his hello.
const PULSE_AFTER_MS = 3900;

function tintOf(step: StepId) {
  return coachColors[STEPS[step].coach];
}

function Continue({
  step,
  next,
  disabled,
  onPress,
}: {
  step: StepId;
  /** Where to go instead of the step's usual next. */
  next?: StepId;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Button
      title="Continue"
      color={tintOf(step)}
      disabled={disabled}
      onPress={() => {
        onPress?.();
        goOn(step, next);
      }}
    />
  );
}

export function IntroStep() {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withDelay(
      PULSE_AFTER_MS,
      withRepeat(
        withSequence(withTiming(1.035, { duration: 550 }), withTiming(1, { duration: 550 })),
        -1,
      ),
    );
  }, [pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <StepScreen
      footer={
        <Animated.View entering={riseIn} style={pulseStyle}>
          <Continue step="intro" />
        </Animated.View>
      }
    />
  );
}

function riseIn() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 40 }] },
    animations: {
      opacity: withDelay(800, withTiming(1, { duration: 600 })),
      transform: [{ translateY: withDelay(800, withTiming(0, { duration: 600 })) }],
    },
  };
}

// Moves the coach does when a goal is picked.
const GOAL_MOVES: Record<Goal, string> = {
  'Get stronger': 'flex',
  'Lose some fat': 'jacks',
  'Feel fitter and healthier': 'love',
  'Feel confident at the gym': 'clap',
};

const GOAL_ICONS: Record<Goal, Option<Goal>['icon']> = {
  'Get stronger': (color) => <DumbbellIcon color={color} />,
  'Lose some fat': (color) => <FlameIcon color={color} />,
  'Feel fitter and healthier': (color) => <HeartIcon color={color} />,
  'Feel confident at the gym': (color) => <StarIcon color={color} />,
};

const GOALS = (Object.keys(GOAL_MOVES) as Goal[]).map((goal) => ({
  value: goal,
  icon: GOAL_ICONS[goal],
  tint: coachColors[GOAL_COACH[goal]],
}));

export function GoalStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  return (
    // The first question waits for Rex to reach his corner.
    <StepScreen enterDelay={520} footer={<Continue step="goal" disabled={!answers.goal} />}>
      <OptionRows
        options={GOALS}
        value={answers.goal}
        tint={tintOf('goal')}
        onChange={(goal) => {
          update({ goal });
          play(GOAL_MOVES[goal]);
        }}
      />
    </StepScreen>
  );
}

const EXPERIENCE: Option<Experience>[] = [
  { value: 'Never lifted', icon: (color) => <SeedIcon color={color} /> },
  { value: 'Tried it a few times', icon: (color) => <SproutIcon color={color} /> },
  { value: 'Used to train, not lately', icon: (color) => <TreeIcon color={color} /> },
];

export function ExperienceStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  return (
    <StepScreen footer={<Continue step="experience" disabled={!answers.experience} />}>
      <OptionRows
        options={EXPERIENCE}
        value={answers.experience}
        tint={tintOf('experience')}
        onChange={(experience) => {
          update({ experience });
          play('nod');
        }}
      />
    </StepScreen>
  );
}

const MIN_DAYS = 2;
const MAX_DAYS = 5;

export function DaysStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  const tint = tintOf('days');
  const count = answers.days.length;
  const warning =
    count < MIN_DAYS
      ? `Pick at least ${MIN_DAYS} days`
      : count > MAX_DAYS
        ? `Pick up to ${MAX_DAYS} days`
        : undefined;

  return (
    <StepScreen footer={<Continue step="days" disabled={!!warning} />}>
      <Section hint={warning} warn>
        <DayPicker
          value={answers.days}
          tint={tint}
          onToggle={(day) => {
            update({
              days: answers.days.includes(day)
                ? answers.days.filter((d) => d !== day)
                : [...answers.days, day],
            });
            play('nod');
          }}
        />
      </Section>
      <Section label="Usually train in the">
        <Segmented
          options={['Morning', 'Lunch', 'Evening'] as const}
          value={answers.time}
          tint={tint}
          onChange={(time) => {
            update({ time });
            play('nod');
          }}
        />
      </Section>
    </StepScreen>
  );
}

const PLACES: Option<Place>[] = [
  {
    value: 'Gym',
    label: 'At a gym',
    icon: (color) => <GymIcon color={color} />,
    tint: coachColors.rex,
  },
  {
    value: 'Home',
    label: 'At home',
    icon: (color) => <HomeIcon color={color} />,
    tint: coachColors.sage,
  },
  {
    value: 'Both',
    label: 'A bit of both',
    icon: (color) => <BothIcon color={color} />,
    tint: coachColors.luna,
  },
];

export function PlaceStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  return (
    <StepScreen
      footer={
        <Continue
          step="place"
          disabled={!answers.place}
          next={answers.place === 'Gym' ? 'minutes' : 'kit'}
        />
      }>
      <OptionRows
        options={PLACES}
        value={answers.place}
        tint={tintOf('place')}
        onChange={(place) => {
          // A new place starts the kit afresh; coming back to the same one keeps it.
          if (place !== answers.place) update({ place, equipment: place === 'Gym' ? GYM_KIT : [] });
          play('nod');
        }}
      />
    </StepScreen>
  );
}

export function KitStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  const tint = tintOf('kit');
  const [finderOpen, setFinderOpen] = useState(false);
  const extras = extrasIn(answers.equipment);
  const pick = (item: string) => {
    update({ equipment: toggle(answers.equipment, item, BODY_ONLY) });
    play('nod');
  };

  return (
    <>
      <StepScreen footer={<Continue step="kit" disabled={!answers.equipment.length} />}>
        <CheckRow
          label="Nothing, just my body"
          icon={(color) => <BodyweightIcon color={color} />}
          on={answers.equipment.includes(BODY_ONLY)}
          tint={tint}
          onPress={() => pick(BODY_ONLY)}
        />
        <Section label="Or tick what you've got">
          <TileGrid>
            {HOME_KIT.map((kit) => (
              <Tile
                key={kit.name}
                label={kit.name}
                on={answers.equipment.includes(kit.name)}
                tint={tint}
                icon={<KitWell kit={kit} />}
                onPress={() => pick(kit.name)}
              />
            ))}
            {/* Anything not on the tiles: picked from a longer list, or typed in. */}
            <Tile
              label="More kit"
              role="button"
              dashed
              on={extras.length > 0}
              count={extras.length}
              tint={tint}
              icon={
                <View style={[styles.moreWell, extras.length > 0 && styles.moreWellOn]}>
                  <PlusIcon color={extras.length ? tint.ink : colors.textMuted} />
                </View>
              }
              onPress={() => setFinderOpen(true)}
            />
          </TileGrid>
        </Section>
        {extras.length ? (
          <View style={styles.extras}>
            <Text style={styles.extrasLabel}>Also</Text>
            {extras.map((item) => (
              <Text
                key={item}
                style={[
                  styles.extra,
                  { borderColor: tint.ink, backgroundColor: tint.wash, color: tint.shade },
                ]}>
                {item}
              </Text>
            ))}
          </View>
        ) : null}
      </StepScreen>
      <KitFinder
        visible={finderOpen}
        value={answers.equipment}
        tint={tint}
        onToggle={pick}
        onClose={() => setFinderOpen(false)}
      />
    </>
  );
}

const MINUTES: Option<number>[] = [20, 30, 45, 60].map((minutes) => ({
  value: minutes,
  label: `${minutes} min`,
  icon: (color) => <DialIcon color={color} minutes={minutes} />,
}));

export function MinutesStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  return (
    <StepScreen footer={<Continue step="minutes" />}>
      <OptionRows
        options={MINUTES}
        value={answers.minutes}
        tint={tintOf('minutes')}
        onChange={(minutes) => {
          update({ minutes });
          play('nod');
        }}
      />
    </StepScreen>
  );
}

// The three numbers on About you, each picked on a wheel in a sheet.
const PICKERS = {
  height: {
    label: 'Height',
    title: 'Your height',
    field: 'heightCm',
    options: (answers: Answers) => heightOptions(answers.heightUnits),
  },
  weight: {
    label: 'Weight',
    title: 'Your weight',
    field: 'weightKg',
    options: (answers: Answers) => weightOptions(answers.weightUnits),
  },
  age: { label: 'Age', title: 'Your age', field: 'age', options: () => ageOptions() },
} satisfies Record<
  string,
  {
    label: string;
    title: string;
    field: keyof Answers;
    options: (answers: Answers) => WheelOptions;
  }
>;
type Picker = keyof typeof PICKERS;

export function AboutStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  const tint = tintOf('about');
  // The sheet keeps its last picker while it fades out.
  const [sheet, setSheet] = useState<{ picker: Picker; open: boolean }>({
    picker: 'height',
    open: false,
  });

  const rowOf = (picker: Picker) => {
    const { field, options } = PICKERS[picker];
    const { labels, values } = options(answers);
    return { labels, values, index: nearestRow(values, answers[field]) };
  };
  const shown = PICKERS[sheet.picker];
  const wheel = rowOf(sheet.picker);

  return (
    <>
      <StepScreen
        footer={
          // Continuing (not skipping) puts the food targets back on the plan.
          <Continue
            step="about"
            disabled={!answers.sex}
            onPress={() => update({ skippedAbout: false })}
          />
        }>
        <Section label="Calculate calories as">
          <Segmented
            options={['Male', 'Female'] as const}
            value={answers.sex}
            tint={tint}
            onChange={(sex) => {
              update({ sex });
              play('nod');
            }}
          />
        </Section>
        {(Object.keys(PICKERS) as Picker[]).map((picker) => {
          const { labels, index } = rowOf(picker);
          return (
            <PickerRow
              key={picker}
              label={PICKERS[picker].label}
              value={labels[index]}
              tint={tint}
              active={sheet.open && sheet.picker === picker}
              onPress={() => setSheet({ picker, open: true })}
            />
          );
        })}
      </StepScreen>
      <WheelSheet
        visible={sheet.open}
        title={shown.title}
        label={shown.label}
        options={wheel.labels}
        index={wheel.index}
        tint={tint}
        header={<SheetUnits picker={sheet.picker} />}
        onChange={(index) => {
          update({ [shown.field]: wheel.values[index] });
          play('nod');
        }}
        onClose={() => setSheet({ ...sheet, open: false })}
      />
    </>
  );
}

/** The units switch in a sheet: feet or cm for height, lb or kg for weight, none for age. */
function SheetUnits({ picker }: { picker: Picker }) {
  const { answers, update } = useAnswers();
  const tint = tintOf('about');
  if (picker === 'age') return null;
  return (
    <View style={styles.sheetUnits}>
      {picker === 'height' ? (
        <Segmented
          options={['ft', 'cm'] as const}
          value={answers.heightUnits}
          tint={tint}
          onChange={(heightUnits) => update({ heightUnits })}
        />
      ) : (
        <Segmented
          options={['lb', 'kg'] as const}
          value={answers.weightUnits}
          tint={tint}
          onChange={(weightUnits) => update({ weightUnits })}
        />
      )}
    </View>
  );
}

const BODY_AREAS: BodyArea[] = [
  'Knees',
  'Lower back',
  'Shoulders',
  'Wrists',
  'Neck',
  'Hips',
  'Elbows',
  'Ankles',
];

export function LimitsStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  const tint = tintOf('limits');
  const pick = (item: string) => {
    update({ limits: toggle(answers.limits, item, 'Nothing') });
    play('nod');
  };

  // Most people have nothing to flag, so that's one tap; the grid fills the rest.
  return (
    <StepScreen footer={<Continue step="limits" disabled={!answers.limits.length} />}>
      <CheckRow
        label="I'm all good, nothing hurts"
        icon={(color) => <CheckCircleIcon color={color} />}
        on={answers.limits.includes('Nothing')}
        tint={tint}
        onPress={() => pick('Nothing')}
      />
      <Section label="Or pick what to go easy on">
        <TileGrid>
          {BODY_AREAS.map((area) => {
            const on = answers.limits.includes(area);
            return (
              <Tile
                key={area}
                label={area}
                on={on}
                tint={tint}
                icon={
                  <BodyIcon
                    area={area}
                    color={tint.ink}
                    body={on ? colors.surface : colors.border}
                  />
                }
                onPress={() => pick(area)}
              />
            );
          })}
          <Tile
            label="Something else"
            on={answers.limits.includes('Something else')}
            tint={tint}
            icon={<DotsIcon color={tint.ink} />}
            onPress={() => pick('Something else')}
          />
        </TileGrid>
      </Section>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  sheetUnits: {
    width: 132,
  },
  moreWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  moreWellOn: {
    backgroundColor: colors.surface,
  },
  extras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  extrasLabel: {
    marginLeft: 4,
    marginRight: 2,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  extra: {
    overflow: 'hidden',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
  },
});
