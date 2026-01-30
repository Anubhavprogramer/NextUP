/**
 * Custom Debugger Utility
 * Provides structured logging for development and debugging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Debugger {
  private isEnabled: boolean = __DEV__; // Only log in development
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 100;

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.log(LogLevel.INFO, 'Debugger', `Logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, module: string, message: string, data?: any): void {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      module,
      message,
      data,
    };

    // Add to history
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Format and log to console
    const color = this.getColorForLevel(level);
    const dataStr = data ? JSON.stringify(data, null, 2) : '';

    console.log(
      `%c[${timestamp}] ${level} | ${module}%c: ${message}`,
      `color: ${color}; font-weight: bold;`,
      'color: inherit;'
    );

    if (dataStr) {
      console.log(`%c📦 Data:`, 'color: #666; font-weight: bold;', data);
    }
  }

  /**
   * Get color for log level
   */
  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '#888888';
      case LogLevel.INFO:
        return '#0099ff';
      case LogLevel.WARN:
        return '#ff9900';
      case LogLevel.ERROR:
        return '#ff3333';
      default:
        return '#000000';
    }
  }

  /**
   * Debug level logging
   */
  debug(module: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, module, message, data);
  }

  /**
   * Info level logging
   */
  info(module: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, module, message, data);
  }

  /**
   * Warning level logging
   */
  warn(module: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, module, message, data);
  }

  /**
   * Error level logging
   */
  error(module: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, module, message, data);
  }

  /**
   * Get log history
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
    this.info('Debugger', 'Log history cleared');
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Print all history to console
   */
  printHistory(): void {
    console.log('%c=== LOG HISTORY ===', 'color: #ff00ff; font-weight: bold; font-size: 14px;');
    this.logHistory.forEach((entry) => {
      const color = this.getColorForLevel(entry.level);
      console.log(
        `%c[${entry.timestamp}] ${entry.level} | ${entry.module}%c: ${entry.message}`,
        `color: ${color}; font-weight: bold;`,
        'color: inherit;'
      );
      if (entry.data) {
        console.log('%c📦 Data:', 'color: #666; font-weight: bold;', entry.data);
      }
    });
    console.log('%c=== END LOG HISTORY ===', 'color: #ff00ff; font-weight: bold; font-size: 14px;');
  }
}

// Export singleton instance
export const logger = new Debugger();

export default logger;
