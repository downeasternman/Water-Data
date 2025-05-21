import axios, { AxiosError } from 'axios';
import { NDBCResponse, NDBCStation, WaterConditions } from '../types/location';

const BASE_URL = 'https://www.ndbc.noaa.gov/data/realtime2/';
const STATIONS_URL = 'https://www.ndbc.noaa.gov/data/stations.txt';
const TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Helper function to parse NDBC station data
const parseStationData = (data: string): NDBCStation[] => {
  const lines = data.split('\n');
  const stations: NDBCStation[] = [];
  
  // Skip header lines
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(/\s+/);
    if (parts.length < 5) continue;
    
    const id = parts[0];
    const latitude = parseFloat(parts[1]);
    const longitude = parseFloat(parts[2]);
    const name = parts.slice(3).join(' ').replace(/"/g, '');
    
    // Determine region based on coordinates
    const region = determineRegion(latitude, longitude);
    
    stations.push({
      id,
      name,
      latitude,
      longitude,
      region,
      hasWaterTemperature: true, // We'll assume all stations have water temperature
      hasWaveHeight: true, // We'll assume all stations have wave height
    });
  }
  
  return stations;
};

// Helper function to determine region based on coordinates
const determineRegion = (latitude: number, longitude: number): string => {
  // Northeast Region
  if (latitude >= 35 && latitude <= 45 && longitude >= -80 && longitude <= -65) {
    return 'Northeast';
  }
  
  // Southeast Region
  if (latitude >= 25 && latitude < 35 && longitude >= -85 && longitude <= -75) {
    return 'Southeast';
  }
  
  // Gulf Coast Region
  if (latitude >= 25 && latitude < 30 && longitude >= -95 && longitude < -85) {
    return 'Gulf Coast';
  }
  
  // West Coast Region
  if (latitude >= 30 && latitude <= 50 && longitude >= -130 && longitude <= -115) {
    return 'West Coast';
  }
  
  // Hawaii Region
  if (latitude >= 18 && latitude <= 23 && longitude >= -160 && longitude <= -154) {
    return 'Hawaii';
  }
  
  // Alaska Region
  if (latitude >= 50 && latitude <= 60 && longitude >= -170 && longitude <= -130) {
    return 'Alaska';
  }
  
  // Great Lakes Region
  if (latitude >= 40 && latitude <= 50 && longitude >= -90 && longitude <= -75) {
    return 'Great Lakes';
  }
  
  return 'Other';
};

// Helper function to parse NDBC data
const parseNDBCData = (data: string, stationId: string): NDBCResponse => {
  const lines = data.split('\n');
  const response: NDBCResponse = {
    stationId,
    timestamp: new Date().toISOString(),
  };
  
  // Skip header lines
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(/\s+/);
    if (parts.length < 10) continue;
    
    // Parse data based on NDBC format
    // Format: YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP DEWP VIS PTDY TIDE
    const year = parseInt(parts[0]) + 2000;
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const hour = parseInt(parts[3]);
    const minute = parseInt(parts[4]);
    
    const timestamp = new Date(year, month, day, hour, minute).toISOString();
    
    // Wave height (WVHT) in meters
    const waveHeight = parseFloat(parts[8]);
    if (!isNaN(waveHeight)) {
      response.waveHeight = {
        value: waveHeight,
        unit: 'm',
      };
    }
    
    // Wave period (DPD) in seconds
    const wavePeriod = parseFloat(parts[9]);
    if (!isNaN(wavePeriod)) {
      response.wavePeriod = {
        value: wavePeriod,
        unit: 's',
      };
    }
    
    // Wave direction (MWD) in degrees
    const waveDirection = parseFloat(parts[11]);
    if (!isNaN(waveDirection)) {
      response.waveDirection = {
        value: waveDirection,
        unit: 'deg',
      };
    }
    
    // Water temperature (WTMP) in Celsius
    const waterTemperature = parseFloat(parts[14]);
    if (!isNaN(waterTemperature)) {
      response.waterTemperature = {
        value: waterTemperature,
        unit: 'degC',
      };
    }
    
    // Wind direction (WDIR) in degrees
    const windDirection = parseFloat(parts[5]);
    if (!isNaN(windDirection)) {
      response.windDirection = {
        value: windDirection,
        unit: 'deg',
      };
    }
    
    // Wind speed (WSPD) in meters per second
    const windSpeed = parseFloat(parts[6]);
    if (!isNaN(windSpeed)) {
      response.windSpeed = {
        value: windSpeed,
        unit: 'm/s',
      };
    }
    
    break; // Only process the first data line (most recent)
  }
  
  return response;
};

// Retry function with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000 * (MAX_RETRIES - retries + 1)));
    return retryWithBackoff(fn, retries - 1);
  }
};

// Fetch list of NDBC stations
export const fetchStationList = async (): Promise<NDBCStation[]> => {
  try {
    const response = await retryWithBackoff(() => 
      axios.get(STATIONS_URL, {
        timeout: TIMEOUT,
      })
    );
    
    return parseStationData(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to fetch station list: ${axiosError.message}`);
    }
    throw error;
  }
};

// Fetch water conditions for a specific station
export const fetchWaterConditions = async (stationId: string): Promise<WaterConditions> => {
  try {
    const response = await retryWithBackoff(() => 
      api.get(`${stationId}.txt`, {
        timeout: TIMEOUT,
      })
    );
    
    const ndbcData = parseNDBCData(response.data, stationId);
    
    return {
      locationId: stationId,
      timestamp: ndbcData.timestamp,
      waterTemperature: ndbcData.waterTemperature || { value: 0, unit: 'degC' },
      waveHeight: ndbcData.waveHeight || { value: 0, unit: 'm' },
      wavePeriod: ndbcData.wavePeriod || { value: 0, unit: 's' },
      waveDirection: ndbcData.waveDirection || { value: 0, unit: 'deg' },
      windSpeed: ndbcData.windSpeed || { value: 0, unit: 'm/s' },
      windDirection: ndbcData.windDirection || { value: 0, unit: 'deg' },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to fetch water conditions for station ${stationId}: ${axiosError.message}`);
    }
    throw error;
  }
}; 