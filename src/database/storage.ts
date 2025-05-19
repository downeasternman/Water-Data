import { Platform } from 'react-native';
import { WaterData } from '../types/usgs';

// Web storage implementation
const webStorage = {
  init: () => {
    // No initialization needed for web
  },
  saveData: (data: WaterData) => {
    try {
      localStorage.setItem('waterData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  },
  getLatestData: (): Promise<WaterData> => {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem('waterData');
        if (!data) {
          reject(new Error('No data available'));
          return;
        }
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  }
};

// Native storage implementation
const nativeStorage = Platform.OS === 'web' ? webStorage : (() => {
  // Only import SQLite for native platforms
  const SQLite = require('expo-sqlite');
  const db = SQLite.openDatabase('waterdata.db');

  return {
    init: () => {
      db.transaction(tx => {
        // Create temperature table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS temperature (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value REAL NOT NULL,
            dateTime TEXT NOT NULL,
            lastUpdated TEXT NOT NULL
          )`
        );

        // Create discharge table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS discharge (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value REAL NOT NULL,
            dateTime TEXT NOT NULL,
            lastUpdated TEXT NOT NULL
          )`
        );
      });
    },
    saveData: (data: WaterData) => {
      db.transaction(tx => {
        // Save temperature data
        tx.executeSql(
          'INSERT INTO temperature (value, dateTime, lastUpdated) VALUES (?, ?, ?)',
          [data.temperature.current, new Date().toISOString(), data.temperature.lastUpdated]
        );

        // Save discharge data
        tx.executeSql(
          'INSERT INTO discharge (value, dateTime, lastUpdated) VALUES (?, ?, ?)',
          [data.discharge.current, new Date().toISOString(), data.discharge.lastUpdated]
        );
      });
    },
    getLatestData: (): Promise<WaterData> => {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM temperature ORDER BY id DESC LIMIT 1',
            [],
            (_, { rows: { _array: tempRows } }) => {
              tx.executeSql(
                'SELECT * FROM discharge ORDER BY id DESC LIMIT 1',
                [],
                (_, { rows: { _array: dischargeRows } }) => {
                  if (tempRows.length === 0 || dischargeRows.length === 0) {
                    reject(new Error('No data available'));
                    return;
                  }

                  const latestTemp = tempRows[0];
                  const latestDischarge = dischargeRows[0];

                  resolve({
                    temperature: {
                      current: latestTemp.value,
                      unit: 'degC',
                      lastUpdated: latestTemp.lastUpdated,
                      history: []
                    },
                    discharge: {
                      current: latestDischarge.value,
                      unit: 'ft3/s',
                      lastUpdated: latestDischarge.lastUpdated,
                      history: []
                    }
                  });
                }
              );
            }
          );
        });
      });
    }
  };
})();

// Export platform-specific implementation
export const storage = Platform.OS === 'web' ? webStorage : nativeStorage; 