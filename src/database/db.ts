import { storage } from './storage';
import { WaterData } from '../types/usgs';

// Initialize storage
storage.init();

export const saveWaterData = (data: WaterData) => {
  storage.saveData(data);
};

export const getLatestWaterData = async (): Promise<WaterData> => {
  return storage.getLatestData();
}; 