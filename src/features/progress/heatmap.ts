import { dayKey, KINDS, mondayOf, type Kind, type Session } from './history';

export type Cell = {
  day: string;
  /** What you trained that day, if anything. */
  kind?: Kind;
  today: boolean;
  /** Still to come this week. */
  ahead: boolean;
};

const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

/**
 * The last `weeks` weeks as columns of 7 days, Monday first, ending with this week. Each
 * column gets a month label when it holds the first Monday of a month.
 */
export function weeksGrid(history: Session[], now: Date, weeks = 16) {
  const byDay = new Map(history.map((session) => [session.day, session.kind]));
  const today = dayKey(now);
  const start = mondayOf(now);
  start.setDate(start.getDate() - (weeks - 1) * 7);

  const counts = Object.fromEntries(KINDS.map((kind) => [kind, 0])) as Record<Kind, number>;
  const columns: Cell[][] = [];
  const months: { column: number; label: string }[] = [];
  for (let w = 0; w < weeks; w++) {
    const monday = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7);
    if (monday.getDate() <= 7) months.push({ column: w, label: MONTHS[monday.getMonth()] });
    const column: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + d);
      const day = dayKey(date);
      const kind = day <= today ? byDay.get(day) : undefined;
      if (kind) counts[kind]++;
      column.push({ day, kind, today: day === today, ahead: day > today });
    }
    columns.push(column);
  }

  const label =
    `Last ${weeks} weeks: ${counts.push} push, ${counts.pull} pull, ${counts.legs} legs ` +
    `and ${counts.stretch} stretch or walk days`;
  return { columns, months, counts, label };
}
