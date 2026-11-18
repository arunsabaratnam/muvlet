import { foods, forRow, prepareMeal, summary, type FoodRow } from './nutrition';

const row = (foodId = '171477', grams = '150'): FoodRow => ({ id: '1', name: 'Chicken', grams, foodId, boxes: [], score: null, source: 'manual', confirmed: true });
test('sums USDA nutrients by weight without rounding intermediate results', () => {
  const result = summary([row(), row('168878', '200'), row('169967', '100')]);
  expect(result.complete).toBe(true);
  expect(result.total?.calories).toBeCloseTo(542.5);
  expect(result.total?.protein).toBeCloseTo(54.29);
  expect(result.total?.carbs).toBeCloseTo(63.52);
  expect(result.total?.fat).toBeCloseTo(6.325);
});
test('raw and cooked profiles give different results', () => {
  expect(forRow(row('168878', '100'))?.values.calories).toBe(130);
  expect(forRow(row('168877', '100'))?.values.calories).toBe(365);
});
test('missing information is not treated as zero and cannot be saved', () => {
  expect(summary([row('missing')]).total).toBeNull();
  expect(summary([row(), row('missing')]).complete).toBe(false);
  expect(() => prepareMeal([row('missing')])).toThrow();
  expect(() => prepareMeal([{ ...row(), confirmed: false }])).toThrow();
});
test.each(['', '0', '-1', '5001', 'Infinity', '1e3', 'abc'])('rejects invalid quantity %s', grams => {
  expect(forRow(row('171477', grams))).toBeNull();
});
test('accepts decimal commas and retains reference-portion provenance', () => {
  expect(forRow(row('171477', '100,5'))?.grams).toBe(100.5);
  const saved = prepareMeal([{ ...row(), quantitySource: 'reference_portion', portionDescription: '1 cup' }])[0];
  expect(saved.quantitySource).toBe('reference_portion');
  expect(saved.portionDescription).toBe('1 cup');
  expect(saved.nutrition.source).toContain('USDA');
});
test('requires all custom label values, but accepts genuine zero values', () => {
  const custom = { ...row('custom', '50'), custom: { calories: '100', protein: '10', carbs: '0', fat: '5' } };
  expect(forRow(custom)?.values).toEqual({ calories: 50, protein: 5, carbs: 0, fat: 2.5 });
  expect(forRow({ ...custom, custom: { calories: '100' } })).toBeNull();
});
test('every catalog entry has usable nutrient values', () => {
  expect(foods).toHaveLength(45);
  for (const food of foods) expect(forRow(row(food.id, '100'))?.values).toEqual(food.per100g);
});
