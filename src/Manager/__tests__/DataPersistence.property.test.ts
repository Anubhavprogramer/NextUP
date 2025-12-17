/**
 * Property-based tests for Data Persistence
 * **Feature: media-tracker, Property 6: Data persistence round-trip**
 * **Validates: Requirements 5.1, 5.2**
 */

import fc from 'fast-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalStorageManager } from '../StorageManager';
import { STORAGE_KEYS } from '../../Types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Data Persistence Property Tests', () => {
  let storageManager: LocalStorageManager;
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
    
    mockAsyncStorage.multiGet.mockImplementation((keys: readonly string[]) => {
      return Promise.resolve(
        keys.map(key => [key, mockStorage[key] || null] as [string, string | null])
      );
    });
    
    mockAsyncStorage.multiSet.mockImplementation((keyValuePairs: readonly [string, string][]) => {
      keyValuePairs.forEach(([key, value]) => {
        mockStorage[key] = value;
      });
      return Promise.resolve();
    });

    storageManager = LocalStorageManager.getInstance();
  });

  describe('Property 6: Data persistence round-trip', () => {
    test('Basic storage round-trip should work correctly', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ maxLength: 100 }),
          async (key, value) => {
            // Save data
            await storageManager.set(key, value);
            
            // Retrieve and verify
            const retrievedValue = await storageManager.get(key);
            expect(retrievedValue).toEqual(value);
            
            // Verify JSON serialization/deserialization integrity
            const rawData = mockStorage[key];
            expect(rawData).toBeDefined();
            const parsedValue = JSON.parse(rawData);
            expect(parsedValue).toEqual(value);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Storage should handle different data types correctly', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.oneof(
            fc.string({ maxLength: 50 }),
            fc.integer({ min: -1000, max: 1000 }),
            fc.boolean(),
            fc.constant(null)
          ),
          async (key, value) => {
            // Save data
            await storageManager.set(key, value);
            
            // Retrieve and verify
            const retrievedValue = await storageManager.get(key);
            expect(retrievedValue).toEqual(value);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Storage should handle object data correctly', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.record({
            name: fc.string({ maxLength: 30 }),
            count: fc.integer({ min: 0, max: 100 }),
            active: fc.boolean(),
          }),
          async (key, value) => {
            // Save data
            await storageManager.set(key, value);
            
            // Retrieve and verify
            const retrievedValue = await storageManager.get(key);
            expect(retrievedValue).toEqual(value);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Storage should handle removal correctly', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ maxLength: 50 }),
          async (key, value) => {
            // Save data
            await storageManager.set(key, value);
            
            // Verify it exists
            let retrievedValue = await storageManager.get(key);
            expect(retrievedValue).toEqual(value);
            
            // Remove data
            await storageManager.remove(key);
            
            // Verify it's gone
            retrievedValue = await storageManager.get(key);
            expect(retrievedValue).toBeNull();
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Storage should handle multiple keys correctly', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 2, maxLength: 5 }),
          async (keys) => {
            const uniqueKeys = [...new Set(keys)];
            fc.pre(uniqueKeys.length >= 2);
            
            // Store data for each key
            for (let i = 0; i < uniqueKeys.length; i++) {
              await storageManager.set(uniqueKeys[i], `value_${i}`);
            }
            
            // Verify all data
            for (let i = 0; i < uniqueKeys.length; i++) {
              const value = await storageManager.get(uniqueKeys[i]);
              expect(value).toBe(`value_${i}`);
            }
            
            // Verify all keys exist
            const allKeys = await storageManager.getAllKeys();
            uniqueKeys.forEach(key => {
              expect(allKeys).toContain(key);
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});

// Helper function to check if string is valid JSON
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}