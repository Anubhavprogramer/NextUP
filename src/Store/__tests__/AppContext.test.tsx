import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider, useApp } from '../AppContext';
import { dataManager } from '../../Manager/DataManager';
import { MediaItem } from '../../Types';

const movie: MediaItem = {
  id: 42,
  title: 'Inception',
  overview: '',
  posterPath: null,
  backdropPath: null,
  releaseDate: '2010-07-16',
  voteAverage: 8.4,
  genreIds: [],
  mediaType: 'movie',
  originalLanguage: 'en',
};

describe('AppProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  // AppNavigator unmounts the NavigationContainer while `loading` is true, so
  // collection changes must refresh state without flipping it back on.
  it('does not re-enter loading when the collection changes', async () => {
    const loadingHistory: boolean[] = [];
    let ctx: ReturnType<typeof useApp> | undefined;

    const Probe = () => {
      ctx = useApp();
      loadingHistory.push(ctx.loading);
      return null;
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AppProvider>
          <Probe />
        </AppProvider>,
      );
    });
    expect(ctx!.loading).toBe(false);
    const rendersBeforeAdd = loadingHistory.length;

    // Hold every post-add reload open so any intermediate render (e.g. a
    // loading=true flash) is committed instead of being batched away by act().
    let openGate!: () => void;
    const gate = new Promise<void>(resolve => { openGate = resolve; });
    const realLoad = dataManager.loadAppState.bind(dataManager);
    const loadSpy = jest
      .spyOn(dataManager, 'loadAppState')
      .mockImplementation(async () => {
        await gate;
        return realLoad();
      });

    let addPromise!: Promise<unknown>;
    await ReactTestRenderer.act(async () => {
      addPromise = ctx!.addToCollection(movie, 'will_watch');
      while (loadSpy.mock.calls.length === 0) {
        await new Promise<void>(resolve => setTimeout(resolve, 0));
      }
    });
    await ReactTestRenderer.act(async () => {
      openGate();
      await addPromise;
    });
    loadSpy.mockRestore();

    expect(loadingHistory.slice(rendersBeforeAdd)).not.toContain(true);
    expect(ctx!.findItemByMediaId(42)?.status).toBe('will_watch');
  });
});
