import axios, { AxiosError } from 'axios';
import { USGSResponse, WaterData, USGSError } from '../types/usgs';

const BASE_URL = 'https://waterservices.usgs.gov/nwis/iv/';
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

// Helper function to validate USGS response
const validateResponse = (data: any): data is USGSResponse => {
  return (
    data &&
    data.value &&
    Array.isArray(data.value.timeSeries) &&
    data.value.timeSeries.length > 0
  );
};

// Helper function to parse USGS data
const parseUSGSData = (data: USGSResponse): WaterData => {
  const tempData = data.value.timeSeries.find(ts => 
    ts.variable.variableCode[0].value === '00010'
  );
  const dischargeData = data.value.timeSeries.find(ts => 
    ts.variable.variableCode[0].value === '00060'
  );

  if (!tempData || !dischargeData) {
    throw new Error('Required data not found in response');
  }

  return {
    temperature: {
      current: parseFloat(tempData.values[0].value[0].value),
      unit: tempData.variable.unit.unitCode,
      lastUpdated: tempData.values[0].value[0].dateTime,
      history: tempData.values[0].value.map(v => ({
        dateTime: v.dateTime,
        value: parseFloat(v.value)
      }))
    },
    discharge: {
      current: parseFloat(dischargeData.values[0].value[0].value),
      unit: dischargeData.variable.unit.unitCode,
      lastUpdated: dischargeData.values[0].value[0].dateTime,
      history: dischargeData.values[0].value.map(v => ({
        dateTime: v.dateTime,
        value: parseFloat(v.value)
      }))
    }
  };
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

export const fetchWaterData = async (): Promise<WaterData> => {
  try {
    const response = await retryWithBackoff(() => 
      api.get<USGSResponse>('', {
        params: {
          format: 'json',
          sites: '01021050,01021000',
          parameterCd: '00010,00060',
          period: 'P7D'
        }
      })
    );

    if (!validateResponse(response.data)) {
      throw new Error('Invalid response format from USGS API');
    }

    return parseUSGSData(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new USGSError(
        'Failed to fetch water data',
        axiosError.response?.status || 500,
        axiosError.response?.data || 'Unknown error'
      );
    }
    throw error;
  }
}; 