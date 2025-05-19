export interface USGSResponse {
  value: {
    timeSeries: TimeSeries[];
  };
}

export interface TimeSeries {
  sourceInfo: SourceInfo;
  variable: Variable;
  values: Value[];
}

export interface SourceInfo {
  siteName: string;
  siteCode: {
    value: string;
  }[];
  geoLocation: {
    geogLocation: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface Variable {
  variableCode: {
    value: string;
  }[];
  variableName: string;
  unit: {
    unitCode: string;
  };
}

export interface Value {
  value: {
    dateTime: string;
    value: string;
    qualifiers: string[];
  }[];
}

export interface WaterData {
  temperature: {
    current: number;
    unit: string;
    lastUpdated: string;
    history: {
      dateTime: string;
      value: number;
    }[];
  };
  discharge: {
    current: number;
    unit: string;
    lastUpdated: string;
    history: {
      dateTime: string;
      value: number;
    }[];
  };
}

export interface AlertThresholds {
  temperature: {
    high: number;
    low: number;
  };
  discharge: {
    high: number;
    low: number;
  };
}

export class USGSError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details: any
  ) {
    super(message);
    this.name = 'USGSError';
  }
}

export interface USGSRequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface USGSResponseValidation {
  hasTemperature: boolean;
  hasDischarge: boolean;
  isValid: boolean;
  errors: string[];
} 