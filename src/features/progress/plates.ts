/*
 * The plates on your barbell. Every level after the first adds one plate a side: iron for
 * levels 2 to 4, then steel, bronze and gold. Each metal is lighter than the last, so the bar
 * loads like a real one: heaviest inside, newest outside.
 */

export type Metal = 'iron' | 'steel' | 'bronze' | 'gold';

const ORDER: Metal[] = ['iron', 'steel', 'bronze', 'gold'];

/** The plate earned on reaching each level, from level 2. */
const EARNED: Metal[] = [
  'iron',
  'iron',
  'iron',
  'steel',
  'steel',
  'steel',
  'bronze',
  'bronze',
  'bronze',
  'gold',
  'gold',
];

/** Plate thickness by metal, as drawn. */
export const THICKNESS: Record<Metal, number> = { iron: 13, steel: 11, bronze: 9, gold: 7 };

/** One side's plates at this level, from the collar outwards. */
export function platesFor(level: number): Metal[] {
  return EARNED.slice(0, Math.max(0, level - 1)).sort(
    (a, b) => ORDER.indexOf(a) - ORDER.indexOf(b),
  );
}
