import AsyncStorage from '@react-native-async-storage/async-storage';
import { HISTORY_KEY, loadMeals, saveMeal } from './storage';
import { prepareMeal, type Meal } from './nutrition';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true, default: { getItem: jest.fn(), setItem: jest.fn() },
}));
const meal: Meal = { id: 'test', createdAt: '2026-11-17T12:00:00Z',
  foods: prepareMeal([{ id: '1', name: 'Rice', grams: '100', foodId: '168878', source: 'manual', boxes: [], score: null }]),
  nutrition: { calories: 130, protein: 2.69, carbs: 28.17, fat: 0.28 } };
beforeEach(() => jest.clearAllMocks());
test('saves a meal once and reloads history', async () => {
  jest.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([meal]));
  await saveMeal(meal);
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(HISTORY_KEY, JSON.stringify([meal]));
  expect(await loadMeals()).toEqual([meal]);
});
test('does not overwrite unreadable history', async () => {
  jest.mocked(AsyncStorage.getItem).mockResolvedValue('[{"id":"invalid"}]');
  await expect(saveMeal(meal)).rejects.toThrow();
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});
test('reports storage failures instead of claiming success', async () => {
  jest.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Disk full'));
  await expect(saveMeal(meal)).rejects.toThrow('Disk full');
});
