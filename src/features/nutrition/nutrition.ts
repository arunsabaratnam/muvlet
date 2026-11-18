import catalog from './data/foods.json';

export const nutrientKeys = ['calories', 'protein', 'carbs', 'fat'] as const;
export type Nutrients = Record<(typeof nutrientKeys)[number], number>;
export type Box = [number, number, number, number];
export type FoodRow = {
  id: string;
  name: string;
  grams: string;
  foodId?: string;
  custom?: Partial<Record<keyof Nutrients, string>>;
  quantitySource?: 'user' | 'reference_portion';
  portionDescription?: string | null;
  source: 'manual' | 'detector';
  boxes: Box[];
  score: number | null;
  confirmed: boolean;
};
export type FoodProfile = {
  id: string; label: string; per100g: Nutrients; source: string;
  sourceUrl?: string; portions?: { description: string; grams: number }[];
};
export const foods = catalog.foods;
export function parseAmount(value: string): number {
  const normalized = value.trim().replace(',', '.');
  return /^\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}
export function profile(row: FoodRow): FoodProfile | null {
  if (row.foodId === 'custom') {
    const per100g = {} as Nutrients;
    for (const key of nutrientKeys) {
      const value = parseAmount(row.custom?.[key] ?? '');
      if (!Number.isFinite(value) || value < 0 || value > (key === 'calories' ? 2000 : 100)) return null;
      per100g[key] = value;
    }
    return { id: 'custom', label: 'User-entered label', source: 'User input', per100g };
  }
  const food = foods.find(f => f.id === row.foodId);
  return food ? { ...food, label: food.usdaDescription, source: catalog.source } : null;
}
export function forRow(row: FoodRow) {
  const food = profile(row);
  const grams = parseAmount(row.grams);
  if (!food || !Number.isFinite(grams) || grams <= 0 || grams > 5000) return null;
  const values = {} as Nutrients;
  for (const key of nutrientKeys) values[key] = food.per100g[key] * grams / 100;
  return { grams, profile: food, values };
}
export function summary(rows: FoodRow[]) {
  const total: Nutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  let calculated = 0;
  for (const row of rows) {
    const result = forRow(row);
    if (result) {
      calculated++;
      for (const key of nutrientKeys) total[key] += result.values[key];
    }
  }
  return { total: calculated ? total : null, calculated, complete: rows.length > 0 && calculated === rows.length };
}
export function prepareMeal(rows: FoodRow[]) {
  if (!rows.length || rows.length > 20) throw new Error('Add between 1 and 20 foods.');
  return rows.map(row => {
    if (!row.name.trim() || !row.confirmed) throw new Error('Check and confirm each food, preparation and quantity.');
    const result = forRow(row);
    if (!result) throw new Error('Choose a nutrition profile and enter a quantity greater than 0 and at most 5,000 g for each food.');
    return {
      name: row.name.trim(), grams: result.grams, source: row.source,
      quantitySource: row.quantitySource ?? 'user',
      portionDescription: row.quantitySource === 'reference_portion' ? row.portionDescription : null,
      nutrition: {
        ...result.values, basis: 'estimated_from_grams' as const,
        foodId: result.profile.id, foodLabel: result.profile.label,
        per100g: result.profile.per100g, source: result.profile.source,
        sourceUrl: result.profile.sourceUrl ?? null,
      },
    };
  });
}
export type Meal = { id: string; createdAt: string; foods: ReturnType<typeof prepareMeal>; nutrition: Nutrients };
