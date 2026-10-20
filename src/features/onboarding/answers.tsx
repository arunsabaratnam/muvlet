import { createContext, use, useState, type ReactNode } from 'react';

/*
 * What the user tells the coaches during onboarding. Kept in memory only for now:
 * it lasts while the flow is open and goes when the app closes (no accounts yet).
 */

export type Goal =
  | 'Get stronger'
  | 'Lose some fat'
  | 'Feel fitter and healthier'
  | 'Feel confident at the gym';
export type Experience = 'Never lifted' | 'Tried it a few times' | 'Used to train, not lately';
export type TimeOfDay = 'Morning' | 'Lunch' | 'Evening';
export type Place = 'Gym' | 'Home' | 'Both';
export type Units = 'lb' | 'kg';
export type Sex = 'Male' | 'Female';
export type Reminders = 'Gentle' | 'Regular' | 'Off';

export type Answers = {
  goal: Goal | null;
  experience: Experience | null;
  /** Training days, 0 = Sunday. */
  days: number[];
  time: TimeOfDay;
  place: Place;
  equipment: string[];
  minutes: number;
  units: Units;
  sex: Sex | null;
  heightCm: number;
  weightKg: number;
  age: number;
  /** True when About you was skipped, so the plan leaves out food targets. */
  skippedAbout: boolean;
  limits: string[];
  reminders: Reminders;
};

export const KG_PER_LB = 0.4536;

/** Equipment preselected for each place (the user can still change it). */
export const KITS: Record<Place, string[]> = {
  Gym: ['Dumbbells', 'Barbell', 'Bench', 'Machines', 'Cables'],
  Home: ['Dumbbells', 'Just my body'],
  Both: ['Dumbbells', 'Barbell', 'Bench', 'Machines', 'Cables', 'Bands'],
};

// Starting answers, as in the mockup.
export const DEFAULT_ANSWERS: Answers = {
  goal: null,
  experience: null,
  days: [1, 3, 5],
  time: 'Evening',
  place: 'Gym',
  equipment: KITS.Gym,
  minutes: 45,
  units: 'lb',
  sex: null,
  heightCm: 175,
  weightKg: 170 * KG_PER_LB,
  age: 28,
  skippedAbout: false,
  limits: ['Nothing'],
  reminders: 'Gentle',
};

/**
 * Ticks or unticks `item` in a multi-pick list. `only` is the "none of these" choice
 * (e.g. "Nothing"): picking it clears the rest, picking anything else clears it, and the
 * list falls back to it when emptied.
 */
export function toggle(list: string[], item: string, only?: string): string[] {
  if (item === only) return [item];
  const rest = list.filter((x) => x !== only);
  const next = rest.includes(item) ? rest.filter((x) => x !== item) : [...rest, item];
  return next.length || !only ? next : [only];
}

/** Moves a number by `by`, kept within `min` and `max`. */
export function stepBy(value: number, by: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value + by));
}

/** Height as the user reads it: feet and inches with lb, centimetres with kg. */
export function formatHeight(cm: number, units: Units) {
  if (units === 'kg') return `${Math.round(cm)} cm`;
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)}′ ${inches % 12}″`;
}

export function formatWeight(kg: number, units: Units) {
  return units === 'kg' ? `${Math.round(kg)} kg` : `${Math.round(kg / KG_PER_LB)} lb`;
}

type AnswersContext = {
  answers: Answers;
  update: (changes: Partial<Answers>) => void;
};

const Context = createContext<AnswersContext | null>(null);

export function AnswersProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const update = (changes: Partial<Answers>) =>
    setAnswers((current) => ({ ...current, ...changes }));
  return <Context value={{ answers, update }}>{children}</Context>;
}

export function useAnswers() {
  const context = use(Context);
  if (!context) throw new Error('useAnswers must be used inside AnswersProvider');
  return context;
}
