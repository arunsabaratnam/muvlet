import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './button';

test('shows its title and calls onPress when tapped', async () => {
  const onPress = jest.fn();
  await render(<Button title="Start" onPress={onPress} />);

  await fireEvent.press(screen.getByText('Start'));

  expect(onPress).toHaveBeenCalledTimes(1);
});
