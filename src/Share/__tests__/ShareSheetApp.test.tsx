import React from 'react';
import { BackHandler, Linking } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShareSheetApp, CLOSE_AFTER_SAVE_MS } from '../ShareSheetApp';
import { dataManager } from '../../Manager/DataManager';
import { resolveReel, ReelError } from '../../API/reels';
import { MediaItem } from '../../Types';

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('../../API/reels', () => {
  const actual = jest.requireActual('../../API/reels');
  return { ...actual, resolveReel: jest.fn() };
});

const REEL = 'Look https://www.instagram.com/reel/DadPVipTIYM/?igsh=1';
const movie = (id: number, title: string): MediaItem => ({
  id, title, overview: '', posterPath: null, backdropPath: null, releaseDate: '2010-02-14',
  voteAverage: 8.2, genreIds: [], mediaType: 'movie', originalLanguage: 'en',
});
const candidate = (m: MediaItem) => ({ media: m, confidence: 0.9, matchedOn: 'phrase', query: m.title });

describe('Android share sheet', () => {
  let exitApp: jest.SpyInstance;
  let openURL: jest.SpyInstance;

  beforeEach(async () => {
    await AsyncStorage.clear();
    (resolveReel as jest.Mock).mockReset();
    exitApp = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => {});
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('lists the movies, saves the tapped one to the chosen list and closes', async () => {
    await dataManager.createUserProfile('Sam');
    (resolveReel as jest.Mock).mockResolvedValue({
      reelId: 'DadPVipTIYM', canonicalUrl: '', caption: '', author: '', thumbnail: '',
      candidates: [candidate(movie(11324, 'Shutter Island')), candidate(movie(1124, 'The Prestige'))],
    });

    const screen = render(<ShareSheetApp sharedText={REEL} />);
    await waitFor(() => expect(screen.getByText('Shutter Island')).toBeTruthy());
    expect(resolveReel).toHaveBeenCalledWith(REEL);

    fireEvent.press(screen.getByText('Watching'));
    jest.useFakeTimers();
    fireEvent.press(screen.getByLabelText('Add Shutter Island'));
    await act(async () => {
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getByText('Added to Currently Watching')).toBeTruthy());

    const saved = await dataManager.findItemByMediaId(11324);
    expect(saved?.status).toBe('watching');
    expect(exitApp).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(CLOSE_AFTER_SAVE_MS + 500));
    expect(exitApp).toHaveBeenCalled();
  });

  it('marks titles that are already saved and does not add them again', async () => {
    await dataManager.createUserProfile('Sam');
    await dataManager.addItem(movie(1124, 'The Prestige'), 'watched');
    (resolveReel as jest.Mock).mockResolvedValue({
      reelId: 'x', canonicalUrl: '', caption: '', author: '', thumbnail: '',
      candidates: [candidate(movie(1124, 'The Prestige'))],
    });

    const screen = render(<ShareSheetApp sharedText={REEL} />);
    await waitFor(() => expect(screen.getByText('Already in Watched')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('Add The Prestige'));
    expect((await dataManager.getAllItems()).length).toBe(1);
  });

  it('asks new users to set up the app first and hands the share over', async () => {
    const screen = render(<ShareSheetApp sharedText={REEL} />);
    await waitFor(() => expect(screen.getByText('Set up NextUP first')).toBeTruthy());
    expect(resolveReel).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Open NextUP'));
    expect(openURL).toHaveBeenCalledWith(`nextup://import?url=${encodeURIComponent(REEL)}`);
  });

  it('shows the reason and a way out when nothing is found', async () => {
    await dataManager.createUserProfile('Sam');
    (resolveReel as jest.Mock).mockRejectedValue(new ReelError('NO_MATCH', 'none'));

    const screen = render(<ShareSheetApp sharedText={REEL} />);
    await waitFor(() => expect(screen.getByText("Couldn't find a movie or show in this reel")).toBeTruthy());
    expect(screen.queryByText('Try again')).toBeNull(); // retrying won't help for NO_MATCH
    fireEvent.press(screen.getByText('Search in NextUP'));
    expect(openURL).toHaveBeenCalled();
  });

  it('rejects text without a reel link without calling the backend', async () => {
    await dataManager.createUserProfile('Sam');
    const screen = render(<ShareSheetApp sharedText="https://example.com/video" />);
    await waitFor(() => expect(screen.getByText("That doesn't look like an Instagram reel link")).toBeTruthy());
    expect(resolveReel).not.toHaveBeenCalled();
  });
});
