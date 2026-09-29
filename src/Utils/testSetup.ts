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

// Native file modules used by Settings → backup (src/Utils/backupFiles.ts)
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  keepLocalCopy: jest.fn(),
  saveDocuments: jest.fn(),
  isErrorWithCode: (error: any) => !!error && typeof error.code === 'string',
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  types: { json: 'public.json', allFiles: '*/*' },
}));
jest.mock('@dr.pogodin/react-native-fs', () => ({
  CachesDirectoryPath: '/cache',
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(),
  unlink: jest.fn(() => Promise.resolve()),
}));

// Mock our custom UUID generator for consistent test results
jest.mock('../Utils/helpers', () => {
  const actual = jest.requireActual('../Utils/helpers');
  return {
    ...actual,
    generateId: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  };
});

// Global test configuration
(globalThis as any).__DEV__ = true;

// Increase timeout for property-based tests
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
globalThis.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};