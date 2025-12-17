import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { dataManager } from '../Manager/DataManager';
import { UserProfile, AppState, MediaItem, CollectionStatus, CollectionItem } from '../Types';

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

  useEffect(() => {
    loadAppState();
    
    // Listen to data changes
    const unsubscribe = dataManager.addListener((event) => {
      if (event.type === 'PROFILE_UPDATED') {
        setAppState(prev => prev ? { ...prev, user: event.payload.profile } : null);
      } else if (event.type === 'ITEM_ADDED' || event.type === 'ITEM_REMOVED' || event.type === 'ITEM_UPDATED') {
        // Refresh app state when collections change
        refreshAppState();
      }
    });

    return unsubscribe;
  }, []);

  const loadAppState = async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await dataManager.loadAppState();
      setAppState(state);
    } catch (err) {
      console.error('Failed to load app state:', err);
      setError('Failed to load app data. Please restart the app.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAppState = async () => {
    await loadAppState();
  };

  const setUserProfile = (profile: UserProfile | null) => {
    setAppState(prev => prev ? { ...prev, user: profile } : null);
  };

  // Collection management methods
  const addToCollection = async (mediaItem: MediaItem, status: CollectionStatus): Promise<CollectionItem> => {
    const newItem = await dataManager.addItem(mediaItem, status);
    await refreshAppState(); // Refresh to get updated collections
    return newItem;
  };

  const removeFromCollection = async (itemId: string): Promise<void> => {
    await dataManager.removeItem(itemId);
    await refreshAppState(); // Refresh to get updated collections
  };

  const updateItemStatus = async (itemId: string, newStatus: CollectionStatus): Promise<CollectionItem> => {
    const updatedItem = await dataManager.updateItemStatus(itemId, newStatus);
    await refreshAppState(); // Refresh to get updated collections
    return updatedItem;
  };

  const updateItemRating = async (itemId: string, rating: number): Promise<CollectionItem> => {
    const updatedItem = await dataManager.updateItemRating(itemId, rating);
    await refreshAppState(); // Refresh to get updated collections
    return updatedItem;
  };

  const updateItemNotes = async (itemId: string, notes: string): Promise<CollectionItem> => {
    const updatedItem = await dataManager.updateItemNotes(itemId, notes);
    await refreshAppState(); // Refresh to get updated collections
    return updatedItem;
  };

  const updateItemProgress = async (itemId: string, progress: number): Promise<CollectionItem> => {
    const updatedItem = await dataManager.updateItemProgress(itemId, progress);
    await refreshAppState(); // Refresh to get updated collections
    return updatedItem;
  };

  const findItemByMediaId = (mediaId: number): CollectionItem | null => {
    if (!appState?.collections) return null;
    
    const allItems = [
      ...appState.collections.watched,
      ...appState.collections.watching,
      ...appState.collections.will_watch,
    ];
    
    return allItems.find(item => item.mediaItem.id === mediaId) || null;
  };

  const getCollectionByStatus = (status: CollectionStatus): CollectionItem[] => {
    if (!appState?.collections) return [];
    return appState.collections[status] || [];
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