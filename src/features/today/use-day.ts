import { useEffect, useRef, useState } from 'react';

import type { CoachName } from '@/features/welcome/coach';

import {
  DONE_LINES,
  levelFor,
  MOCK_STEPS,
  nextStep,
  stepText,
  type Step,
  type StepId,
} from './day';
import type { Day } from './days';

// Timings from the mockup.
const FIRST_SAY_AFTER_MS = 700;
const FIRST_SAY_FOR_MS = 6500;
const DONE_SAY_AFTER_MS = 250;
const DONE_SAY_FOR_MS = 4500;
const SHOW_DONE_FOR_MS = 1100;
const HOT_FOR_MS = 1800;
const LEVEL_UP_AFTER_MS = 650;
const LEVEL_UP_FOR_MS = 3400;
// Starting from a preview waits for its sheet to slide away.
const START_AFTER_PREVIEW_MS = 260;

/** What each button on a coach's card does. */
export type CardAction = 'today' | 'move' | 'skip' | 'ease' | 'pick' | 'resume';

// What the coach says after each one.
const ACTION_LINES: Record<CardAction, { coach: CoachName; text: string }> = {
  today: { coach: 'rex', text: 'Push Day A is on for today.' },
  move: { coach: 'rex', text: "Moved to Thursday. I'll remind you that morning." },
  skip: { coach: 'rex', text: 'Skipped. On to the next one.' },
  ease: { coach: 'rex', text: 'Lighter weights this week.' },
  pick: { coach: 'rex', text: 'Back to your usual weights.' },
  resume: { coach: 'luna', text: 'Your plan is back on.' },
};

const THURSDAY = 3;
const planned = (id: StepId) => MOCK_STEPS.find((step) => step.id === id)!;
const byTime = (a: Step, b: Step) => a.plannedAt - b.plannedAt;

/**
 * Today's steps and points, and the moments around them: the coach's line in the sky, the
 * level card lighting up, and a finished step staying ticked before it folds away.
 * Starts from `day` and is kept in memory, so it starts over when the app restarts.
 * `now` is minutes after midnight.
 */
export function useDay(day: Day, now: number) {
  const [steps, setSteps] = useState(day.steps);
  const [points, setPoints] = useState(day.points);
  const [week, setWeek] = useState(day.week);
  const [card, setCard] = useState(day.card);
  const [openId, setOpenId] = useState<StepId>();
  const [previewId, setPreviewId] = useState<StepId>();
  const [justDone, setJustDone] = useState<StepId>();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [say, setSay] = useState<{ coach: CoachName; text: string }>();
  const [hot, setHot] = useState(false);
  const [gain, setGain] = useState<{ amount: number; key: number }>();
  const [levelUp, setLevelUp] = useState<string>();

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hush = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cool = useRef<ReturnType<typeof setTimeout>>(undefined);
  const later = (ms: number, run: () => void) => timers.current.push(setTimeout(run, ms));
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      clearTimeout(hush.current);
      clearTimeout(cool.current);
    };
  }, []);

  // A newer line or glow replaces the one showing, along with its timer.
  const speak = (coach: CoachName, text: string, ms: number) => {
    setSay({ coach, text });
    clearTimeout(hush.current);
    hush.current = setTimeout(() => setSay(undefined), ms);
  };
  const glow = (ms: number) => {
    setHot(true);
    clearTimeout(cool.current);
    cool.current = setTimeout(() => setHot(false), ms);
  };

  const paused = week.pausedUntil !== undefined;
  const next = nextStep(steps, now, paused);

  // Once Today opens, a coach says the day's line, or the next step's tip. A coach's card
  // above the path speaks for itself, so then there's no tip.
  useEffect(() => {
    const line =
      day.say ??
      (next && !day.card ? { coach: next.coach, text: stepText(next, steps).tip } : null);
    if (!line) return;
    const timer = setTimeout(
      () => speak(line.coach, line.text, FIRST_SAY_FOR_MS),
      FIRST_SAY_AFTER_MS,
    );
    return () => clearTimeout(timer);
    // Only when Today first opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (step: Step) => {
    setSteps((all) => all.map((s) => (s.id === step.id ? { ...s, doneAt: now } : s)));
    setOpenId(undefined);
    setJustDone(step.id);
    later(SHOW_DONE_FOR_MS, () => setJustDone((id) => (id === step.id ? undefined : id)));
    later(DONE_SAY_AFTER_MS, () => speak(step.coach, DONE_LINES[step.coach], DONE_SAY_FOR_MS));

    const before = levelFor(points);
    const after = levelFor(points + step.points);
    setPoints(points + step.points);
    setGain({ amount: step.points, key: Date.now() });
    glow(HOT_FOR_MS);
    if (after.number > before.number) {
      later(LEVEL_UP_AFTER_MS, () => {
        glow(LEVEL_UP_FOR_MS);
        setLevelUp(`Level up! You're a ${after.name} now.`);
        speak('rex', `Level ${after.number}! You're a ${after.name} now.`, DONE_SAY_FOR_MS);
        later(LEVEL_UP_FOR_MS, () => setLevelUp(undefined));
      });
    }
  };

  /** Lets a step go for today. It folds away like a done one, with no points. */
  const skip = (step: Step) => {
    setSteps((all) =>
      all.map((s) => (s.id === step.id ? { ...s, doneAt: now, skipped: true } : s)),
    );
    setOpenId(undefined);
    setJustDone(step.id);
    later(SHOW_DONE_FOR_MS, () => setJustDone((id) => (id === step.id ? undefined : id)));
  };

  const undo = (step: Step) => {
    setSteps((all) =>
      all.map((s) => (s.id === step.id ? { ...s, doneAt: undefined, skipped: undefined } : s)),
    );
    if (!step.skipped) setPoints(points - step.points);
    setOpenId(step.id);
  };

  /** A button on a coach's card. The card goes, and the coach says what changed. */
  const act = (action: CardAction) => {
    setCard(undefined);
    const line = ACTION_LINES[action];
    speak(line.coach, line.text, DONE_SAY_FOR_MS);
    if (action === 'today') {
      setSteps((all) => [...all, planned('workout')].sort(byTime));
      setOpenId('workout');
    }
    if (action === 'move') setWeek({ ...week, plan: [...(week.plan ?? []), THURSDAY] });
    if (action === 'ease') {
      const lighter = { lite: true, result: '35 min', doneDetail: '5 exercises · 35 min' };
      setSteps((all) => all.map((s) => (s.id === 'workout' ? { ...s, ...lighter } : s)));
    }
    if (action === 'resume') {
      setWeek({ ...week, pausedUntil: undefined });
      setSteps((all) => [...all, planned('workout'), planned('stretch')].sort(byTime));
    }
  };

  const startPreview = (step: Step) => {
    setPreviewId(undefined);
    later(START_AFTER_PREVIEW_MS, () => finish(step));
  };

  const toggleSection = (title: string) =>
    setExpanded((open) =>
      open.includes(title) ? open.filter((t) => t !== title) : [...open, title],
    );

  return {
    steps,
    points,
    week,
    card,
    paused,
    next,
    openId,
    preview: steps.find((step) => step.id === previewId),
    justDone,
    expanded,
    say,
    hot,
    gain,
    levelUp,
    open: setOpenId,
    openPreview: (step: Step) => setPreviewId(step.id),
    closePreview: () => setPreviewId(undefined),
    startPreview,
    finish,
    skip,
    undo,
    act,
    toggleSection,
  };
}
