/**
 * Property-based tests for Profile Validation
 * **Feature: media-tracker, Property 1: Profile form validation**
 * **Validates: Requirements 1.2, 1.3**
 */

import fc from 'fast-check';
import { validateUserProfile } from '../helpers';
import { VALIDATION_CONSTANTS } from '../../Types';

describe('Profile Validation Property Tests', () => {
  describe('Property 1: Profile form validation', () => {
    test('For any profile form submission, all required fields (name, age, preferred genres) must be validated, and incomplete submissions should be rejected while complete submissions should be accepted', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.oneof(fc.integer(), fc.constant(NaN), fc.constant(undefined)),
          fc.array(fc.integer({ min: 1, max: 50 })),
          (name, age, preferredGenres) => {
            const profile = {
              name,
              age: age as number,
              preferredGenres,
            };

            const result = validateUserProfile(profile);

            // Check name validation
            const nameIsValid = name && 
              name.trim().length >= VALIDATION_CONSTANTS.MIN_NAME_LENGTH &&
              name.length <= VALIDATION_CONSTANTS.MAX_NAME_LENGTH;

            // Check age validation
            const ageIsValid = age !== undefined && 
              !isNaN(age) && 
              age >= VALIDATION_CONSTANTS.MIN_AGE && 
              age <= VALIDATION_CONSTANTS.MAX_AGE;

            // Check genres validation
            const genresIsValid = preferredGenres && preferredGenres.length > 0;

            const shouldBeValid = nameIsValid && ageIsValid && genresIsValid;

            if (shouldBeValid) {
              expect(result.isValid).toBe(true);
              expect(result.errors).toHaveLength(0);
            } else {
              expect(result.isValid).toBe(false);
              expect(result.errors.length).toBeGreaterThan(0);
            }

            // Verify specific error messages
            if (!nameIsValid) {
              expect(result.errors.some(error => error.includes('Name'))).toBe(true);
            }

            if (!ageIsValid) {
              expect(result.errors.some(error => error.includes('Age'))).toBe(true);
            }

            if (!genresIsValid) {
              expect(result.errors.some(error => error.includes('genre'))).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Valid profile data should always pass validation', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.integer({ min: 1, max: 120 }),
          fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1, maxLength: 10 }),
          (name, age, preferredGenres) => {
            const profile = {
              name,
              age,
              preferredGenres,
            };

            const result = validateUserProfile(profile);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('Name validation should handle edge cases correctly', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''), // Empty string
            fc.constant('   '), // Whitespace only
            fc.string({ minLength: 51, maxLength: 100 }), // Too long
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length === 0) // Whitespace padded
          ),
          fc.integer({ min: 1, max: 120 }),
          fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1 }),
          (invalidName, age, preferredGenres) => {
            const profile = {
              name: invalidName,
              age,
              preferredGenres,
            };

            const result = validateUserProfile(profile);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('Name'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Age validation should handle edge cases correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.oneof(
            fc.integer({ min: -100, max: 0 }), // Negative or zero
            fc.integer({ min: 121, max: 200 }), // Too high
            fc.constant(NaN), // Not a number
            fc.constant(undefined) // Undefined
          ),
          fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1 }),
          (name, invalidAge, preferredGenres) => {
            const profile = {
              name,
              age: invalidAge as number,
              preferredGenres,
            };

            const result = validateUserProfile(profile);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('Age'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Genre validation should handle edge cases correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.integer({ min: 1, max: 120 }),
          fc.oneof(
            fc.constant([]), // Empty array
            fc.constant(undefined), // Undefined
            fc.constant(null) // Null
          ),
          (name, age, invalidGenres) => {
            const profile = {
              name,
              age,
              preferredGenres: invalidGenres as number[],
            };

            const result = validateUserProfile(profile);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('genre'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Validation should be consistent across multiple calls with same data', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.oneof(fc.integer(), fc.constant(NaN)),
          fc.array(fc.integer({ min: 1, max: 50 })),
          (name, age, preferredGenres) => {
            const profile = {
              name,
              age: age as number,
              preferredGenres,
            };

            // Call validation multiple times
            const result1 = validateUserProfile(profile);
            const result2 = validateUserProfile(profile);
            const result3 = validateUserProfile(profile);

            // Results should be identical
            expect(result1.isValid).toBe(result2.isValid);
            expect(result2.isValid).toBe(result3.isValid);
            
            expect(result1.errors).toEqual(result2.errors);
            expect(result2.errors).toEqual(result3.errors);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('Validation should handle boundary values correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            // Name boundary cases
            'a', // Minimum valid length
            'a'.repeat(50), // Maximum valid length
          ),
          fc.constantFrom(
            // Age boundary cases
            1, // Minimum valid age
            120, // Maximum valid age
          ),
          fc.constantFrom(
            // Genre boundary cases
            [1], // Minimum valid genres (1 genre)
            Array.from({ length: 10 }, (_, i) => i + 1), // Multiple genres
          ),
          (name, age, preferredGenres) => {
            const profile = {
              name,
              age,
              preferredGenres,
            };

            const result = validateUserProfile(profile);

            // All boundary cases should be valid
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('Validation should reject just-outside-boundary values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            // Invalid boundary cases
            '', // Empty name
            'a'.repeat(51), // Name too long
          ),
          fc.constantFrom(
            // Invalid age boundary cases
            0, // Age too low
            121, // Age too high
          ),
          fc.constantFrom(
            // Invalid genre cases
            [], // No genres
          ),
          (name, age, preferredGenres) => {
            const profile = {
              name,
              age,
              preferredGenres,
            };

            const result = validateUserProfile(profile);

            // All just-outside-boundary cases should be invalid
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('Error messages should be descriptive and helpful', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.oneof(fc.constant(''), fc.string({ minLength: 51 })),
            age: fc.oneof(fc.constant(0), fc.constant(121), fc.constant(NaN)),
            preferredGenres: fc.constant([]),
          }),
          (invalidProfile) => {
            const result = validateUserProfile(invalidProfile);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);

            // Each error should be a non-empty string
            result.errors.forEach(error => {
              expect(typeof error).toBe('string');
              expect(error.length).toBeGreaterThan(0);
            });

            // Errors should be specific to the field
            if (!invalidProfile.name || invalidProfile.name.length > 50) {
              expect(result.errors.some(error => 
                error.toLowerCase().includes('name')
              )).toBe(true);
            }

            if (!invalidProfile.age || invalidProfile.age < 1 || invalidProfile.age > 120 || isNaN(invalidProfile.age)) {
              expect(result.errors.some(error => 
                error.toLowerCase().includes('age')
              )).toBe(true);
            }

            if (!invalidProfile.preferredGenres || invalidProfile.preferredGenres.length === 0) {
              expect(result.errors.some(error => 
                error.toLowerCase().includes('genre')
              )).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});