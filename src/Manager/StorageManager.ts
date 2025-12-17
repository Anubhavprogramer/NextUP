import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  StorageManager, 
  StorageError, 
  StorageOperationResult, 
  StorageOperation,
  DataMigration 
} from '../Types';
import { APP_CONFIG } from '../Utils/constants';

/**
 * Local storage manager with AsyncStorage wrapper
 * Provides error handling, retry logic, and data validation
 */
export class LocalStorageManager implements StorageManager {
  private static instance: LocalStorageManager;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  private constructor() {
    this.maxRetries = APP_CONFIG.STORAGE_RETRY_ATTEMPTS;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  /**
   * Get data from storage with retry logic
   */
  async get<T>(key: string): Promise<T | null> {
    return this.executeWithRetry(async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(key);
        if (jsonValue === null) {
          return null;
        }

        const parsedValue = JSON.parse(jsonValue);
        return parsedValue as T;
      } catch (error) {
        if (error instanceof SyntaxError) {
          // Data corruption - remove corrupted data
          await this.remove(key);
          throw new StorageError(
            `Corrupted data found for key "${key}". Data has been cleared.`,
            'DATA_CORRUPTION'
          );
        }
        throw new StorageError(
          `Failed to retrieve data for key "${key}": ${error}`,
          'READ_ERROR'
        );
      }
    }, 'read', key);
  }

  /**
   * Set data in storage with retry logic
   */
  async set<T>(key: string, value: T): Promise<void> {
    return this.executeWithRetry(async () => {
      try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
      } catch (error) {
        throw new StorageError(
          `Failed to store data for key "${key}": ${error}`,
          'WRITE_ERROR'
        );
      }
    }, 'write', key);
  }

  /**
   * Remove data from storage
   */
  async remove(key: string): Promise<void> {
    return this.executeWithRetry(async () => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        throw new StorageError(
          `Failed to remove data for key "${key}": ${error}`,
          'DELETE_ERROR'
        );
      }
    }, 'delete', key);
  }

  /**
   * Clear all storage data
   */
  async clear(): Promise<void> {
    return this.executeWithRetry(async () => {
      try {
        await AsyncStorage.clear();
      } catch (error) {
        throw new StorageError(
          `Failed to clear storage: ${error}`,
          'CLEAR_ERROR'
        );
      }
    }, 'clear');
  }

  /**
   * Get all storage keys
   */
  async getAllKeys(): Promise<string[]> {
    return this.executeWithRetry(async () => {
      try {
        return await AsyncStorage.getAllKeys();
      } catch (error) {
        throw new StorageError(
          `Failed to get storage keys: ${error}`,
          'READ_ERROR'
        );
      }
    }, 'read');
  }

  /**
   * Get multiple items at once
   */
  async getMultiple<T>(keys: string[]): Promise<{ [key: string]: T | null }> {
    return this.executeWithRetry(async () => {
      try {
        const keyValuePairs = await AsyncStorage.multiGet(keys);
        const result: { [key: string]: T | null } = {};

        keyValuePairs.forEach(([key, value]) => {
          if (value === null) {
            result[key] = null;
          } else {
            try {
              result[key] = JSON.parse(value) as T;
            } catch (error) {
              console.warn(`Failed to parse data for key "${key}":`, error);
              result[key] = null;
            }
          }
        });

        return result;
      } catch (error) {
        throw new StorageError(
          `Failed to get multiple items: ${error}`,
          'READ_ERROR'
        );
      }
    }, 'read');
  }

  /**
   * Set multiple items at once
   */
  async setMultiple<T>(items: { [key: string]: T }): Promise<void> {
    return this.executeWithRetry(async () => {
      try {
        const keyValuePairs: [string, string][] = Object.entries(items).map(
          ([key, value]) => [key, JSON.stringify(value)]
        );
        await AsyncStorage.multiSet(keyValuePairs);
      } catch (error) {
        throw new StorageError(
          `Failed to set multiple items: ${error}`,
          'WRITE_ERROR'
        );
      }
    }, 'write');
  }

  /**
   * Check if storage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const testKey = '__storage_test__';
      const testValue = 'test';
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrievedValue = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      return retrievedValue === testValue;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    totalKeys: number;
    estimatedSize: number;
    keys: string[];
  }> {
    try {
      const keys = await this.getAllKeys();
      const keyValuePairs = await AsyncStorage.multiGet(keys);
      
      let estimatedSize = 0;
      keyValuePairs.forEach(([key, value]) => {
        estimatedSize += key.length + (value?.length || 0);
      });

      return {
        totalKeys: keys.length,
        estimatedSize,
        keys,
      };
    } catch (error) {
      throw new StorageError(
        `Failed to get storage info: ${error}`,
        'READ_ERROR'
      );
    }
  }

  /**
   * Migrate data between versions
   */
  async migrateData(migrations: DataMigration[]): Promise<void> {
    try {
      const currentVersion = await this.get<number>('__data_version__') || 0;
      
      for (const migration of migrations) {
        if (migration.version > currentVersion) {
          console.log(`Running migration to version ${migration.version}`);
          
          // Get all data
          const keys = await this.getAllKeys();
          const allData = await this.getMultiple(keys);
          
          // Apply migration
          const migratedData = migration.migrate(allData);
          
          // Save migrated data
          await this.setMultiple(migratedData);
          
          // Update version
          await this.set('__data_version__', migration.version);
        }
      }
    } catch (error) {
      throw new StorageError(
        `Data migration failed: ${error}`,
        'MIGRATION_ERROR'
      );
    }
  }

  /**
   * Create a backup of all data
   */
  async createBackup(): Promise<string> {
    try {
      const keys = await this.getAllKeys();
      const allData = await this.getMultiple(keys);
      
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: allData,
      };
      
      return JSON.stringify(backup);
    } catch (error) {
      throw new StorageError(
        `Failed to create backup: ${error}`,
        'BACKUP_ERROR'
      );
    }
  }

  /**
   * Restore data from backup
   */
  async restoreFromBackup(backupData: string): Promise<void> {
    try {
      const backup = JSON.parse(backupData);
      
      if (!backup.data || typeof backup.data !== 'object') {
        throw new Error('Invalid backup format');
      }
      
      // Clear existing data
      await this.clear();
      
      // Restore data
      await this.setMultiple(backup.data);
    } catch (error) {
      throw new StorageError(
        `Failed to restore from backup: ${error}`,
        'RESTORE_ERROR'
      );
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationType: StorageOperation,
    key?: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Log successful operation (optional)
        if (attempt > 0) {
          console.log(`Storage operation succeeded on attempt ${attempt + 1}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof StorageError && 
            ['DATA_CORRUPTION', 'INVALID_DATA'].includes(error.code)) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Wait before retrying
        await this.delay(this.retryDelay * (attempt + 1));
      }
    }
    
    // All retries failed
    throw new StorageError(
      `Storage operation failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`,
      'MAX_RETRIES_EXCEEDED'
    );
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate JSON data before parsing
   */
  private validateJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const storageManager = LocalStorageManager.getInstance();