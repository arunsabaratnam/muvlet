import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveMeal } from './storage';
import MealPhotoScreen from './meal-photo-screen';

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}), router: { canGoBack: () => true, back: jest.fn(), replace: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('./storage', () => ({ SERVER_KEY: 'server', saveMeal: jest.fn().mockResolvedValue(undefined) }));
jest.mock('expo-image-picker', () => ({ requestCameraPermissionsAsync: jest.fn(), launchCameraAsync: jest.fn(), launchImageLibraryAsync: jest.fn() }));

beforeEach(() => { jest.clearAllMocks(); });
// The full entry/edit flow can exceed five seconds on a cold, parallel CI runner.
// Keep the extra allowance local to this integration test.
test('manual meal requires confirmation, saves real values, and edits reset confirmation', async () => {
  await render(<MealPhotoScreen />);
  await fireEvent.press(screen.getByText('Add a food manually'));
  await fireEvent.changeText(screen.getByLabelText('Food 1 name'), 'Rice');
  await fireEvent.press(screen.getByText('Choose food, variety and cooking method'));
  await fireEvent.press(screen.getByText('Enter label values per 100 g'));
  for (const [key, value] of Object.entries({ calories: '130', protein: '2.69', carbs: '28.17', fat: '0.28' })) {
    await fireEvent.changeText(screen.getByLabelText(`${key} per 100 grams of Rice`), value);
  }
  await fireEvent.changeText(screen.getByLabelText('Grams of Rice'), '200');
  await fireEvent.press(screen.getByText('Save meal'));
  expect(saveMeal).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('checkbox'));
  await fireEvent.press(screen.getByText('Save meal'));
  expect(saveMeal).toHaveBeenCalledWith(expect.objectContaining({ nutrition: { calories: 260, protein: 5.38, carbs: 56.34, fat: 0.56 } }));
  expect(screen.getByText('Meal saved')).toBeOnTheScreen();
  await fireEvent.changeText(screen.getByLabelText('Grams of Rice'), '100');
  expect(screen.getByRole('checkbox', { checked: false })).toBeOnTheScreen();
}, 15000);
test('camera denial explains permissions and does not launch camera', async () => {
  jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ granted: false } as Awaited<ReturnType<typeof ImagePicker.requestCameraPermissionsAsync>>);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  try {
    await render(<MealPhotoScreen />);
    await fireEvent.press(screen.getByText('Take photo'));
    expect(alert).toHaveBeenCalledWith('Camera access', expect.any(String), expect.any(Array));
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  } finally { alert.mockRestore(); }
});
test('library cancellation leaves the draft usable', async () => {
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({ canceled: true, assets: null });
  await render(<MealPhotoScreen />);
  await fireEvent.press(screen.getByText('Choose from library'));
  expect(screen.queryByLabelText('Your meal photo')).toBeNull();
  await fireEvent.press(screen.getByText('Add a food manually'));
  expect(screen.getByLabelText('Food 1 name')).toBeOnTheScreen();
});
