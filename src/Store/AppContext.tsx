import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { dataManager } from '../Manager/DataManager';
import { UserProfile, AppState, MediaItem, CollectionStatus, CollectionItem } from '../Types';
import { logger } from '../Utils/debugger';

interface AppContextType {
  appState: AppState | null;
  userProfile: UserProfile | null;
  isFirstLaunch: boolean;
  loading: boolean;
  error: string | null;
  refreshAppState: () => Promise<void>;
  setUserProfile: (profile: UserProfile | null) => void;
  // Collection management
  addToCollection: (mediaItem: MediaItem, status: CollectionStatus) => Promise<CollectionItem>;
  removeFromCollection: (itemId: string) => Promise<void>;
  updateItemStatus: (itemId: string, newStatus: CollectionStatus) => Promise<CollectionItem>;
  updateItemRating: (itemId: string, rating: number) => Promise<CollectionItem>;
  updateItemNotes: (itemId: string, notes: string) => Promise<CollectionItem>;
  updateItemProgress: (itemId: string, progress: number) => Promise<CollectionItem>;
  findItemByMediaId: (mediaId: number) => CollectionItem | null;
  getCollectionByStatus: (status: CollectionStatus) => CollectionItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  logger.debug('AppProvider', 'Initializing app provider');

  useEffect(() => {
    try {
      logger.debug('AppProvider', 'Setting up app initialization and listeners');
      loadAppState();
      
      // Listen to data changes
      const unsubscribe = dataManager.addListener((event) => {
        try {
          logger.debug('AppProvider', 'Data change event received', { eventType: event.type });
          
          if (event.type === 'PROFILE_UPDATED') {
            logger.debug('AppProvider', 'Updating profile in state');
            setAppState(prev => prev ? { ...prev, user: event.payload.profile } : null);
          } else if (event.type === 'ITEM_ADDED' || event.type === 'ITEM_REMOVED' || event.type === 'ITEM_UPDATED') {
            logger.debug('AppProvider', 'Refreshing app state due to collection change');
            refreshAppState();
          }
        } catch (error) {
          logger.error('AppProvider', 'Error handling data change event', error);
        }
      });

      return unsubscribe;
    } catch (error) {
      logger.error('AppProvider', 'Error in app provider useEffect', error);
      return undefined;
    }
  }, []);

  const loadAppState = async () => {
    try {
      logger.debug('AppProvider', 'Loading app state');
      setLoading(true);
      setError(null);
      const state = await dataManager.loadAppState();
      logger.info('AppProvider', 'App state loaded successfully', { hasUser: !!state?.user });
      setAppState(state);
    } catch (err) {
      logger.error('AppProvider', 'Failed to load app state', err);
      setError('Failed to load app data. Please restart the app.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAppState = async () => {
    try {
      logger.debug('AppProvider', 'Refreshing app state');
      await loadAppState();
    } catch (error) {
      logger.error('AppProvider', 'Error refreshing app state', error);
    }
  };

  const setUserProfile = (profile: UserProfile | null) => {
    try {
      logger.debug('AppProvider', 'Setting user profile');
      setAppState(prev => prev ? { ...prev, user: profile } : null);
    } catch (error) {
      logger.error('AppProvider', 'Error setting user profile', error);
    }
  };

  // Collection management methods
  const addToCollection = async (mediaItem: MediaItem, status: CollectionStatus): Promise<CollectionItem> => {
    try {
      logger.debug('AppProvider', 'Adding item to collection', { status, mediaId: mediaItem.id });
      const newItem = await dataManager.addItem(mediaItem, status);
      await refreshAppState();
      logger.info('AppProvider', 'Item added to collection', { itemId: newItem.id, status });
      return newItem;
    } catch (error) {
      logger.error('AppProvider', 'Error adding item to collection', error);
      throw error;
    }
  };

  const removeFromCollection = async (itemId: string): Promise<void> => {
    try {
      logger.debug('AppProvider', 'Removing item from collection', { itemId });
      await dataManager.removeItem(itemId);
      await refreshAppState();
      logger.info('AppProvider', 'Item removed from collection', { itemId });
    } catch (error) {
      logger.error('AppProvider', 'Error removing item from collection', error);
      throw error;
    }
  };

  const updateItemStatus = async (itemId: string, newStatus: CollectionStatus): Promise<CollectionItem> => {
    try {
      logger.debug('AppProvider', 'Updating item status', { itemId, newStatus });
      const updatedItem = await dataManager.updateItemStatus(itemId, newStatus);
      await refreshAppState();
      logger.info('AppProvider', 'Item status updated', { itemId, newStatus });
      return updatedItem;
    } catch (error) {
      logger.error('AppProvider', 'Error updating item status', error);
      throw error;
    }
  };

  const updateItemRating = async (itemId: string, rating: number): Promise<CollectionItem> => {
    try {
      logger.debug('AppProvider', 'Updating item rating', { itemId, rating });
      const updatedItem = await dataManager.updateItemRating(itemId, rating);
      await refreshAppState();
      logger.info('AppProvider', 'Item rating updated', { itemId, rating });
      return updatedItem;
    } catch (error) {
      logger.error('AppProvider', 'Error updating item rating', error);
      throw error;
    }
  };

  const updateItemNotes = async (itemId: string, notes: string): Promise<CollectionItem> => {
    try {
      logger.debug('AppProvider', 'Updating item notes', { itemId });
      const updatedItem = await dataManager.updateItemNotes(itemId, notes);
      await refreshAppState();
      logger.info('AppProvider', 'Item notes updated', { itemId });
      return updatedItem;
    } catch (error) {
      logger.error('AppProvider', 'Error updating item notes', error);
      throw error;
    }
  };

  const updateItemProgress = async (itemId: string, progress: number): Promise<CollectionItem> => {
    try {
      logger.debug('AppProvider', 'Updating item progress', { itemId, progress });
      const updatedItem = await dataManager.updateItemProgress(itemId, progress);
      await refreshAppState();
      logger.info('AppProvider', 'Item progress updated', { itemId, progress });
      return updatedItem;
    } catch (error) {
      logger.error('AppProvider', 'Error updating item progress', error);
      throw error;
    }
  };

  const findItemByMediaId = (mediaId: number): CollectionItem | null => {
    try {
      if (!appState?.collections) return null;
      
      const allItems = [
        ...appState.collections.watched,
        ...appState.collections.watching,
        ...appState.collections.will_watch,
      ];
      
      const found = allItems.find(item => item.mediaItem.id === mediaId) || null;
      logger.debug('AppProvider', 'Finding item by media ID', { mediaId, found: !!found });
      return found;
    } catch (error) {
      logger.error('AppProvider', 'Error finding item by media ID', error);
      return null;
    }
  };

  const getCollectionByStatus = (status: CollectionStatus): CollectionItem[] => {
    try {
      if (!appState?.collections) return [];
      logger.debug('AppProvider', 'Getting collection by status', { status, count: appState.collections[status]?.length });
      return appState.collections[status] || [];
    } catch (error) {
      logger.error('AppProvider', 'Error getting collection by status', error);
      return [];
    }
  };

  const contextValue: AppContextType = {
    appState,
    userProfile: appState?.user || null,
    isFirstLaunch: appState?.isFirstLaunch ?? true,
    loading,
    error,
    refreshAppState,
    setUserProfile,
    addToCollection,
    removeFromCollection,
    updateItemStatus,
    updateItemRating,
    updateItemNotes,
    updateItemProgress,
    findItemByMediaId,
    getCollectionByStatus,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};