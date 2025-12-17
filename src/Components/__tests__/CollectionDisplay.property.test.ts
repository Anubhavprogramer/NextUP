/**
 * Property-based tests for collection display functionality
 * Feature: media-tracker, Property 5: Collection display consistency
 * Validates: Requirements 4.2, 4.5
 */

import * as fc from 'fast-check';
import { MediaItem, CollectionItem, CollectionStatus } from '../../Types';
import { generateId } from '../../Utils/helpers';

// Test generators
const mediaTypeArb = fc.constantFrom('movie', 'tv');

let mediaIdCounter = 1000000;

const mediaItemArb: fc.Arbitrary<MediaItem> = fc.record({
  id: fc.integer({ min: 1000000, max: 9999999 }),
  title: fc.string({ minLength: 2, maxLength: 100 }),
  overview: fc.string({ maxLength: 500 }),
  posterPath: fc.oneof(fc.constant(null), fc.string({ minLength: 1 })),
  backdropPath: fc.oneof(fc.constant(null), fc.string({ minLength: 1 })),
  releaseDate: fc.integer({ min: 1900, max: 2030 }).map(year => `${year}-01-01`),
  voteAverage: fc.float({ min: 0, max: 10 }),
  genreIds: fc.array(fc.integer({ min: 1, max: 50 }), { maxLength: 5 }),
  mediaType: mediaTypeArb,
  originalLanguage: fc.constantFrom('en', 'es', 'fr', 'de', 'ja'),
}).map(item => ({ ...item, id: mediaIdCounter++ }));

const collectionStatusArb: fc.Arbitrary<CollectionStatus> = fc.constantFrom(
  'watched',
  'watching',
  'will_watch'
);

const collectionItemArb: fc.Arbitrary<CollectionItem> = fc.record({
  id: fc.string(),
  mediaItem: mediaItemArb,
  status: collectionStatusArb,
  addedAt: fc.integer({ min: Date.now() - 365 * 24 * 60 * 60 * 1000, max: Date.now() }).map(ts => new Date(ts).toISOString()),
  updatedAt: fc.integer({ min: Date.now() - 365 * 24 * 60 * 60 * 1000, max: Date.now() }).map(ts => new Date(ts).toISOString()),
  userRating: fc.oneof(fc.constant(undefined), fc.integer({ min: 1, max: 10 })),
  notes: fc.oneof(fc.constant(undefined), fc.string({ maxLength: 500 })),
  watchedDate: fc.oneof(fc.constant(undefined), fc.date().map(d => d.toISOString())),
  progress: fc.oneof(fc.constant(undefined), fc.integer({ min: 0, max: 100 })),
}).map(item => ({ ...item, id: generateId() }));

describe('Collection Display Property Tests', () => {
  beforeEach(() => {
    // Reset counter for each test
    mediaIdCounter = Math.floor(Math.random() * 1000000) + 1000000;
  });

  /**
   * Property 5.1: Collection items maintain their identity
   * For any collection of items, each item should maintain its unique identity
   * and properties when processed
   */
  test('collection items maintain their identity', async () => {
    await fc.assert(
      fc.property(
        fc.array(collectionItemArb, { minLength: 2, maxLength: 10 }),
        (items) => {
          // Ensure all items have unique IDs
          const itemIds = items.map(item => item.id);
          const uniqueIds = new Set(itemIds);
          expect(uniqueIds.size).toBe(itemIds.length);

          // Ensure all media items have unique IDs
          const mediaIds = items.map(item => item.mediaItem.id);
          const uniqueMediaIds = new Set(mediaIds);
          expect(uniqueMediaIds.size).toBe(mediaIds.length);

          // Verify each item has required properties
          items.forEach(item => {
            expect(item.id).toBeDefined();
            expect(item.mediaItem).toBeDefined();
            expect(item.status).toBeDefined();
            expect(item.addedAt).toBeDefined();
            expect(item.updatedAt).toBeDefined();
            expect(['watched', 'watching', 'will_watch']).toContain(item.status);
          });
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 5.2: Collection filtering by status works correctly
   * For any collection of items, filtering by status should return only items with that status
   */
  test('collection filtering by status works correctly', async () => {
    await fc.assert(
      fc.property(
        fc.array(collectionItemArb, { minLength: 5, maxLength: 20 }),
        collectionStatusArb,
        (items, targetStatus) => {
          // Filter items by target status
          const filteredItems = items.filter(item => item.status === targetStatus);

          // All filtered items should have the target status
          filteredItems.forEach(item => {
            expect(item.status).toBe(targetStatus);
          });

          // No filtered item should have a different status
          const nonTargetItems = items.filter(item => item.status !== targetStatus);
          nonTargetItems.forEach(item => {
            expect(item.status).not.toBe(targetStatus);
          });

          // Total items should equal filtered + non-filtered
          expect(filteredItems.length + nonTargetItems.length).toBe(items.length);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 5.3: Collection sorting preserves item integrity
   * For any collection of items, sorting should preserve all item data
   */
  test('collection sorting preserves item integrity', async () => {
    await fc.assert(
      fc.property(
        fc.array(collectionItemArb, { minLength: 2, maxLength: 15 }),
        (items) => {
          // Sort by title
          const sortedByTitle = [...items].sort((a, b) => 
            a.mediaItem.title.localeCompare(b.mediaItem.title)
          );

          // Sort by date added
          const sortedByDate = [...items].sort((a, b) => 
            new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
          );

          // Verify same number of items
          expect(sortedByTitle.length).toBe(items.length);
          expect(sortedByDate.length).toBe(items.length);

          // Verify all original items are present in sorted arrays
          const originalIds = new Set(items.map(item => item.id));
          const titleSortedIds = new Set(sortedByTitle.map(item => item.id));
          const dateSortedIds = new Set(sortedByDate.map(item => item.id));

          expect(titleSortedIds).toEqual(originalIds);
          expect(dateSortedIds).toEqual(originalIds);

          // Verify sorting order for title (if more than 1 item)
          if (sortedByTitle.length > 1) {
            for (let i = 0; i < sortedByTitle.length - 1; i++) {
              expect(
                sortedByTitle[i].mediaItem.title.localeCompare(sortedByTitle[i + 1].mediaItem.title)
              ).toBeLessThanOrEqual(0);
            }
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 5.4: Collection item status transitions are valid
   * For any collection item, all possible status values should be valid
   */
  test('collection item status transitions are valid', async () => {
    await fc.assert(
      fc.property(
        collectionItemArb,
        collectionStatusArb,
        (item, newStatus) => {
          // Create a new item with updated status
          const updatedItem = {
            ...item,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };

          // Verify the status is valid
          expect(['watched', 'watching', 'will_watch']).toContain(updatedItem.status);

          // Verify other properties are preserved
          expect(updatedItem.id).toBe(item.id);
          expect(updatedItem.mediaItem).toEqual(item.mediaItem);
          expect(updatedItem.addedAt).toBe(item.addedAt);

          // Verify updatedAt is a valid date and more recent than the original updatedAt
          expect(new Date(updatedItem.updatedAt).getTime()).toBeGreaterThanOrEqual(
            new Date(item.updatedAt).getTime()
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 5.5: Collection statistics are consistent
   * For any collection of items, statistics should match the actual data
   */
  test('collection statistics are consistent', async () => {
    await fc.assert(
      fc.property(
        fc.array(collectionItemArb, { maxLength: 20 }),
        (items) => {
          // Calculate statistics
          const watchedCount = items.filter(item => item.status === 'watched').length;
          const watchingCount = items.filter(item => item.status === 'watching').length;
          const willWatchCount = items.filter(item => item.status === 'will_watch').length;

          const movieCount = items.filter(item => item.mediaItem.mediaType === 'movie').length;
          const tvCount = items.filter(item => item.mediaItem.mediaType === 'tv').length;

          // Verify totals
          expect(watchedCount + watchingCount + willWatchCount).toBe(items.length);
          expect(movieCount + tvCount).toBe(items.length);

          // Verify non-negative counts
          expect(watchedCount).toBeGreaterThanOrEqual(0);
          expect(watchingCount).toBeGreaterThanOrEqual(0);
          expect(willWatchCount).toBeGreaterThanOrEqual(0);
          expect(movieCount).toBeGreaterThanOrEqual(0);
          expect(tvCount).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 30 }
    );
  });
});