import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Barbell } from './barbell';
import { weeksGrid } from './heatmap';
import { mockHistory } from './history';
import { WeeksGrid } from './weeks-grid';

// Room inside a card on a 360-wide Android phone.
const NARROW = 292;
const layout = (width: number) => ({ nativeEvent: { layout: { width, height: 0 } } });
const widthOf = (element: ReturnType<typeof screen.getAllByTestId>[number]) =>
  StyleSheet.flatten(element.props.style).width as number;

test('the grid draws 16 weeks of squares that fit a narrow card', async () => {
  const now = new Date(2026, 10, 22, 18, 30);
  await render(<WeeksGrid grid={weeksGrid(mockHistory(now), now)} />);
  await fireEvent(screen.getByLabelText(/^Last 16 weeks/), 'layout', layout(NARROW));

  const days = screen.getAllByTestId('day');
  expect(days).toHaveLength(16 * 7);
  const size = widthOf(days[0]);
  // Day letters (16), a gap, then 16 squares with 15 gaps of 4.
  expect(16 + 4 + 16 * size + 15 * 4).toBeLessThanOrEqual(NARROW);
  expect(size).toBeGreaterThanOrEqual(12);
});

test('a full bar at the top level still fits a narrow card', async () => {
  await render(<Barbell level={12} />);
  const bar = screen.getByLabelText('A barbell with 11 plates a side');
  await fireEvent(bar, 'layout', layout(NARROW));

  const plates = screen.getAllByTestId('plate');
  expect(plates).toHaveLength(22);
  const drawn = plates.reduce((sum, plate) => sum + widthOf(plate) + 2, 0);
  // Ends, collars and the least bar between them take 62.
  expect(drawn + 62).toBeLessThanOrEqual(NARROW + 0.01);
});

test('a bar with room to spare keeps its plates full size', async () => {
  await render(<Barbell level={4} />);
  const bar = screen.getByLabelText('A barbell with 3 plates a side');
  await fireEvent(bar, 'layout', layout(NARROW));
  expect(screen.getAllByTestId('plate').map(widthOf)).toEqual([13, 13, 13, 13, 13, 13]);
});
