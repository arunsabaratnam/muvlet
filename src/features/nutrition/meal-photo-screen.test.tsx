import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveMeal } from './storage';
import { recognizeFood } from './recognition';
import MealPhotoScreen from './meal-photo-screen';

let mockManual = '1';
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ manual: mockManual }), router: { canGoBack: () => true, back: jest.fn(), replace: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => jest.requireActual('react-native-safe-area-context/jest/mock').default);
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('./storage', () => ({ SERVER_KEY: 'server', saveMeal: jest.fn().mockResolvedValue(undefined) }));
jest.mock('./recognition', () => ({ ...jest.requireActual('./recognition'), recognizeFood: jest.fn() }));
jest.mock('expo-image-picker', () => ({ requestCameraPermissionsAsync: jest.fn(), launchCameraAsync: jest.fn(), launchImageLibraryAsync: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks(); mockManual = '1';
  jest.mocked(saveMeal).mockResolvedValue(undefined);
  jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ granted: true } as Awaited<ReturnType<typeof ImagePicker.requestCameraPermissionsAsync>>);
  jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({ canceled: true, assets: null });
});
async function addCustomRice() {
  await fireEvent.changeText(screen.getByLabelText('Search foods'), 'Rice');
  await fireEvent.press(screen.getByText('Enter label values'));
  for (const [key, value] of Object.entries({ calories: '130', protein: '2.69', carbs: '28.17', fat: '0.28' })) {
    await fireEvent.changeText(screen.getByLabelText(`${key} per 100 grams of Rice`), value);
  }
  expect(screen.getByRole('button', { name: 'Add to meal' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Grams of Rice'), '200');
  await fireEvent.press(screen.getByText('Add to meal'));
}
// Full entry/edit flow gets a local allowance for cold parallel CI runners.
test('manual route starts with search, edits quantity and saves once without checkboxes', async () => {
  await render(<MealPhotoScreen />);
  expect(screen.getByLabelText('Search foods')).toBeOnTheScreen();
  expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  await addCustomRice();
  expect(screen.queryByRole('checkbox')).toBeNull();
  await fireEvent.press(screen.getByLabelText('Edit Rice'));
  await fireEvent.changeText(screen.getByLabelText('Grams of Rice'), '100');
  await fireEvent.press(screen.getByText('Save changes'));
  await fireEvent.press(screen.getByText('Save meal'));
  expect(saveMeal).toHaveBeenCalledTimes(1);
  expect(saveMeal).toHaveBeenCalledWith(expect.objectContaining({ nutrition: { calories: 130, protein: 2.69, carbs: 28.17, fat: 0.28 } }));
  expect(screen.getByText('Meal saved')).toBeOnTheScreen();
}, 15000);

test('canceling quantity edits preserves the previous meal and removal clears it', async () => {
  await render(<MealPhotoScreen />);
  await addCustomRice();
  await fireEvent.press(screen.getByLabelText('Edit Rice'));
  await fireEvent.changeText(screen.getByLabelText('Grams of Rice'), '100');
  await fireEvent.press(screen.getByLabelText('Back to food search'));
  await fireEvent.press(screen.getByText('Cancel'));
  expect(screen.getByText('200 g · 260 kcal')).toBeOnTheScreen();
  await fireEvent.press(screen.getByLabelText('Edit Rice'));
  await fireEvent.press(screen.getByText('Remove food'));
  expect(screen.queryByText('Save meal')).toBeNull();
}, 15000);

test('save failure keeps the meal available for retry', async () => {
  jest.mocked(saveMeal).mockRejectedValueOnce(new Error('Storage is full'));
  await render(<MealPhotoScreen />);
  await addCustomRice();
  await fireEvent.press(screen.getByText('Save meal'));
  expect(screen.getByText('Storage is full')).toBeOnTheScreen();
  await fireEvent.press(screen.getByText('Save meal'));
  expect(screen.getByText('Meal saved')).toBeOnTheScreen();
}, 15000);

test('photo route opens the camera and denial offers settings', async () => {
  mockManual = '0';
  jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ granted: false } as Awaited<ReturnType<typeof ImagePicker.requestCameraPermissionsAsync>>);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  try {
    await render(<MealPhotoScreen />);
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Camera access', expect.any(String), expect.any(Array)));
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    expect(screen.getByText('Take photo')).toBeOnTheScreen();
  } finally { alert.mockRestore(); }
});

test('library cancellation leaves the photo flow usable', async () => {
  mockManual = '0';
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({ canceled: true, assets: null });
  await render(<MealPhotoScreen />);
  await waitFor(() => expect(ImagePicker.launchCameraAsync).toHaveBeenCalled());
  await fireEvent.press(screen.getByText('Choose from library'));
  expect(screen.queryByLabelText('Your meal photo')).toBeNull();
  await fireEvent.press(screen.getByText('Add manually'));
  expect(screen.getByLabelText('Search foods')).toBeOnTheScreen();
});

test('photo suggestions need explicit nutrition and quantity before saving', async () => {
  mockManual = '0';
  jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://meal.jpg', base64: 'image', width: 100, height: 100 }] } as Awaited<ReturnType<typeof ImagePicker.launchCameraAsync>>);
  jest.mocked(recognizeFood).mockResolvedValue({ apiVersion: 2, imageWidth: 100, imageHeight: 100, detections: [{ label: 'rice', score: .8, box: [0, 0, 1, 1] }] });
  await render(<MealPhotoScreen />);
  await fireEvent.press(await screen.findByText('Analyze foods'));
  expect(recognizeFood).not.toHaveBeenCalled();
  await fireEvent.changeText(screen.getByLabelText('Recognition server address'), 'http://192.168.1.10:8765');
  await fireEvent.changeText(screen.getByLabelText('Server pairing code'), 'test-code');
  await fireEvent.press(screen.getByText('Done'));
  await fireEvent.press(screen.getByText('Analyze foods'));
  expect(screen.getByText('Choose food & quantity')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Save meal' })).toBeDisabled();
  expect(saveMeal).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByLabelText('Edit rice'));
  await fireEvent.press(screen.getByText('Remove food'));
  expect(screen.queryByText('Save meal')).toBeNull();
}, 15000);
