import { useEffect, useRef, useState } from 'react';

import type { CoachName } from '@/features/welcome/coach';

import {
  DONE_LINES,
  levelFor,
  MOCK_POINTS,
  MOCK_STEPS,
  nextStep,
  stepText,
  type Step,
  type StepId,
} from './day';

// Timings from the mockup.
const FIRST_SAY_AFTER_MS = 700;
const FIRST_SAY_FOR_MS = 6500;
const DONE_SAY_AFTER_MS = 250;
const DONE_SAY_FOR_MS = 4500;
const SHOW_DONE_FOR_MS = 1100;
const HOT_FOR_MS = 1800;
const LEVEL_UP_AFTER_MS = 650;
const LEVEL_UP_FOR_MS = 3400;

const minutesNow = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

/**
 * Today's steps and points, and the moments around them: the coach's line in the sky, the
 * level card lighting up, and a finished step staying ticked before it folds away.
 * Kept in memory for now, so it starts over when the app restarts.
 */
export function useDay() {
  const [steps, setSteps] = useState(MOCK_STEPS);
  const [points, setPoints] = useState(MOCK_POINTS);
  const [openId, setOpenId] = useState<StepId>();
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

  const next = nextStep(steps);

  // Once Today opens, the coach of the next step says their line.
  useEffect(() => {
    if (!next) return;
    const { tip } = stepText(next, steps);
    const timer = setTimeout(() => speak(next.coach, tip, FIRST_SAY_FOR_MS), FIRST_SAY_AFTER_MS);
    return () => clearTimeout(timer);
    // Only when Today first opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (step: Step) => {
    setSteps((all) => all.map((s) => (s.id === step.id ? { ...s, doneAt: minutesNow() } : s)));
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

  const undo = (step: Step) => {
    setSteps((all) => all.map((s) => (s.id === step.id ? { ...s, doneAt: undefined } : s)));
    setPoints(points - step.points);
    setOpenId(step.id);
  };

  const toggleSection = (title: string) =>
    setExpanded((open) =>
      open.includes(title) ? open.filter((t) => t !== title) : [...open, title],
    );

  return {
    steps,
    points,
    next,
    openId,
    justDone,
    expanded,
    say,
    hot,
    gain,
    levelUp,
    open: setOpenId,
    finish,
    undo,
    toggleSection,
  };
}
