/**
 * Property-based tests for Profile Creation Flow
 * **Feature: media-tracker, Property 2: Profile creation persistence**
 * **Validates: Requirements 1.4**
 */

import fc from 'fast-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataManager } from '../DataManager';
import { STORAGE_KEYS } from '../../Types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Profile Creation Property Tests', () => {
  let dataManager: DataManager;
  let mockStorage: { [key: string]: string };

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage = {};
    
    // Mock AsyncStorage implementation
    mockAsyncStorage.getItem.mockImplementation((key: string) => {
      return Promise.resolve(mockStorage[key] || null);
    });
    
    mockAsyncStorage.setItem.mockImplementation((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    });
    
    mockAsyncStorage.removeItem.mockImplementation((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    });
    
    mockAsyncStorage.clear.mockImplementation(() => {
      mockStorage = {};
      return Promise.resolve();
    });
    
    mockAsyncStorage.getAllKeys.mockImplementation(() => {
      return Promise.resolve(Object.keys(mockStorage));
    });

    dataManager = DataManager.getInstance();
  });

  describe('Property 2: Profile creation persistence', () => {
    test('Profile creation should store valid data in Local_Storage', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.integer({ min: 1, max: 120 }),
          fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1, maxLength: 5 }),
          async (name, age, preferredGenres) => {
            // Create user profile
            const createdProfile = await dataManager.createUserProfile(name, age, preferredGenres);
            
            // Verify profile structure
            expect(createdProfile.name).toBe(name.trim());
            expect(createdProfile.age).toBe(age);
            expect(createdProfile.preferredGenres).toEqual(preferredGenres);
            expect(createdProfile.id).toBeDefined();
            expect(createdProfile.createdAt).toBeDefined();
            expect(createdProfile.updatedAt).toBeDefined();
            
            // Verify profile is persisted in storage
            const rawProfileData = mockStorage[STORAGE_KEYS.USER_PROFILE];
            expect(rawProfileData).toBeDefined();
            expect(() => JSON.parse(rawProfileData)).not.toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Profile creation should handle name trimming correctly', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 45 }).filter(s => s.trim().length > 0),
          fc.integer({ min: 1, max: 120 }),
          fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1 }),
          async (baseName, age, preferredGenres) => {
            // Add whitespace padding to name
            const paddedName = `  ${baseName}  `;
            
            const profile = await dataManager.createUserProfile(paddedName, age, preferredGenres);
            
            // Name should be trimmed in the saved profile
            expect(profile.name).toBe(baseName.trim());
            expect(profile.name).not.toBe(paddedName);
          }
        ),
        { numRuns: 30 }
      );
    });

    test('Profile creation should validate input data', () => {
      fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(''), // Empty name
            fc.string({ minLength: 51 }), // Name too long
          ),
          fc.integer({ min: 1, max: 120 }),
          fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1 }),
          async (invalidName, age, preferredGenres) => {
            // Profile creation should throw an error for invalid data
            await expect(
              dataManager.createUserProfile(invalidName, age, preferredGenres)
            ).rejects.toThrow();
          }
        ),
        { numRuns: 30 }
      );
    });

    test('First launch detection should work correctly', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constant(null), // No input needed for this test
          async () => {
            // Initially should be first launch
            let isFirstLaunch = await dataManager.isFirstLaunch();
            expect(isFirstLaunch).toBe(true);
            
            // Mark first launch as complete
            await dataManager.completeFirstLaunch();
            
            // Should no longer be first launch
            isFirstLaunch = await dataManager.isFirstLaunch();
            expect(isFirstLaunch).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});