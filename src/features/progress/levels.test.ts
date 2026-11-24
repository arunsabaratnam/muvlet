import { levelFor } from './levels';

test('points fill the first eight levels', () => {
  expect(levelFor(0)).toEqual({
    number: 1,
    name: 'Newcomer',
    from: 0,
    to: 250,
    next: 'First Steps',
  });
  expect(levelFor(2080)).toMatchObject({
    number: 4,
    name: 'Gym Rookie',
    to: 2200,
    next: 'Gym Regular',
  });
  expect(levelFor(2200)).toMatchObject({ number: 5, name: 'Gym Regular', to: 3600 });
  expect(levelFor(8000)).toMatchObject({ number: 8, name: 'Confident Lifter', to: 11500 });
});

test('levels 9 to 12 also wait for kept weeks', () => {
  // Enough points for Seasoned Lifter, but only 6 of its 10 kept weeks.
  expect(levelFor(12000, 6)).toMatchObject({ number: 8, next: 'Seasoned Lifter', weeksToGo: 4 });
  expect(levelFor(12000, 10)).toMatchObject({ number: 9, name: 'Seasoned Lifter', weeksToGo: 4 });
  expect(levelFor(16000, 14)).toMatchObject({ number: 10, name: 'Gym Veteran' });
  expect(levelFor(40000, 26)).toEqual({ number: 12, name: 'Lifer', from: 28000 });
});

test('weeks to go only show while the next level needs more', () => {
  expect(levelFor(5000)).not.toHaveProperty('weeksToGo');
  expect(levelFor(9000, 12)).not.toHaveProperty('weeksToGo');
});
