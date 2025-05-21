export interface Location {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  ndbcStationId: string;
  isFavorite: boolean;
  userGroups: string[];
  lastUpdated: string;
}

export interface LocationGroup {
  id: string;
  name: string;
  locationIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WaterConditions {
  locationId: string;
  timestamp: string;
  waterTemperature: {
    value: number;
    unit: string;
  };
  waveHeight: {
    value: number;
    unit: string;
  };
  wavePeriod: {
    value: number;
    unit: string;
  };
  waveDirection: {
    value: number;
    unit: string;
  };
  windSpeed: {
    value: number;
    unit: string;
  };
  windDirection: {
    value: number;
    unit: string;
  };
}

export interface NDBCStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  hasWaterTemperature: boolean;
  hasWaveHeight: boolean;
}

export interface NDBCResponse {
  stationId: string;
  timestamp: string;
  waterTemperature?: {
    value: number;
    unit: string;
  };
  waveHeight?: {
    value: number;
    unit: string;
  };
  wavePeriod?: {
    value: number;
    unit: string;
  };
  waveDirection?: {
    value: number;
    unit: string;
  };
  windSpeed?: {
    value: number;
    unit: string;
  };
  windDirection?: {
    value: number;
    unit: string;
  };
} 