import type { CoachName } from '@/features/welcome/coach';

/*
 * Today's plan and the maths behind the top of the screen. There's no saved data yet,
 * so the day is mock data, the same as the mockup's normal day. Other days are in days.ts.
 */

export type StepId = 'breakfast' | 'workout' | 'walk' | 'dinner' | 'stretch';

export type Step = {
  id: StepId;
  coach: CoachName;
  /** Minutes after midnight. */
  plannedAt: number;
  points: number;
  title: string;
  doneTitle: string;
  /** Under the title once the step is open. */
  detail: string;
  /** The step's button. */
  action: string;
  /** What the coach says in the sky while it's the next step. */
  tip: string;
  /** Its name on a section's done chip, e.g. "Breakfast · 28 g protein". */
  name: string;
  result: string;
  /** Under the title once done. */
  doneDetail: string;
  /** Grams of protein in a meal, counted once it's logged. */
  protein?: number;
  /** Minutes after midnight when a meal not logged yet becomes "log it later". */
  lapsesAt?: number;
  /** Minutes after midnight; undefined until done or skipped. */
  doneAt?: number;
  /** Let go for today, with no points. */
  skipped?: boolean;
  /** A lighter workout, to ease back in after time away. */
  lite?: boolean;
};

export const MOCK_NAME = 'Arun';
export const MOCK_POINTS = 1380;

export const MOCK_STEPS: Step[] = [
  {
    id: 'breakfast',
    coach: 'sage',
    plannedAt: 8 * 60,
    points: 10,
    title: 'Log breakfast',
    doneTitle: 'Breakfast logged',
    detail: 'Snap a photo to log it',
    action: 'Snap breakfast',
    tip: 'Start with breakfast. Protein keeps you full.',
    name: 'Breakfast',
    result: '28 g protein',
    doneDetail: 'Oats and berries · 28 g protein',
    protein: 28,
    lapsesAt: 11 * 60,
    doneAt: 8 * 60 + 10,
  },
  {
    id: 'workout',
    coach: 'rex',
    plannedAt: 18 * 60,
    points: 200,
    title: 'Push Day A',
    doneTitle: 'Push Day A done',
    detail: '5 exercises · 45 min',
    action: 'Start workout',
    tip: "Ready when you are. I'll time your rests.",
    name: 'Workout',
    result: '45 min',
    doneDetail: '5 exercises · 45 min',
  },
  {
    id: 'dinner',
    coach: 'sage',
    plannedAt: 19 * 60 + 30,
    points: 10,
    title: 'Snap your dinner',
    doneTitle: 'Dinner logged',
    detail: 'Training later? Keep it on the lighter side',
    action: 'Snap a photo',
    tip: 'Training later? Keep dinner light.',
    name: 'Dinner',
    result: '38 g protein',
    doneDetail: 'Dinner · 38 g protein',
    protein: 38,
    lapsesAt: 22 * 60 + 30,
  },
  {
    id: 'stretch',
    coach: 'luna',
    plannedAt: 22 * 60,
    points: 20,
    title: 'Wind-down stretch',
    doneTitle: 'Stretch done',
    detail: '10 min · 5 easy moves for chest, shoulders and hips',
    action: 'Begin stretch',
    tip: 'Ten easy minutes helps you sleep.',
    name: 'Stretch',
    result: '10 min',
    doneDetail: '10 min · 5 moves',
  },
];

/** On a rest day, instead of the workout. */
export const WALK: Step = {
  id: 'walk',
  coach: 'luna',
  plannedAt: 11 * 60,
  points: 10,
  title: 'Easy walk · optional',
  doneTitle: 'Walk done',
  detail: '20 min · any pace',
  action: 'Start walk',
  tip: 'A gentle walk helps sore legs.',
  name: 'Walk',
  result: '20 min',
  doneDetail: '20 min · any pace',
};

/** Push Day A, as its big card shows it. */
export function workoutOf(step: Step) {
  return {
    minutes: step.lite ? 35 : 45,
    focus: 'Chest, shoulders and triceps',
    progress: step.lite ? 'Bench 30 lb · lighter to start' : 'Bench 35 lb · up from 30 lb',
  };
}

export type Preview = {
  /** Above the title, e.g. "Workout · 45 min". */
  kind: string;
  focus: string;
  chips: string[];
  /** A green chip for what went up since last time. */
  up?: string;
  items: { name: string; detail: string; up?: string }[];
  /** What you'll need. */
  need: string;
};

/** What's inside a step, for the sheet that previews it before you start. */
export function previewOf(step: Step): Preview | undefined {
  const preview = PREVIEWS[step.id];
  if (!preview || !step.lite) return preview;
  // Lighter: 35 minutes, and the bench back at last time's weight.
  return {
    ...preview,
    kind: 'Workout · 35 min',
    chips: ['35 min', '5 exercises', `+${step.points} pts`],
    up: undefined,
    items: preview.items.map(({ name, detail }, index) => ({
      name,
      detail: index === 0 ? '3 × 8 · 30 lb' : detail,
    })),
  };
}

const PREVIEWS: Partial<Record<StepId, Preview>> = {
  workout: {
    kind: 'Workout · 45 min',
    focus: 'Chest, shoulders and triceps',
    chips: ['45 min', '5 exercises', '+200 pts'],
    up: 'Bench up 5 lb',
    items: [
      { name: 'Dumbbell bench press', detail: '3 × 8 · 35 lb', up: '5 lb' },
      { name: 'Seated shoulder press', detail: '3 × 10 · 20 lb' },
      { name: 'Incline push-up', detail: '3 × 12' },
      { name: 'Lateral raise', detail: '3 × 12 · 10 lb', up: '2.5 lb' },
      { name: 'Triceps rope pushdown', detail: '3 × 12 · 30 lb' },
    ],
    need: "You'll need dumbbells, a bench and a cable machine.",
  },
  stretch: {
    kind: 'Stretch · 10 min',
    focus: 'Chest, shoulders and hips',
    chips: ['10 min', '5 moves', '+20 pts'],
    items: [
      { name: 'Doorway chest stretch', detail: '45 s' },
      { name: 'Cross-body shoulder', detail: '30 s a side' },
      { name: "Child's pose", detail: '60 s' },
      { name: 'Figure-four hip', detail: '45 s a side' },
      { name: 'Lying twist', detail: '30 s a side' },
    ],
    need: 'No equipment. The floor or your bed is fine.',
  },
};

const PROTEIN_GOAL = 150;

/**
 * Protein eaten today and the share of the goal, for the ring on Today. `elsewhere` is what
 * was eaten outside the steps, like lunch and snacks.
 */
export function proteinToday(steps: Step[], elsewhere: number) {
  const eaten = steps.reduce(
    (sum, step) => sum + (step.doneAt === undefined || step.skipped ? 0 : (step.protein ?? 0)),
    elsewhere,
  );
  return { left: Math.max(0, PROTEIN_GOAL - eaten), share: Math.min(1, eaten / PROTEIN_GOAL) };
}

const WEEKDAYS = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ');
const MONTHS = 'Jan Feb March April May June July Aug Sept Oct Nov Dec'.split(' ');
const DAY_LETTERS = 'M T W T F S S'.split(' ');

export type Week = {
  /** Days with a workout, 0 for Monday. Left out, it's today and two more spread over the week. */
  plan?: number[];
  /** Weeks in a row on plan before this one. */
  streak: number;
  /** Planned days earlier this week that didn't happen. */
  missed?: number[];
  /** Back after time away, so the streak starts again. */
  fresh?: boolean;
  /** The plan is paused until then, and the streak is held. */
  pausedUntil?: Date;
};

export type WeekDay = {
  letter: string;
  today: boolean;
  state: 'done' | 'planned' | 'missed' | 'rest';
};

/**
 * This week, Monday first, for the streak on Today. Planned days before today were done
 * unless they were missed, and today's dot follows today's workout.
 */
export function thisWeek(now: Date, week: Week, workout?: Step) {
  const today = (now.getDay() + 6) % 7;
  const plan = week.plan ?? [0, 2, 4].map((day) => (today + day) % 7);
  const days: WeekDay[] = DAY_LETTERS.map((letter, index) => {
    let state: WeekDay['state'] = 'rest';
    if (index === today && workout) state = workout.doneAt === undefined ? 'planned' : 'done';
    else if (!plan.includes(index)) state = 'rest';
    else if (index > today || (index === today && week.pausedUntil)) state = 'planned';
    else if (index < today) state = week.missed?.includes(index) ? 'missed' : 'done';
    return { letter, today: index === today, state };
  });

  const done = days.filter((day) => day.state === 'done').length;
  const goal = plan.length;
  if (week.pausedUntil) {
    const until = week.pausedUntil;
    const short = `${WEEKDAYS[until.getDay()].slice(0, 3)}, ${MONTHS[until.getMonth()]} ${until.getDate()}`;
    return { days, held: true, title: 'Streak on hold', detail: `Paused until ${short}` };
  }
  const finished = done >= goal;
  return {
    days,
    held: false,
    title: week.fresh
      ? 'New streak · week 1'
      : `${finished ? week.streak + 1 : week.streak}-week streak`,
    detail: finished
      ? `${done} of ${goal} workouts. Week done!`
      : `${done} of ${goal} workouts this week`,
  };
}

export type Read = { coach: CoachName; kind: string; title: string };

const READS = {
  bench: {
    coach: 'axel',
    kind: 'Before your workout · 1 min',
    title: 'Set up the bench the right way',
  },
  sore: {
    coach: 'luna',
    kind: 'After training · 2 min read',
    title: 'Why sore muscles are normal',
  },
  dinner: {
    coach: 'sage',
    kind: 'For tonight · 15 min',
    title: 'High-protein dinners in 15 minutes',
  },
  breakfast: {
    coach: 'sage',
    kind: 'For tomorrow · 5 min',
    title: '3 quick high-protein breakfasts',
  },
  rest: {
    coach: 'luna',
    kind: 'Rest day · 2 min read',
    title: 'What rest days do for your muscles',
  },
  away: {
    coach: 'luna',
    kind: 'On your break · 5 min',
    title: 'An easy stretch you can do anywhere',
  },
} satisfies Record<string, Read>;

/** Two short reads from the coaches, about what's left of today. */
export function forYou(steps: Step[], paused = false): Read[] {
  const has = (id: StepId) => steps.some((step) => step.id === id);
  const done = (id: StepId) => steps.some((step) => step.id === id && step.doneAt !== undefined);
  const first = done('workout')
    ? READS.sore
    : paused
      ? READS.away
      : has('walk')
        ? READS.rest
        : READS.bench;
  return [first, done('dinner') ? READS.breakfast : READS.dinner];
}

/** Once the workout is done, dinner is about recovery. */
export function stepText(step: Step, steps: Step[]) {
  const trained = steps.some((s) => s.id === 'workout' && s.doneAt !== undefined);
  if (step.id === 'dinner' && trained) {
    return {
      detail: 'Aim for 40 g protein after training',
      tip: "Snap it and I'll count the protein.",
    };
  }
  return { detail: step.detail, tip: step.tip };
}

/** What each coach says when you finish one of their steps. */
export const DONE_LINES: Record<CoachName, string> = {
  rex: "That's the big one done today.",
  axel: 'Good form today.',
  sage: "Got it. I'll count the protein.",
  luna: 'Nice and loose. Sleep well.',
};

/** A meal whose time has passed, so it shows as a quiet "log it later" line. */
export function isLapsed(step: Step, now: number) {
  return step.doneAt === undefined && step.lapsesAt !== undefined && now >= step.lapsesAt;
}

/** A quiet line instead of a card: a lapsed meal, or any meal while the plan is paused. */
export function isQuiet(step: Step, now: number, paused = false) {
  return isLapsed(step, now) || (paused && step.doneAt === undefined && step.protein !== undefined);
}

/** Late at night, the stretch can be let go. */
export function canLetGo(step: Step, now: number) {
  return step.id === 'stretch' && now >= 22 * 60 + 30;
}

/** A done or skipped step's title and the line under it. */
export function doneText(step: Step) {
  return step.skipped
    ? { title: `${step.name} · skipped`, detail: 'No points lost' }
    : { title: step.doneTitle, detail: step.doneDetail };
}

/** The first step still to do that isn't a quiet line. */
export function nextStep(steps: Step[], now = 0, paused = false) {
  return steps.find((step) => step.doneAt === undefined && !isQuiet(step, now, paused));
}

const SECTION_TITLES = ['Morning', 'Afternoon', 'Evening', 'Before bed'];

function sectionOf(minutes: number) {
  if (minutes >= 21 * 60) return 3;
  if (minutes >= 17 * 60) return 2;
  if (minutes >= 12 * 60) return 1;
  return 0;
}

export type Section = {
  title: string;
  /** Earlier in the day than now. */
  past: boolean;
  steps: Step[];
};

/**
 * The day in sections. A done step sits where it was done; a step still to do sits at its
 * planned time, or now if that has passed. Nothing is ever late: a meal whose time has
 * passed stays where it was planned, as a quiet line.
 */
export function daySections(steps: Step[], now: number): Section[] {
  const at = (step: Step) =>
    step.doneAt ?? (isLapsed(step, now) ? step.plannedAt : Math.max(step.plannedAt, now));
  const sorted = [...steps].sort((a, b) => at(a) - at(b) || a.plannedAt - b.plannedAt);
  return SECTION_TITLES.map((title, index) => ({
    title,
    past: index < sectionOf(now),
    steps: sorted.filter((step) => sectionOf(at(step)) === index),
  })).filter((section) => section.steps.length > 0);
}

/** The label on a section's done chip. */
export function doneLabel(done: Step[]) {
  if (done.length === 1) {
    return `${done[0].name} · ${done[0].skipped ? 'skipped' : done[0].result}`;
  }
  if (done.length === 2) return `${done[0].name} and ${done[1].name.toLowerCase()}`;
  return `${done.length} done`;
}

export type SkyPhase = 'morning' | 'day' | 'sunset' | 'night';

/** Night runs from 7:30 PM until 5 AM. */
export function skyPhase(now: Date): SkyPhase {
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < 5) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 17) return 'day';
  if (hour < 19.5) return 'sunset';
  return 'night';
}

export function greeting(now: Date, name: string) {
  const hour = now.getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${part}, ${name}`;
}

/** "Monday, Sept 28", without relying on the device's locale. */
export function formatDay(now: Date) {
  return `${WEEKDAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
}

const LEVELS = [
  { from: 0, name: 'Newcomer' },
  { from: 500, name: 'First Steps' },
  { from: 900, name: 'Learner' },
  { from: 1200, name: 'Gym Rookie' },
  { from: 1500, name: 'Gym Regular' },
  { from: 2000, name: 'Steady Lifter' },
  { from: 2600, name: 'Confident Lifter' },
];

export type Level = {
  number: number;
  name: string;
  from: number;
  /** Points for the next level; undefined at the top level. */
  to?: number;
};

export function levelFor(points: number): Level {
  const index = LEVELS.filter((level) => points >= level.from).length - 1;
  return { number: index + 1, ...LEVELS[index], to: LEVELS[index + 1]?.from };
}
