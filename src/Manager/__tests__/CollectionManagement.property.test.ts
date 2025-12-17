/**
 * Property-based tests for collection management functionality
 * Feature: media-tracker, Property 4: Collection item management
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5
 */

import * as fc from 'fast-check';
import { DataManager } from '../DataManager';
import { storageManager } from '../StorageManager';
import { MediaItem, CollectionStatus, CollectionItem } from '../../Types';
import { generateId } from '../../Utils/helpers';

// Test generators
const mediaTypeArb = fc.constantFrom('movie', 'tv');

// Use a counter to ensure unique IDs across all tests
let mediaIdCounter = 1;

const mediaItemArb: fc.Arbitrary<MediaItem> = fc.record({
  id: fc.integer({ min: 1000000, max: 9999999 }), // Use large range to avoid collisions
  title: fc.string({ minLength: 2, maxLength: 100 }), // Avoid single space titles
  overview: fc.string({ maxLength: 500 }),
  posterPath: fc.oneof(fc.constant(null), fc.string({ minLength: 1 })),
  backdropPath: fc.oneof(fc.constant(null), fc.string({ minLength: 1 })),
  releaseDate: fc.date({ min: new Date('1900-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString().split('T')[0]),
  voteAverage: fc.float({ min: 0, max: 10 }),
  genreIds: fc.array(fc.integer({ min: 1, max: 50 }), { maxLength: 5 }),
  mediaType: mediaTypeArb,
  originalLanguage: fc.constantFrom('en', 'es', 'fr', 'de', 'ja'),
}).map(item => ({ ...item, id: mediaIdCounter++ })); // Ensure unique IDs

const collectionStatusArb: fc.Arbitrary<CollectionStatus> = fc.constantFrom(
  'watched',
  'watching',
  'will_watch'
);

describe('Collection Management Property Tests', () => {
  let testDataManager: DataManager;

  beforeEach(async () => {
    // Clear storage before each test
    await storageManager.clear();
    // Reset the media ID counter for each test
    mediaIdCounter = Math.floor(Math.random() * 1000000) + 1000000;
    // Create a fresh DataManager instance for each test
    testDataManager = DataManager.getInstance();
    // Clear any cached state
    (testDataManager as any).cachedAppState = null;
  });

  afterEach(async () => {
    // Clean up after each test
    await storageManager.clear();
  });

  /**
   * Property 4.1: Adding items to collection preserves item data
   * For any valid media item and collection status, adding the item should
   * result in a collection item that contains the original media data
   */
  test('adding items preserves media data', async () => {
    await fc.assert(
      fc.asyncProperty(mediaItemArb, collectionStatusArb, async (mediaItem, status) => {
        // Add item to collection
        const collectionItem = await testDataManager.addItem(mediaItem, status);

        // Verify the collection item contains the original media data
        expect(collectionItem.mediaItem).toEqual(mediaItem);
        expect(collectionItem.status).toBe(status);
        expect(collectionItem.id).toBeDefined();
        expect(collectionItem.addedAt).toBeDefined();
        expect(collectionItem.updatedAt).toBeDefined();

        // Verify item can be found by media ID
        const foundItem = await testDataManager.findItemByMediaId(mediaItem.id);
        expect(foundItem).toEqual(collectionItem);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4.2: Collection status changes preserve media data
   * For any collection item, changing its status should preserve all media data
   * while updating the status and timestamps
   */
  test('status changes preserve media data', async () => {
    await fc.assert(
      fc.asyncProperty(
        mediaItemArb,
        collectionStatusArb,
        collectionStatusArb,
        async (mediaItem, initialStatus, newStatus) => {
          // Add item with initial status
          const originalItem = await testDataManager.addItem(mediaItem, initialStatus);

          // Change status
          const updatedItem = await testDataManager.updateItemStatus(originalItem.id, newStatus);

          // Verify media data is preserved
          expect(updatedItem.mediaItem).toEqual(mediaItem);
          expect(updatedItem.status).toBe(newStatus);
          expect(updatedItem.id).toBe(originalItem.id);
          expect(updatedItem.addedAt).toBe(originalItem.addedAt);
          expect(new Date(updatedItem.updatedAt).getTime()).toBeGreaterThanOrEqual(
            new Date(originalItem.updatedAt).getTime()
          );

          // Verify item is in correct collection
          const itemsByStatus = await testDataManager.getItemsByStatus(newStatus);
          expect(itemsByStatus.some(item => item.id === updatedItem.id)).toBe(true);

          // Verify item is not in old collection (unless same status)
          if (initialStatus !== newStatus) {
            const oldStatusItems = await testDataManager.getItemsByStatus(initialStatus);
            expect(oldStatusItems.some(item => item.id === updatedItem.id)).toBe(false);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4.3: Duplicate prevention works correctly
   * For any media item, attempting to add it twice should fail on the second attempt
   */
  test('duplicate prevention works correctly', async () => {
    await fc.assert(
      fc.asyncProperty(mediaItemArb, collectionStatusArb, async (mediaItem, status) => {
        // Add item first time - should succeed
        const firstItem = await testDataManager.addItem(mediaItem, status);
        expect(firstItem).toBeDefined();

        // Attempt to add same media item again - should fail
        await expect(testDataManager.addItem(mediaItem, status)).rejects.toThrow('Media item already exists');

        // Verify only one item exists
        const foundItem = await testDataManager.findItemByMediaId(mediaItem.id);
        expect(foundItem).toEqual(firstItem);
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4.4: Remove item completely removes from all collections
   * For any collection item, removing it should make it unfindable in any collection
   */
  test('remove item completely removes from collections', async () => {
    await fc.assert(
      fc.asyncProperty(mediaItemArb, collectionStatusArb, async (mediaItem, status) => {
        // Add item
        const collectionItem = await testDataManager.addItem(mediaItem, status);

        // Remove item
        await testDataManager.removeItem(collectionItem.id);

        // Verify item is not found by ID
        const foundItem = await testDataManager.findItemByMediaId(mediaItem.id);
        expect(foundItem).toBeNull();

        // Verify item is not in any collection
        const allStatuses: CollectionStatus[] = ['watched', 'watching', 'will_watch'];
        for (const checkStatus of allStatuses) {
          const items = await testDataManager.getItemsByStatus(checkStatus);
          expect(items.some(item => item.id === collectionItem.id)).toBe(false);
        }
      }),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4.5: Collection operations maintain data consistency
   * For any collection item, it should appear in exactly one collection
   */
  test('collection operations maintain data consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        mediaItemArb,
        collectionStatusArb,
        async (mediaItem, status) => {
          // Add item
          const addedItem = await testDataManager.addItem(mediaItem, status);

          // Verify item appears in exactly one collection
          const watched = await testDataManager.getItemsByStatus('watched');
          const watching = await testDataManager.getItemsByStatus('watching');
          const willWatch = await testDataManager.getItemsByStatus('will_watch');

          const watchedCount = watched.filter(i => i.id === addedItem.id).length;
          const watchingCount = watching.filter(i => i.id === addedItem.id).length;
          const willWatchCount = willWatch.filter(i => i.id === addedItem.id).length;

          // Item should appear exactly once across all collections
          expect(watchedCount + watchingCount + willWatchCount).toBe(1);

          // Item should be in the correct collection
          if (status === 'watched') {
            expect(watchedCount).toBe(1);
            expect(watchingCount).toBe(0);
            expect(willWatchCount).toBe(0);
          } else if (status === 'watching') {
            expect(watchedCount).toBe(0);
            expect(watchingCount).toBe(1);
            expect(willWatchCount).toBe(0);
          } else if (status === 'will_watch') {
            expect(watchedCount).toBe(0);
            expect(watchingCount).toBe(0);
            expect(willWatchCount).toBe(1);
          }

          // Verify getAllItems returns the same total
          const allItems = await testDataManager.getAllItems();
          expect(allItems.length).toBe(watched.length + watching.length + willWatch.length);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4.6: Rating updates preserve other data
   * For any collection item, updating the rating should only change the rating
   * and updatedAt timestamp while preserving all other data
   */
  test('rating updates preserve other data', async () => {
    await fc.assert(
      fc.asyncProperty(
        mediaItemArb,
        collectionStatusArb,
        fc.integer({ min: 1, max: 10 }),
        async (mediaItem, status, rating) => {
          // Add item
          const originalItem = await testDataManager.addItem(mediaItem, status);

          // Update rating
          const updatedItem = await testDataManager.updateItemRating(originalItem.id, rating);

          // Verify only rating and updatedAt changed
          expect(updatedItem.mediaItem).toEqual(originalItem.mediaItem);
          expect(updatedItem.status).toBe(originalItem.status);
          expect(updatedItem.id).toBe(originalItem.id);
          expect(updatedItem.addedAt).toBe(originalItem.addedAt);
          expect(updatedItem.userRating).toBe(rating);
          expect(new Date(updatedItem.updatedAt).getTime()).toBeGreaterThanOrEqual(
            new Date(originalItem.updatedAt).getTime()
          );

          // Verify other optional fields are preserved
          expect(updatedItem.notes).toBe(originalItem.notes);
          expect(updatedItem.progress).toBe(originalItem.progress);
          expect(updatedItem.watchedDate).toBe(originalItem.watchedDate);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4.7: Notes updates preserve other data
   * For any collection item, updating notes should only change notes and updatedAt
   */
  test('notes updates preserve other data', async () => {
    await fc.assert(
      fc.asyncProperty(
        mediaItemArb,
        collectionStatusArb,
        fc.string({ maxLength: 500 }),
        async (mediaItem, status, notes) => {
          // Add item
          const originalItem = await testDataManager.addItem(mediaItem, status);

          // Update notes
          const updatedItem = await testDataManager.updateItemNotes(originalItem.id, notes);

          // Verify only notes and updatedAt changed
          expect(updatedItem.mediaItem).toEqual(originalItem.mediaItem);
          expect(updatedItem.status).toBe(originalItem.status);
          expect(updatedItem.id).toBe(originalItem.id);
          expect(updatedItem.addedAt).toBe(originalItem.addedAt);
          expect(updatedItem.notes).toBe(notes.trim());
          expect(new Date(updatedItem.updatedAt).getTime()).toBeGreaterThanOrEqual(
            new Date(originalItem.updatedAt).getTime()
          );

          // Verify other fields are preserved
          expect(updatedItem.userRating).toBe(originalItem.userRating);
          expect(updatedItem.progress).toBe(originalItem.progress);
          expect(updatedItem.watchedDate).toBe(originalItem.watchedDate);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4.8: Progress updates preserve other data
   * For any collection item, updating progress should only change progress and updatedAt
   */
  test('progress updates preserve other data', async () => {
    await fc.assert(
      fc.asyncProperty(
        mediaItemArb,
        collectionStatusArb,
        fc.integer({ min: 0, max: 100 }),
        async (mediaItem, status, progress) => {
          // Add item
          const originalItem = await testDataManager.addItem(mediaItem, status);

          // Update progress
          const updatedItem = await testDataManager.updateItemProgress(originalItem.id, progress);

          // Verify only progress and updatedAt changed
          expect(updatedItem.mediaItem).toEqual(originalItem.mediaItem);
          expect(updatedItem.status).toBe(originalItem.status);
          expect(updatedItem.id).toBe(originalItem.id);
          expect(updatedItem.addedAt).toBe(originalItem.addedAt);
          expect(updatedItem.progress).toBe(progress);
          expect(new Date(updatedItem.updatedAt).getTime()).toBeGreaterThanOrEqual(
            new Date(originalItem.updatedAt).getTime()
          );

          // Verify other fields are preserved
          expect(updatedItem.userRating).toBe(originalItem.userRating);
          expect(updatedItem.notes).toBe(originalItem.notes);
          expect(updatedItem.watchedDate).toBe(originalItem.watchedDate);
        }
      ),
      { numRuns: 30 }
    );
  });
});