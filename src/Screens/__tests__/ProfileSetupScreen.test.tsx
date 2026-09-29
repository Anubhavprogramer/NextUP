import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileSetupScreen } from '../ProfileSetupScreen';
import { ThemeProvider } from '../../Store/ThemeContext';
import { ToastProvider } from '../../Store/ToastContext';
import { dataManager } from '../../Manager/DataManager';
import { discoverPopularMovies } from '../../API/tmdb';

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return { ...actual, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});
jest.mock('../../API/tmdb', () => ({ discoverPopularMovies: jest.fn() }));

const renderScreen = (onProfileCreated = jest.fn()) =>
  render(
    <ThemeProvider>
      <ToastProvider>
        <ProfileSetupScreen onProfileCreated={onProfileCreated} />
      </ToastProvider>
    </ThemeProvider>,
  );

describe('Onboarding', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    (discoverPopularMovies as jest.Mock).mockResolvedValue({
      page: 1, total_pages: 1, total_results: 1,
      results: [{ id: 1, title: 'Dune', posterPath: '/dune.jpg' }],
    });
  });

  it('welcomes, then asks for a name and creates the profile', async () => {
    const onProfileCreated = jest.fn();
    const screen = renderScreen(onProfileCreated);

    expect(screen.getByText(/Your Watchlist,/)).toBeTruthy();
    expect(screen.getByText('Share a reel')).toBeTruthy();
    fireEvent.press(screen.getByText('Get started'));

    expect(screen.getByText('What should we call you?')).toBeTruthy();
    fireEvent.press(screen.getByText('Start watching'));
    expect(screen.getByText('Please enter your name')).toBeTruthy();
    expect(onProfileCreated).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByPlaceholderText('Your name'), '  Sam ');
    await act(async () => {
      fireEvent.press(screen.getByText('Start watching'));
    });
    await waitFor(() => expect(onProfileCreated).toHaveBeenCalled());
    expect((await dataManager.getUserProfile())?.name).toBe('Sam');
    expect(await dataManager.isFirstLaunch()).toBe(false);
  });

  it('still works when posters cannot load (offline)', async () => {
    (discoverPopularMovies as jest.Mock).mockRejectedValue(new Error('offline'));
    const screen = renderScreen();
    await waitFor(() => expect(discoverPopularMovies).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Get started'));
    expect(screen.getByPlaceholderText('Your name')).toBeTruthy();
  });
});

describe('PosterWall', () => {
  it('never receives touches (it overlaps the buttons below it on Android)', () => {
    const { PosterWall } = require('../../Components/Regular/PosterWall');
    const screen = render(
      <ThemeProvider>
        <PosterWall posters={[]} height={300} />
      </ThemeProvider>,
    );
    expect(screen.toJSON()).toMatchObject({ props: { pointerEvents: 'none' } });
  });
});
