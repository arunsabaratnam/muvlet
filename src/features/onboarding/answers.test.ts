import { formatHeight, formatWeight, KG_PER_LB, stepBy, toggle } from './answers';

test('toggle ticks and unticks items', () => {
  expect(toggle(['Bench'], 'Cables')).toEqual(['Bench', 'Cables']);
  expect(toggle(['Bench', 'Cables'], 'Bench')).toEqual(['Cables']);
  expect(toggle(['Bench'], 'Bench')).toEqual([]);
});

test('the "none of these" choice clears the rest, and comes back when the list empties', () => {
  expect(toggle(['Knees', 'Hips'], 'Nothing', 'Nothing')).toEqual(['Nothing']);
  expect(toggle(['Nothing'], 'Knees', 'Nothing')).toEqual(['Knees']);
  expect(toggle(['Knees'], 'Knees', 'Nothing')).toEqual(['Nothing']);
});

test('stepBy stays within its limits', () => {
  expect(stepBy(28, 1, 13, 90)).toBe(29);
  expect(stepBy(90, 1, 13, 90)).toBe(90);
  expect(stepBy(13, -1, 13, 90)).toBe(13);
});

test('height and weight show in the units picked', () => {
  expect(formatHeight(175, 'lb')).toBe('5′ 9″');
  expect(formatHeight(175, 'kg')).toBe('175 cm');
  expect(formatWeight(170 * KG_PER_LB, 'lb')).toBe('170 lb');
  expect(formatWeight(170 * KG_PER_LB, 'kg')).toBe('77 kg');
});
