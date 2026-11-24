/*
 * What you trained, day by day. Nothing is saved on the phone yet, so the Progress tab reads
 * sample history built back from today, the same way Today reads a mock day. Once history is
 * saved, it replaces mockHistory and nothing else changes.
 */

export type Kind = 'push' | 'pull' | 'legs' | 'stretch';

/** One day's training. `day` is the local date as YYYY-MM-DD. */
export type Session = { day: string; kind: Kind };

export const KINDS: Kind[] = ['push', 'pull', 'legs', 'stretch'];

export function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The Monday at the start of this date's week, at midnight. */
export function mondayOf(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
}

// 16 weeks, oldest first, Monday to Sunday: P push, U pull, L legs, S stretch or walk, . nothing.
// Push, pull and legs on Monday, Wednesday and Friday, stretches between, and two quiet weeks.
const WEEKS = [
  'PSU.LS.',
  'PSUSL..',
  'P.USLS.',
  'PSU.L.S',
  'PSUS.S.',
  '.S...S.',
  'PSUSLS.',
  'P.U.LS.',
  'PSUSL.S',
  '..S..S.',
  'PSU.LS.',
  'PSUSLS.',
  'P.USL..',
  'PSUSLS.',
  'PSU.L..',
  'PSUSLS.',
];
const LETTERS: Record<string, Kind> = { P: 'push', U: 'pull', L: 'legs', S: 'stretch' };

/** Sample history for the 16 weeks up to `now`. Days after today are left empty. */
export function mockHistory(now: Date): Session[] {
  const first = mondayOf(now);
  first.setDate(first.getDate() - (WEEKS.length - 1) * 7);
  const today = dayKey(now);
  const sessions: Session[] = [];
  WEEKS.forEach((week, w) => {
    [...week].forEach((letter, d) => {
      const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + w * 7 + d);
      const day = dayKey(date);
      if (LETTERS[letter] && day <= today) sessions.push({ day, kind: LETTERS[letter] });
    });
  });
  return sessions;
}
