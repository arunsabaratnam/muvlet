import type { Metal } from './plates';

/*
 * PRs and badges as the Progress tab shows them. Neither is worked out yet: PRs need set
 * logging and badges need saved history, so both are sample data for now.
 */

export type PR = { name: string; value: string; up: string };

export const MOCK_PRS: PR[] = [
  { name: 'Dumbbell bench press', value: '35 lb for 8', up: '+5 lb' },
  { name: 'Lat pulldown', value: '70 lb for 10', up: '+2 reps' },
  { name: 'Goblet squat', value: '30 lb for 12', up: '+5 lb' },
];

/** A badge is drawn as a plate: `mark` is written on it, `metal` its colour once earned. */
export type Badge = { mark: string; name: string; metal: Metal; earned: boolean };

export const BADGE_COUNT = 18;

export const MOCK_BADGES: Badge[] = [
  { mark: '1', name: 'First workout', metal: 'bronze', earned: true },
  { mark: '5', name: '5 workouts', metal: 'bronze', earned: true },
  { mark: '10', name: '10 workouts', metal: 'steel', earned: true },
  { mark: 'PR', name: 'First PR', metal: 'iron', earned: true },
  { mark: '3/3', name: 'Perfect week', metal: 'steel', earned: true },
  { mark: '4', name: '4 weeks running', metal: 'gold', earned: true },
  { mark: '25', name: '25 workouts', metal: 'steel', earned: false },
  { mark: '12', name: '12 weeks running', metal: 'gold', earned: false },
  { mark: 'Back', name: 'First comeback', metal: 'bronze', earned: false },
];
