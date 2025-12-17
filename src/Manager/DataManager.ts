import { 
  UserProfile, 
  CollectionItem, 
  MediaItem, 
  CollectionStatus, 
  CollectionOperations,
  AppState,
  STORAGE_KEYS,
  StorageError,
  DataChangeEvent,
  DataChangeListener,
  CollectionItemUpdate,
  isUserProfile,
  isCollectionItem,
  ValidationResult,
  VALIDATION_CONSTANTS
} from '../Types';
import { storageManager } from './StorageManager';
import { 
  generateId, 
  createCollectionItem, 
  updateCollectionItemStatus,
  validateUserProfile,
  isMediaInCollection,
  findCollectionItemByMediaId
} from '../Utils/helpers';

/**
 * Data manager for handling user profiles and collections
 * Provides high-level operations with validation and event handling
 */
export class DataManager implements CollectionOperations {
  private static instance: DataManager;
  private listeners: DataChangeListener[] = [];
  private cachedAppState: AppState | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // ========== Event Management ==========

  /**
   * Add data change listener
   */
  addListener(listener: DataChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit data change event
   */
  private emitChange(event: DataChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Error in data change listener:', error);
      }
    });
  }

  // ========== App State Management ==========

  /**
   * Load complete app state
   */
  async loadAppState(): Promise<AppState> {
    try {
      const [user, collections, isFirstLaunch] = await Promise.all([
        this.getUserProfile(),
        this.getAllCollections(),
        this.isFirstLaunch(),
      ]);

      const appState: AppState = {
        user,
        collections,
        theme: 'system', // Theme is managed by ThemeContext
        isFirstLaunch,
      };

      this.cachedAppState = appState;
      return appState;
    } catch (error) {
      throw new StorageError(
        `Failed to load app state: ${error}`,
        'LOAD_STATE_ERROR'
      );
    }
  }

  /**
   * Save complete app state
   */
  async saveAppState(appState: Partial<AppState>): Promise<void> {
    try {
      const operations: Promise<void>[] = [];

      if (appState.user !== undefined) {
        operations.push(this.saveUserProfile(appState.user));
      }

      if (appState.collections !== undefined) {
        operations.push(this.saveAllCollections(appState.collections));
      }

      if (appState.isFirstLaunch !== undefined) {
        operations.push(
          storageManager.set(STORAGE_KEYS.IS_FIRST_LAUNCH, appState.isFirstLaunch)
        );
      }

      await Promise.all(operations);

      // Update cached state
      if (this.cachedAppState) {
        this.cachedAppState = { ...this.cachedAppState, ...appState };
      }
    } catch (error) {
      throw new StorageError(
        `Failed to save app state: ${error}`,
        'SAVE_STATE_ERROR'
      );
    }
  }

  // ========== User Profile Management ==========

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profile = await storageManager.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      
      if (profile && !isUserProfile(profile)) {
        console.warn('Invalid user profile data found, clearing...');
        await storageManager.remove(STORAGE_KEYS.USER_PROFILE);
        return null;
      }

      return profile;
    } catch (error) {
      throw new StorageError(
        `Failed to get user profile: ${error}`,
        'GET_PROFILE_ERROR'
      );
    }
  }

  /**
   * Save user profile
   */
  async saveUserProfile(profile: UserProfile | null): Promise<void> {
    try {
      if (profile === null) {
        await storageManager.remove(STORAGE_KEYS.USER_PROFILE);
      } else {
        // Validate profile before saving
        const validation = this.validateUserProfile(profile);
        if (!validation.isValid) {
          throw new StorageError(
            `Invalid profile data: ${validation.errors.join(', ')}`,
            'INVALID_PROFILE_DATA'
          );
        }

        await storageManager.set(STORAGE_KEYS.USER_PROFILE, profile);
      }

      this.emitChange({
        type: 'PROFILE_UPDATED',
        payload: { profile: profile! },
      });
    } catch (error) {
      throw new StorageError(
        `Failed to save user profile: ${error}`,
        'SAVE_PROFILE_ERROR'
      );
    }
  }

  /**
   * Create new user profile
   */
  async createUserProfile(
    name: string,
    age: number,
    preferredGenres: number[]
  ): Promise<UserProfile> {
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: generateId(),
      name: name.trim(),
      age,
      preferredGenres,
      createdAt: now,
      updatedAt: now,
    };

    await this.saveUserProfile(profile);
    return profile;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): Promise<UserProfile> {
    const currentProfile = await this.getUserProfile();
    if (!currentProfile) {
      throw new StorageError('No user profile found to update', 'PROFILE_NOT_FOUND');
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  /**
   * Check if this is first launch
   */
  async isFirstLaunch(): Promise<boolean> {
    try {
      const isFirst = await storageManager.get<boolean>(STORAGE_KEYS.IS_FIRST_LAUNCH);
      return isFirst !== false; // Default to true if not set
    } catch (error) {
      console.warn('Failed to check first launch status:', error);
      return true; // Default to first launch on error
    }
  }

  /**
   * Mark first launch as complete
   */
  async completeFirstLaunch(): Promise<void> {
    await storageManager.set(STORAGE_KEYS.IS_FIRST_LAUNCH, false);
  }

  // ========== Collection Management ==========

  /**
   * Get all collections
   */
  async getAllCollections(): Promise<{
    watched: CollectionItem[];
    watching: CollectionItem[];
    will_watch: CollectionItem[];
  }> {
    try {
      const collections = await storageManager.get<{
        watched: CollectionItem[];
        watching: CollectionItem[];
        will_watch: CollectionItem[];
      }>(STORAGE_KEYS.COLLECTIONS);

      if (!collections) {
        return {
          watched: [],
          watching: [],
          will_watch: [],
        };
      }

      // Validate and filter invalid items
      const validatedCollections = {
        watched: collections.watched?.filter(isCollectionItem) || [],
        watching: collections.watching?.filter(isCollectionItem) || [],
        will_watch: collections.will_watch?.filter(isCollectionItem) || [],
      };

      return validatedCollections;
    } catch (error) {
      throw new StorageError(
        `Failed to get collections: ${error}`,
        'GET_COLLECTIONS_ERROR'
      );
    }
  }

  /**
   * Save all collections
   */
  async saveAllCollections(collections: {
    watched: CollectionItem[];
    watching: CollectionItem[];
    will_watch: CollectionItem[];
  }): Promise<void> {
    try {
      await storageManager.set(STORAGE_KEYS.COLLECTIONS, collections);
    } catch (error) {
      throw new StorageError(
        `Failed to save collections: ${error}`,
        'SAVE_COLLECTIONS_ERROR'
      );
    }
  }

  /**
   * Add item to collection
   */
  async addItem(mediaItem: MediaItem, status: CollectionStatus): Promise<CollectionItem> {
    try {
      const collections = await this.getAllCollections();
      
      // Check if item already exists in any collection
      const existingItem = await this.findItemByMediaId(mediaItem.id);
      if (existingItem) {
        throw new StorageError(
          'Media item already exists in collection',
          'DUPLICATE_ITEM'
        );
      }

      const newItem = createCollectionItem(mediaItem, status);
      collections[status].push(newItem);

      await this.saveAllCollections(collections);

      this.emitChange({
        type: 'ITEM_ADDED',
        payload: { item: newItem },
      });

      return newItem;
    } catch (error) {
      throw new StorageError(
        `Failed to add item to collection: ${error}`,
        'ADD_ITEM_ERROR'
      );
    }
  }

  /**
   * Remove item from collection
   */
  async removeItem(itemId: string): Promise<void> {
    try {
      const collections = await this.getAllCollections();
      let itemRemoved = false;

      // Remove from all collections
      Object.keys(collections).forEach(status => {
        const collection = collections[status as CollectionStatus];
        const index = collection.findIndex(item => item.id === itemId);
        if (index > -1) {
          collection.splice(index, 1);
          itemRemoved = true;
        }
      });

      if (!itemRemoved) {
        throw new StorageError('Item not found in any collection', 'ITEM_NOT_FOUND');
      }

      await this.saveAllCollections(collections);

      this.emitChange({
        type: 'ITEM_REMOVED',
        payload: { itemId },
      });
    } catch (error) {
      throw new StorageError(
        `Failed to remove item: ${error}`,
        'REMOVE_ITEM_ERROR'
      );
    }
  }

  /**
   * Update item status (move between collections)
   */
  async updateItemStatus(itemId: string, newStatus: CollectionStatus): Promise<CollectionItem> {
    try {
      const collections = await this.getAllCollections();
      let item: CollectionItem | null = null;

      // Find and remove item from current collection
      Object.keys(collections).forEach(status => {
        const collection = collections[status as CollectionStatus];
        const index = collection.findIndex(i => i.id === itemId);
        if (index > -1) {
          item = collection.splice(index, 1)[0];
        }
      });

      if (!item) {
        throw new StorageError('Item not found', 'ITEM_NOT_FOUND');
      }

      // Update item status and add to new collection
      const updatedItem = updateCollectionItemStatus(item, newStatus);
      collections[newStatus].push(updatedItem);

      await this.saveAllCollections(collections);

      this.emitChange({
        type: 'ITEM_UPDATED',
        payload: { item: updatedItem },
      });

      return updatedItem;
    } catch (error) {
      throw new StorageError(
        `Failed to update item status: ${error}`,
        'UPDATE_STATUS_ERROR'
      );
    }
  }

  /**
   * Update item rating
   */
  async updateItemRating(itemId: string, rating: number): Promise<CollectionItem> {
    if (rating < VALIDATION_CONSTANTS.MIN_RATING || rating > VALIDATION_CONSTANTS.MAX_RATING) {
      throw new StorageError(
        `Rating must be between ${VALIDATION_CONSTANTS.MIN_RATING} and ${VALIDATION_CONSTANTS.MAX_RATING}`,
        'INVALID_RATING'
      );
    }

    return this.updateItemField(itemId, { userRating: rating });
  }

  /**
   * Update item notes
   */
  async updateItemNotes(itemId: string, notes: string): Promise<CollectionItem> {
    if (notes.length > VALIDATION_CONSTANTS.MAX_NOTES_LENGTH) {
      throw new StorageError(
        `Notes cannot exceed ${VALIDATION_CONSTANTS.MAX_NOTES_LENGTH} characters`,
        'NOTES_TOO_LONG'
      );
    }

    return this.updateItemField(itemId, { notes: notes.trim() });
  }

  /**
   * Update item progress
   */
  async updateItemProgress(itemId: string, progress: number): Promise<CollectionItem> {
    if (progress < VALIDATION_CONSTANTS.MIN_PROGRESS || progress > VALIDATION_CONSTANTS.MAX_PROGRESS) {
      throw new StorageError(
        `Progress must be between ${VALIDATION_CONSTANTS.MIN_PROGRESS} and ${VALIDATION_CONSTANTS.MAX_PROGRESS}`,
        'INVALID_PROGRESS'
      );
    }

    return this.updateItemField(itemId, { progress });
  }

  /**
   * Get items by status
   */
  async getItemsByStatus(status: CollectionStatus): Promise<CollectionItem[]> {
    const collections = await this.getAllCollections();
    return collections[status] || [];
  }

  /**
   * Find item by media ID
   */
  async findItemByMediaId(mediaId: number): Promise<CollectionItem | null> {
    const collections = await this.getAllCollections();
    
    for (const status of Object.keys(collections) as CollectionStatus[]) {
      const item = findCollectionItemByMediaId(mediaId, collections[status]);
      if (item) {
        return item;
      }
    }
    
    return null;
  }

  /**
   * Get all items across collections
   */
  async getAllItems(): Promise<CollectionItem[]> {
    const collections = await this.getAllCollections();
    return [
      ...collections.watched,
      ...collections.watching,
      ...collections.will_watch,
    ];
  }

  /**
   * Clear collection by status
   */
  async clearCollection(status: CollectionStatus): Promise<void> {
    try {
      const collections = await this.getAllCollections();
      collections[status] = [];
      
      await this.saveAllCollections(collections);

      this.emitChange({
        type: 'COLLECTION_CLEARED',
        payload: { status },
      });
    } catch (error) {
      throw new StorageError(
        `Failed to clear collection: ${error}`,
        'CLEAR_COLLECTION_ERROR'
      );
    }
  }

  // ========== Private Helper Methods ==========

  /**
   * Update a specific field of a collection item
   */
  private async updateItemField(
    itemId: string, 
    updates: CollectionItemUpdate
  ): Promise<CollectionItem> {
    try {
      const collections = await this.getAllCollections();
      let item: CollectionItem | null = null;
      let collectionStatus: CollectionStatus | null = null;

      // Find item in collections
      Object.keys(collections).forEach(status => {
        const collection = collections[status as CollectionStatus];
        const foundItem = collection.find(i => i.id === itemId);
        if (foundItem) {
          item = foundItem;
          collectionStatus = status as CollectionStatus;
        }
      });

      if (!item || !collectionStatus) {
        throw new StorageError('Item not found', 'ITEM_NOT_FOUND');
      }

      // Update item
      const updatedItem: CollectionItem = {
        ...item,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Replace item in collection
      const collection = collections[collectionStatus];
      const index = collection.findIndex(i => i.id === itemId);
      collection[index] = updatedItem;

      await this.saveAllCollections(collections);

      this.emitChange({
        type: 'ITEM_UPDATED',
        payload: { item: updatedItem },
      });

      return updatedItem;
    } catch (error) {
      throw new StorageError(
        `Failed to update item field: ${error}`,
        'UPDATE_FIELD_ERROR'
      );
    }
  }

  /**
   * Validate user profile data
   */
  private validateUserProfile(profile: UserProfile): ValidationResult {
    const errors: string[] = [];

    if (!profile.name || profile.name.trim().length < VALIDATION_CONSTANTS.MIN_NAME_LENGTH) {
      errors.push('Name is required');
    }

    if (profile.name && profile.name.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`);
    }

    if (!profile.age || profile.age < VALIDATION_CONSTANTS.MIN_AGE || profile.age > VALIDATION_CONSTANTS.MAX_AGE) {
      errors.push(`Age must be between ${VALIDATION_CONSTANTS.MIN_AGE} and ${VALIDATION_CONSTANTS.MAX_AGE}`);
    }

    if (!profile.preferredGenres || profile.preferredGenres.length === 0) {
      errors.push('At least one preferred genre is required');
    }

    if (!profile.id || !profile.createdAt || !profile.updatedAt) {
      errors.push('Profile is missing required system fields');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance();