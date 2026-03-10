/**
 * Debugger Helper Functions
 * Utilities for debugging and exporting logs
 */

import { logger } from './debugger';

/**
 * Print all debug logs to console
 * Useful for debugging crashes and issues
 */
export const printAllLogs = (): void => {
  logger.printHistory();
};

/**
 * Get formatted log history as a string
 */
export const getFormattedLogs = (): string => {
  const history = logger.getHistory();
  let output = '\n=== DEBUG LOG HISTORY ===\n';
  
  history.forEach((entry) => {
    output += `[${entry.timestamp}] ${entry.level} | ${entry.module}: ${entry.message}\n`;
    if (entry.data) {
      output += `  📦 Data: ${JSON.stringify(entry.data, null, 2)}\n`;
    }
  });
  
  output += '\n=== END LOG HISTORY ===\n';
  return output;
};

/**
 * Export logs for sharing/debugging
 */
export const exportDebugLogs = (): string => {
  return logger.exportLogs();
};

/**
 * Clear all logs
 */
export const clearAllLogs = (): void => {
  logger.clearHistory();
};

/**
 * Get last N logs
 */
export const getRecentLogs = (count: number = 20): string => {
  const history = logger.getHistory();
  const recent = history.slice(-count);
  
  let output = `\n=== LAST ${count} LOG ENTRIES ===\n`;
  
  recent.forEach((entry) => {
    output += `[${entry.timestamp}] ${entry.level} | ${entry.module}: ${entry.message}\n`;
    if (entry.data) {
      output += `  📦 Data: ${JSON.stringify(entry.data, null, 2)}\n`;
    }
  });
  
  output += '\n=== END ===\n';
  return output;
};

/**
 * Get logs by level
 */
export const getLogsByLevel = (level: string): string => {
  const history = logger.getHistory();
  const filtered = history.filter(entry => entry.level === level);
  
  let output = `\n=== ${level} LEVEL LOGS (${filtered.length} entries) ===\n`;
  
  filtered.forEach((entry) => {
    output += `[${entry.timestamp}] ${entry.module}: ${entry.message}\n`;
    if (entry.data) {
      output += `  📦 Data: ${JSON.stringify(entry.data, null, 2)}\n`;
    }
  });
  
  output += '\n=== END ===\n';
  return output;
};

/**
 * Get logs by module
 */
export const getLogsByModule = (moduleName: string): string => {
  const history = logger.getHistory();
  const filtered = history.filter(entry => entry.module === moduleName);
  
  let output = `\n=== LOGS FOR MODULE: ${moduleName} (${filtered.length} entries) ===\n`;
  
  filtered.forEach((entry) => {
    output += `[${entry.timestamp}] ${entry.level}: ${entry.message}\n`;
    if (entry.data) {
      output += `  📦 Data: ${JSON.stringify(entry.data, null, 2)}\n`;
    }
  });
  
  output += '\n=== END ===\n';
  return output;
};

/**
 * Print error logs and warnings
 */
export const printErrorsAndWarnings = (): void => {
  const history = logger.getHistory();
  const errors = history.filter(entry => entry.level === 'ERROR' || entry.level === 'WARN');
  
  console.log('\n%c=== ERRORS & WARNINGS ===', 'color: #ff3333; font-weight: bold; font-size: 14px;');
  
  if (errors.length === 0) {
    console.log('%c✅ No errors or warnings found!', 'color: #34C759; font-weight: bold;');
  } else {
    errors.forEach((entry) => {
      const color = entry.level === 'ERROR' ? '#ff3333' : '#ff9900';
      console.log(
        `%c[${entry.timestamp}] ${entry.level} | ${entry.module}%c: ${entry.message}`,
        `color: ${color}; font-weight: bold;`,
        'color: inherit;'
      );
      if (entry.data) {
        console.log('%c📦 Data:', `color: ${color};`, entry.data);
      }
    });
  }
  
  console.log('%c=== END ===', 'color: #ff3333; font-weight: bold; font-size: 14px;');
};

/**
 * Get a summary of logs
 */
export const getLogsSummary = (): { [key: string]: number } => {
  const history = logger.getHistory();
  const summary: { [key: string]: number } = {
    total: history.length,
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
  };
  
  history.forEach((entry) => {
    const levelKey = entry.level.toLowerCase();
    summary[levelKey] = (summary[levelKey] || 0) + 1;
  });
  
  return summary;
};

/**
 * Log a summary to console
 */
export const printLogsSummary = (): void => {
  const summary = getLogsSummary();
  console.log('\n%c=== LOGS SUMMARY ===', 'color: #0099ff; font-weight: bold; font-size: 14px;');
  console.log(`Total Logs: ${summary.total}`);
  console.log(`%c📘 Debug: ${summary.debug}`, 'color: #888888;');
  console.log(`%c📗 Info: ${summary.info}`, 'color: #0099ff;');
  console.log(`%c📙 Warn: ${summary.warn}`, 'color: #ff9900;');
  console.log(`%c📕 Error: ${summary.error}`, 'color: #ff3333;');
  console.log('%c=== END ===', 'color: #0099ff; font-weight: bold; font-size: 14px;');
};

// Global debugging object for console access
// Access in console: __DEBUG__.printLogs()
export const __DEBUG__ = {
  printAllLogs,
  printErrorsAndWarnings,
  printLogsSummary,
  getRecentLogs,
  getLogsByLevel,
  getLogsByModule,
  exportLogs: exportDebugLogs,
  clearLogs: clearAllLogs,
  summary: getLogsSummary,
  formatted: getFormattedLogs,
};

export default __DEBUG__;
