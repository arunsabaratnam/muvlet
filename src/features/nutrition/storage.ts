import AsyncStorage from '@react-native-async-storage/async-storage';
import { nutrientKeys, type Meal, type Nutrients } from './nutrition';

export const HISTORY_KEY = 'muvlet.meal-photo.history.v1';
export const SERVER_KEY = 'muvlet.meal-photo.server.v1';
function validNutrients(value: unknown): value is Nutrients {
  if (!value || typeof value !== 'object') return false;
  return nutrientKeys.every(key => {
    const n = (value as Nutrients)[key];
    return typeof n === 'number' && Number.isFinite(n) && n >= 0;
  });
}
export function validMeal(value: unknown): value is Meal {
  if (!value || typeof value !== 'object') return false;
  const m = value as Meal;
  return typeof m.id === 'string' && typeof m.createdAt === 'string' &&
    Number.isFinite(Date.parse(m.createdAt)) && validNutrients(m.nutrition) &&
    Array.isArray(m.foods) && m.foods.length > 0 && m.foods.length <= 20 && m.foods.every(f =>
      f && typeof f.name === 'string' && Number.isFinite(f.grams) && f.grams > 0 && f.grams <= 5000 &&
      validNutrients(f.nutrition));
}
export async function loadMeals(): Promise<Meal[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  const meals: unknown = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(meals) || !meals.every(validMeal)) throw new Error('Saved meal history could not be read.');
  return meals;
}
export async function saveMeal(meal: Meal) {
  if (!validMeal(meal)) throw new Error('Invalid meal.');
  const meals = await loadMeals();
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([meal, ...meals.filter(m => m.id !== meal.id)].slice(0, 100)));
}
