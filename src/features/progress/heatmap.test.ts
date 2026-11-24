import { weeksGrid } from './heatmap';
import { mockHistory, type Session } from './history';

// Sunday, November 22, 2026.
const SUNDAY = new Date(2026, 10, 22, 18, 30);

test('16 weeks of 7 days, Monday first, ending with this week', () => {
  const { columns } = weeksGrid([], SUNDAY);
  expect(columns).toHaveLength(16);
  expect(columns.every((column) => column.length === 7)).toBe(true);
  expect(columns[0][0].day).toBe('2026-08-03');
  expect(columns[15][6]).toMatchObject({ day: '2026-11-22', today: true, ahead: false });
});

test('each month is labelled on the week of its first Monday', () => {
  expect(weeksGrid([], SUNDAY).months).toEqual([
    { column: 0, label: 'Aug' },
    { column: 5, label: 'Sep' },
    { column: 9, label: 'Oct' },
    { column: 13, label: 'Nov' },
  ]);
});

test('days take the colour of what you trained, and later days stay empty', () => {
  const history: Session[] = [
    { day: '2026-11-16', kind: 'push' },
    { day: '2026-11-17', kind: 'stretch' },
    { day: '2026-11-20', kind: 'legs' },
  ];
  // Wednesday: Friday's legs haven't happened yet.
  const { columns, counts, label } = weeksGrid(history, new Date(2026, 10, 18, 9));
  const week = columns[15];
  expect(week.map((cell) => cell.kind)).toEqual([
    'push',
    'stretch',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
  expect(week[2]).toMatchObject({ today: true, ahead: false });
  expect(week[4]).toMatchObject({ ahead: true });
  expect(counts).toEqual({ push: 1, pull: 0, legs: 0, stretch: 1 });
  expect(label).toBe('Last 16 weeks: 1 push, 0 pull, 0 legs and 1 stretch or walk days');
});

test('the sample history fills the grid up to today and no further', () => {
  const now = new Date(2026, 10, 18, 9);
  const history = mockHistory(now);
  expect(history.every((session) => session.day <= '2026-11-18')).toBe(true);
  const { columns } = weeksGrid(history, now);
  expect(columns[0][0].kind).toBe('push');
  expect(columns[15].filter((cell) => cell.ahead).every((cell) => !cell.kind)).toBe(true);
});
