import {
  ageOptions,
  formatHeight,
  formatWeight,
  heightOptions,
  KG_PER_LB,
  nearestRow,
  toggle,
  weightOptions,
} from './answers';

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

test('the wheels run inch by inch or cm by cm, pound by pound or kg by kg', () => {
  const feet = heightOptions('lb');
  expect([feet.labels[0], feet.labels.at(-1)]).toEqual(['4′ 4″', '7′ 2″']);
  // Every height in inches stays within the 130–220 cm the plan expects.
  expect(feet.values.every((cm) => cm >= 130 && cm <= 220)).toBe(true);
  expect(heightOptions('kg').labels.slice(0, 2)).toEqual(['130 cm', '131 cm']);

  const pounds = weightOptions('lb');
  expect([pounds.labels[0], pounds.labels[1], pounds.labels.at(-1)]).toEqual([
    '80 lb',
    '81 lb',
    '400 lb',
  ]);
  const kilos = weightOptions('kg');
  expect([kilos.labels[0], kilos.labels.at(-1)]).toEqual(['36 kg', '181 kg']);

  const ages = ageOptions();
  expect([ages.labels[0], ages.labels.at(-1)]).toEqual(['13', '90']);
});

test('the wheel starts on the row nearest the stored value', () => {
  const pounds = weightOptions('lb');
  expect(pounds.labels[nearestRow(pounds.values, 170 * KG_PER_LB)]).toBe('170 lb');
  const feet = heightOptions('lb');
  expect(feet.labels[nearestRow(feet.values, 175)]).toBe('5′ 9″');
  // Values off the ends land on the first or last row.
  expect(nearestRow(pounds.values, 500)).toBe(pounds.values.length - 1);
  expect(nearestRow(ageOptions().values, 5)).toBe(0);
});

test('height and weight show in the units picked', () => {
  expect(formatHeight(175, 'lb')).toBe('5′ 9″');
  expect(formatHeight(175, 'kg')).toBe('175 cm');
  expect(formatWeight(170 * KG_PER_LB, 'lb')).toBe('170 lb');
  expect(formatWeight(170 * KG_PER_LB, 'kg')).toBe('77 kg');
});
