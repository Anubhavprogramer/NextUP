// Test setup for NextUP media tracking app

import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Native modules
// Note: Some RN modules are automatically mocked by the preset

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock vector icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock our custom UUID generator for consistent test results
jest.mock('../Utils/helpers', () => {
  const actual = jest.requireActual('../Utils/helpers');
  return {
    ...actual,
    generateId: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  };
});

// Global test configuration
global.__DEV__ = true;

// Increase timeout for property-based tests
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};