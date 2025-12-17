/**
 * Property-based tests for search API functionality
 * Tests search API integration and response handling
 */

import * as fc from 'fast-check';
import { searchMulti, searchMovies, searchTV } from '../tmdb';
import { MediaItem, TMDBSearchResponse } from '../../Types';

// Mock fetch for testing
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Search API Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 3: Search API integration
   * Validates: Requirements 2.2, 2.3
   */
  describe('Property 3: Search API integration', () => {
    it('should handle empty search queries consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(fc.constant(''), fc.constant('   '), fc.constant('\t\n')),
          async (emptyQuery) => {
            const result = await searchMulti(emptyQuery);
            
            expect(result).toEqual({
              page: 1,
              results: [],
              total_pages: 0,
              total_results: 0,
            });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should sanitize and encode search queries properly', async () => {
      const mockResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (query) => {
            await searchMulti(query);
            
            // Verify fetch was called with properly encoded query
            expect(mockFetch).toHaveBeenCalledWith(
              expect.stringContaining(encodeURIComponent(query.trim()))
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should transform TMDB response to MediaItem format correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 999999 }),
              title: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
              name: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
              overview: fc.string({ maxLength: 500 }),
              poster_path: fc.option(fc.string()),
              backdrop_path: fc.option(fc.string()),
              release_date: fc.option(fc.string().map(() => '2023-01-01')),
              first_air_date: fc.option(fc.string().map(() => '2023-01-01')),
              vote_average: fc.float({ min: 0, max: 10 }),
              genre_ids: fc.array(fc.integer({ min: 1, max: 99 })),
              media_type: fc.oneof(fc.constant('movie'), fc.constant('tv')),
              original_language: fc.string({ minLength: 2, maxLength: 2 }),
            }),
            { maxLength: 10 }
          ),
          async (tmdbResults) => {
            const mockResponse = {
              page: 1,
              results: tmdbResults,
              total_pages: 1,
              total_results: tmdbResults.length,
            };

            mockFetch.mockResolvedValue({
              ok: true,
              json: () => Promise.resolve(mockResponse),
            } as Response);

            const result = await searchMulti('test query');
            
            // Verify transformation
            expect(result.results).toHaveLength(tmdbResults.length);
            
            result.results.forEach((item: MediaItem, index: number) => {
              const original = tmdbResults[index];
              
              // Check required fields are present
              expect(item).toHaveProperty('id', original.id);
              expect(item).toHaveProperty('title');
              expect(item).toHaveProperty('overview', original.overview);
              expect(item).toHaveProperty('mediaType', original.media_type);
              expect(item).toHaveProperty('voteAverage', original.vote_average);
              expect(item).toHaveProperty('genreIds', original.genre_ids);
              
              // Check title handling (movie.title or tv.name)
              const expectedTitle = original.title || original.name || 'Unknown Title';
              expect(item.title).toBe(expectedTitle);
              
              // Check date handling
              const expectedDate = original.release_date || original.first_air_date || '';
              expect(item.releaseDate).toBe(expectedDate);
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should filter out person results from multi search', async () => {
      const mockResults = [
        { id: 1, title: 'Movie', media_type: 'movie', overview: 'A movie' },
        { id: 2, name: 'TV Show', media_type: 'tv', overview: 'A TV show' },
        { id: 3, name: 'Person', media_type: 'person', overview: 'An actor' },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          page: 1,
          results: mockResults,
          total_pages: 1,
          total_results: 3,
        }),
      } as Response);

      const result = await searchMulti('test');
      
      // Should only have movie and TV results, no person
      expect(result.results).toHaveLength(2);
      expect(result.results.every(item => 
        item.mediaType === 'movie' || item.mediaType === 'tv'
      )).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 599 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          async (statusCode, query) => {
            mockFetch.mockResolvedValue({
              ok: false,
              status: statusCode,
              statusText: 'Error',
            } as Response);

            await expect(searchMulti(query)).rejects.toThrow();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle network errors gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          async (query) => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            await expect(searchMulti(query)).rejects.toThrow();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Search type-specific functions', () => {
    it('should add correct media_type for movie search', async () => {
      const mockResponse = {
        page: 1,
        results: [{ id: 1, title: 'Movie', overview: 'A movie' }],
        total_pages: 1,
        total_results: 1,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await searchMovies('test');
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].mediaType).toBe('movie');
    });

    it('should add correct media_type for TV search', async () => {
      const mockResponse = {
        page: 1,
        results: [{ id: 1, name: 'TV Show', overview: 'A TV show' }],
        total_pages: 1,
        total_results: 1,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await searchTV('test');
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].mediaType).toBe('tv');
    });
  });

  describe('Response validation', () => {
    it('should validate search response structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            page: fc.integer({ min: 1, max: 1000 }),
            total_pages: fc.integer({ min: 0, max: 1000 }),
            total_results: fc.integer({ min: 0, max: 10000 }),
            results: fc.array(fc.anything(), { maxLength: 20 }),
          }),
          async (mockResponse) => {
            mockFetch.mockResolvedValue({
              ok: true,
              json: () => Promise.resolve(mockResponse),
            } as Response);

            const result = await searchMulti('test');
            
            // Verify response structure
            expect(result).toHaveProperty('page', mockResponse.page);
            expect(result).toHaveProperty('total_pages', mockResponse.total_pages);
            expect(result).toHaveProperty('total_results', mockResponse.total_results);
            expect(result).toHaveProperty('results');
            expect(Array.isArray(result.results)).toBe(true);
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});