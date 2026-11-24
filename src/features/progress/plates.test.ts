import { platesFor } from './plates';

test('a plate a side for each level after the first, heaviest inside', () => {
  expect(platesFor(1)).toEqual([]);
  expect(platesFor(4)).toEqual(['iron', 'iron', 'iron']);
  expect(platesFor(6)).toEqual(['iron', 'iron', 'iron', 'steel', 'steel']);
  expect(platesFor(12)).toEqual([
    'iron', 'iron', 'iron', 'steel', 'steel', 'steel', 'bronze', 'bronze', 'bronze', 'gold', 'gold',
  ]);
});
