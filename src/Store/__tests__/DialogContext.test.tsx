import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { ThemeProvider } from '../ThemeContext';
import { DialogProvider, useDialog } from '../DialogContext';

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return { ...actual, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});

let dialog: ReturnType<typeof useDialog>;
const Probe = () => {
  dialog = useDialog();
  return <Text>probe</Text>;
};

const renderWithDialog = () =>
  render(
    <ThemeProvider>
      <DialogProvider>
        <Probe />
      </DialogProvider>
    </ThemeProvider>,
  );

describe('DialogProvider action sheet', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('runs the chosen action only after the sheet closes', () => {
    const onMove = jest.fn();
    const screen = renderWithDialog();

    act(() => {
      dialog.showActionSheet({ title: 'Inception', actions: [{ label: 'Move to Watched', onPress: onMove }] });
    });
    expect(screen.getByText('Inception')).toBeTruthy();

    fireEvent.press(screen.getByText('Move to Watched'));
    expect(onMove).not.toHaveBeenCalled(); // still animating out

    act(() => jest.runAllTimers());
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Move to Watched')).toBeNull();
  });

  it('Cancel closes without running any action', () => {
    const onMove = jest.fn();
    const screen = renderWithDialog();

    act(() => {
      dialog.showActionSheet({ actions: [{ label: 'Move', onPress: onMove }] });
    });
    fireEvent.press(screen.getByText('Cancel'));
    act(() => jest.runAllTimers());

    expect(onMove).not.toHaveBeenCalled();
    expect(screen.queryByText('Move')).toBeNull();
  });
});
