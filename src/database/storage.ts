import { Platform } from 'react-native';
import { WaterData } from '../types/usgs';
import { Location, LocationGroup, WaterConditions } from '../types/location';

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
  },
  // Location methods
  saveLocation: (location: Location) => {
    try {
      const locations = JSON.parse(localStorage.getItem('locations') || '[]');
      const index = locations.findIndex((l: Location) => l.id === location.id);
      
      if (index >= 0) {
        locations[index] = location;
      } else {
        locations.push(location);
      }
      
      localStorage.setItem('locations', JSON.stringify(locations));
    } catch (error) {
      console.error('Error saving location to localStorage:', error);
    }
  },
  getLocations: (): Promise<Location[]> => {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem('locations');
        resolve(data ? JSON.parse(data) : []);
      } catch (error) {
        reject(error);
      }
    });
  },
  getLocation: (id: string): Promise<Location | null> => {
    return new Promise((resolve, reject) => {
      try {
        const locations = JSON.parse(localStorage.getItem('locations') || '[]');
        const location = locations.find((l: Location) => l.id === id);
        resolve(location || null);
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteLocation: (id: string) => {
    try {
      const locations = JSON.parse(localStorage.getItem('locations') || '[]');
      const filteredLocations = locations.filter((l: Location) => l.id !== id);
      localStorage.setItem('locations', JSON.stringify(filteredLocations));
    } catch (error) {
      console.error('Error deleting location from localStorage:', error);
    }
  },
  // Location group methods
  saveLocationGroup: (group: LocationGroup) => {
    try {
      const groups = JSON.parse(localStorage.getItem('locationGroups') || '[]');
      const index = groups.findIndex((g: LocationGroup) => g.id === group.id);
      
      if (index >= 0) {
        groups[index] = group;
      } else {
        groups.push(group);
      }
      
      localStorage.setItem('locationGroups', JSON.stringify(groups));
    } catch (error) {
      console.error('Error saving location group to localStorage:', error);
    }
  },
  getLocationGroups: (): Promise<LocationGroup[]> => {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem('locationGroups');
        resolve(data ? JSON.parse(data) : []);
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteLocationGroup: (id: string) => {
    try {
      const groups = JSON.parse(localStorage.getItem('locationGroups') || '[]');
      const filteredGroups = groups.filter((g: LocationGroup) => g.id !== id);
      localStorage.setItem('locationGroups', JSON.stringify(filteredGroups));
    } catch (error) {
      console.error('Error deleting location group from localStorage:', error);
    }
  },
  // Water conditions methods
  saveWaterConditions: (conditions: WaterConditions) => {
    try {
      const allConditions = JSON.parse(localStorage.getItem('waterConditions') || '{}');
      allConditions[conditions.locationId] = conditions;
      localStorage.setItem('waterConditions', JSON.stringify(allConditions));
    } catch (error) {
      console.error('Error saving water conditions to localStorage:', error);
    }
  },
  getWaterConditions: (locationId: string): Promise<WaterConditions | null> => {
    return new Promise((resolve, reject) => {
      try {
        const allConditions = JSON.parse(localStorage.getItem('waterConditions') || '{}');
        resolve(allConditions[locationId] || null);
      } catch (error) {
        reject(error);
      }
    });
  },
  getAllWaterConditions: (): Promise<Record<string, WaterConditions>> => {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem('waterConditions');
        resolve(data ? JSON.parse(data) : {});
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
        
        // Create locations table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS locations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            region TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            ndbcStationId TEXT NOT NULL,
            isFavorite INTEGER NOT NULL DEFAULT 0,
            lastUpdated TEXT NOT NULL
          )`
        );
        
        // Create location groups table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS location_groups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
          )`
        );
        
        // Create location group mappings table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS location_group_mappings (
            groupId TEXT NOT NULL,
            locationId TEXT NOT NULL,
            PRIMARY KEY (groupId, locationId),
            FOREIGN KEY (groupId) REFERENCES location_groups(id),
            FOREIGN KEY (locationId) REFERENCES locations(id)
          )`
        );
        
        // Create water conditions table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS water_conditions (
            locationId TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            waterTemperatureValue REAL NOT NULL,
            waterTemperatureUnit TEXT NOT NULL,
            waveHeightValue REAL NOT NULL,
            waveHeightUnit TEXT NOT NULL,
            wavePeriodValue REAL NOT NULL,
            wavePeriodUnit TEXT NOT NULL,
            waveDirectionValue REAL NOT NULL,
            waveDirectionUnit TEXT NOT NULL,
            windSpeedValue REAL NOT NULL,
            windSpeedUnit TEXT NOT NULL,
            windDirectionValue REAL NOT NULL,
            windDirectionUnit TEXT NOT NULL,
            PRIMARY KEY (locationId, timestamp),
            FOREIGN KEY (locationId) REFERENCES locations(id)
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
    },
    // Location methods
    saveLocation: (location: Location) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO locations 
           (id, name, region, latitude, longitude, ndbcStationId, isFavorite, lastUpdated) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            location.id,
            location.name,
            location.region,
            location.latitude,
            location.longitude,
            location.ndbcStationId,
            location.isFavorite ? 1 : 0,
            location.lastUpdated
          ]
        );
      });
    },
    getLocations: (): Promise<Location[]> => {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM locations',
            [],
            (_, { rows: { _array } }) => {
              resolve(_array.map(row => ({
                id: row.id,
                name: row.name,
                region: row.region,
                latitude: row.latitude,
                longitude: row.longitude,
                ndbcStationId: row.ndbcStationId,
                isFavorite: row.isFavorite === 1,
                userGroups: [], // Will be populated separately
                lastUpdated: row.lastUpdated
              })));
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    },
    getLocation: (id: string): Promise<Location | null> => {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM locations WHERE id = ?',
            [id],
            (_, { rows: { _array } }) => {
              if (_array.length === 0) {
                resolve(null);
                return;
              }
              
              const row = _array[0];
              
              // Get user groups for this location
              tx.executeSql(
                'SELECT groupId FROM location_group_mappings WHERE locationId = ?',
                [id],
                (_, { rows: { _array: groupRows } }) => {
                  const userGroups = groupRows.map(g => g.groupId);
                  
                  resolve({
                    id: row.id,
                    name: row.name,
                    region: row.region,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    ndbcStationId: row.ndbcStationId,
                    isFavorite: row.isFavorite === 1,
                    userGroups,
                    lastUpdated: row.lastUpdated
                  });
                }
              );
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    },
    deleteLocation: (id: string) => {
      db.transaction(tx => {
        // Delete from location_group_mappings first (foreign key constraint)
        tx.executeSql('DELETE FROM location_group_mappings WHERE locationId = ?', [id]);
        
        // Delete from water_conditions
        tx.executeSql('DELETE FROM water_conditions WHERE locationId = ?', [id]);
        
        // Delete from locations
        tx.executeSql('DELETE FROM locations WHERE id = ?', [id]);
      });
    },
    // Location group methods
    saveLocationGroup: (group: LocationGroup) => {
      db.transaction(tx => {
        // Save the group
        tx.executeSql(
          `INSERT OR REPLACE INTO location_groups 
           (id, name, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?)`,
          [
            group.id,
            group.name,
            group.createdAt,
            group.updatedAt
          ]
        );
        
        // Delete existing mappings
        tx.executeSql('DELETE FROM location_group_mappings WHERE groupId = ?', [group.id]);
        
        // Add new mappings
        for (const locationId of group.locationIds) {
          tx.executeSql(
            'INSERT INTO location_group_mappings (groupId, locationId) VALUES (?, ?)',
            [group.id, locationId]
          );
        }
      });
    },
    getLocationGroups: (): Promise<LocationGroup[]> => {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM location_groups',
            [],
            (_, { rows: { _array } }) => {
              const groups = _array.map(row => ({
                id: row.id,
                name: row.name,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                locationIds: [] // Will be populated separately
              }));
              
              // Get location IDs for each group
              const promises = groups.map(group => 
                new Promise<void>((resolveGroup) => {
                  tx.executeSql(
                    'SELECT locationId FROM location_group_mappings WHERE groupId = ?',
                    [group.id],
                    (_, { rows: { _array: locationRows } }) => {
                      group.locationIds = locationRows.map(l => l.locationId);
                      resolveGroup();
                    }
                  );
                })
              );
              
              Promise.all(promises).then(() => {
                resolve(groups);
              });
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    },
    deleteLocationGroup: (id: string) => {
      db.transaction(tx => {
        // Delete from location_group_mappings first (foreign key constraint)
        tx.executeSql('DELETE FROM location_group_mappings WHERE groupId = ?', [id]);
        
        // Delete from location_groups
        tx.executeSql('DELETE FROM location_groups WHERE id = ?', [id]);
      });
    },
    // Water conditions methods
    saveWaterConditions: (conditions: WaterConditions) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO water_conditions 
           (locationId, timestamp, 
            waterTemperatureValue, waterTemperatureUnit,
            waveHeightValue, waveHeightUnit,
            wavePeriodValue, wavePeriodUnit,
            waveDirectionValue, waveDirectionUnit,
            windSpeedValue, windSpeedUnit,
            windDirectionValue, windDirectionUnit) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            conditions.locationId,
            conditions.timestamp,
            conditions.waterTemperature.value,
            conditions.waterTemperature.unit,
            conditions.waveHeight.value,
            conditions.waveHeight.unit,
            conditions.wavePeriod.value,
            conditions.wavePeriod.unit,
            conditions.waveDirection.value,
            conditions.waveDirection.unit,
            conditions.windSpeed.value,
            conditions.windSpeed.unit,
            conditions.windDirection.value,
            conditions.windDirection.unit
          ]
        );
      });
    },
    getWaterConditions: (locationId: string): Promise<WaterConditions | null> => {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM water_conditions WHERE locationId = ? ORDER BY timestamp DESC LIMIT 1',
            [locationId],
            (_, { rows: { _array } }) => {
              if (_array.length === 0) {
                resolve(null);
                return;
              }
              
              const row = _array[0];
              
              resolve({
                locationId: row.locationId,
                timestamp: row.timestamp,
                waterTemperature: {
                  value: row.waterTemperatureValue,
                  unit: row.waterTemperatureUnit
                },
                waveHeight: {
                  value: row.waveHeightValue,
                  unit: row.waveHeightUnit
                },
                wavePeriod: {
                  value: row.wavePeriodValue,
                  unit: row.wavePeriodUnit
                },
                waveDirection: {
                  value: row.waveDirectionValue,
                  unit: row.waveDirectionUnit
                },
                windSpeed: {
                  value: row.windSpeedValue,
                  unit: row.windSpeedUnit
                },
                windDirection: {
                  value: row.windDirectionValue,
                  unit: row.windDirectionUnit
                }
              });
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    },
    getAllWaterConditions: (): Promise<Record<string, WaterConditions>> => {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM water_conditions ORDER BY timestamp DESC',
            [],
            (_, { rows: { _array } }) => {
              const result: Record<string, WaterConditions> = {};
              
              // Group by locationId and take the most recent for each
              const locationMap = new Map<string, any>();
              
              for (const row of _array) {
                if (!locationMap.has(row.locationId)) {
                  locationMap.set(row.locationId, row);
                }
              }
              
              // Convert to the expected format
              for (const [locationId, row] of locationMap.entries()) {
                result[locationId] = {
                  locationId: row.locationId,
                  timestamp: row.timestamp,
                  waterTemperature: {
                    value: row.waterTemperatureValue,
                    unit: row.waterTemperatureUnit
                  },
                  waveHeight: {
                    value: row.waveHeightValue,
                    unit: row.waveHeightUnit
                  },
                  wavePeriod: {
                    value: row.wavePeriodValue,
                    unit: row.wavePeriodUnit
                  },
                  waveDirection: {
                    value: row.waveDirectionValue,
                    unit: row.waveDirectionUnit
                  },
                  windSpeed: {
                    value: row.windSpeedValue,
                    unit: row.windSpeedUnit
                  },
                  windDirection: {
                    value: row.windDirectionValue,
                    unit: row.windDirectionUnit
                  }
                };
              }
              
              resolve(result);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    }
  };
})();

// Export platform-specific implementation
export const storage = Platform.OS === 'web' ? webStorage : nativeStorage; 