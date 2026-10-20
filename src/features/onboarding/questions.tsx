import { useEffect } from 'react';
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
import { coachColors } from '@/constants/theme';

import {
  formatHeight,
  formatWeight,
  KG_PER_LB,
  KITS,
  stepBy,
  toggle,
  useAnswers,
  type Experience,
  type Goal,
} from './answers';
import { Chips, DayPicker, OptionRows, Section, Segmented, Stepper, type Option } from './controls';
import {
  DumbbellIcon,
  FlameIcon,
  HeartIcon,
  SeedIcon,
  SproutIcon,
  StarIcon,
  TreeIcon,
} from './icons';
import { usePlayCoach } from './onboarding-layout';
import { StepScreen } from './step-screen';
import { GOAL_COACH, goOn, STEPS, type StepId } from './steps';

/* The intro and the six questions (design spec 4.2). The coach and bubble live in the layout. */

// Continue pulses once Rex has finished typing his hello.
const PULSE_AFTER_MS = 3900;

function tintOf(step: StepId) {
  return coachColors[STEPS[step].coach];
}

function Continue({
  step,
  disabled,
  onPress,
}: {
  step: StepId;
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
        goOn(step);
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

const EQUIPMENT = [
  'Dumbbells',
  'Barbell',
  'Bench',
  'Machines',
  'Cables',
  'Kettlebells',
  'Bands',
  'Just my body',
];

export function PlaceStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  const tint = tintOf('place');

  return (
    <StepScreen footer={<Continue step="place" disabled={!answers.equipment.length} />}>
      <Section>
        <Segmented
          options={['Gym', 'Home', 'Both'] as const}
          value={answers.place}
          tint={tint}
          onChange={(place) => {
            update({ place, equipment: KITS[place] });
            play('nod');
          }}
        />
      </Section>
      <Section label="What do you have?">
        <Chips
          options={EQUIPMENT}
          value={answers.equipment}
          tint={tint}
          onToggle={(item) => {
            update({ equipment: toggle(answers.equipment, item, 'Just my body') });
            play('nod');
          }}
        />
      </Section>
      <Section label="Time per session">
        <Segmented
          options={[20, 30, 45, 60]}
          value={answers.minutes}
          tint={tint}
          suffix=" min"
          onChange={(minutes) => {
            update({ minutes });
            play('nod');
          }}
        />
      </Section>
    </StepScreen>
  );
}

export function AboutStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  const tint = tintOf('about');
  const { units } = answers;

  return (
    <StepScreen
      footer={
        // Continuing (not skipping) puts the food targets back on the plan.
        <Continue
          step="about"
          disabled={!answers.sex}
          onPress={() => update({ skippedAbout: false })}
        />
      }>
      <Section>
        <Segmented
          options={['lb', 'kg'] as const}
          value={units}
          tint={tint}
          onChange={(next) => update({ units: next })}
        />
      </Section>
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
      <Stepper
        label="Height"
        value={formatHeight(answers.heightCm, units)}
        tint={tint}
        // An inch at a time with lb, a centimetre with kg.
        onStep={(by) =>
          update({ heightCm: stepBy(answers.heightCm, by * (units === 'lb' ? 2.54 : 1), 130, 220) })
        }
      />
      <Stepper
        label="Weight"
        value={formatWeight(answers.weightKg, units)}
        tint={tint}
        onStep={(by) =>
          update({
            weightKg: stepBy(
              answers.weightKg,
              by * (units === 'lb' ? KG_PER_LB : 1),
              80 * KG_PER_LB,
              400 * KG_PER_LB,
            ),
          })
        }
      />
      <Stepper
        label="Age"
        value={String(answers.age)}
        tint={tint}
        onStep={(by) => update({ age: stepBy(answers.age, by, 13, 90) })}
      />
    </StepScreen>
  );
}

const LIMITS = ['Nothing', 'Knees', 'Lower back', 'Shoulders', 'Wrists', 'Neck', 'Hips'];

export function LimitsStep() {
  const { answers, update } = useAnswers();
  const play = usePlayCoach();
  return (
    <StepScreen footer={<Continue step="limits" />}>
      <Chips
        options={LIMITS}
        value={answers.limits}
        tint={tintOf('limits')}
        onToggle={(item) => {
          update({ limits: toggle(answers.limits, item, 'Nothing') });
          play('nod');
        }}
      />
    </StepScreen>
  );
}
