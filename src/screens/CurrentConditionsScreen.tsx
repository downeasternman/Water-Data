import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Surface, Text, useTheme, Button } from 'react-native-paper';
import { TemperatureCard } from '../components/TemperatureCard';
import { DischargeCard } from '../components/DischargeCard';
import { fetchWaterData } from '../api/usgsApi';
import { WaterData, USGSError } from '../types/usgs';
import { saveWaterData, getLatestWaterData } from '../database/db';
import NetInfo from '@react-native-community/netinfo';

export const CurrentConditionsScreen: React.FC = () => {
  const theme = useTheme();
  const [waterData, setWaterData] = useState<WaterData | null>(null);
  const [previousData, setPreviousData] = useState<WaterData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (showError = true) => {
    try {
      setIsLoading(true);
      setError(null);
      const netInfo = await NetInfo.fetch();
      setIsOffline(!netInfo.isConnected);

      if (netInfo.isConnected) {
        const data = await fetchWaterData();
        setPreviousData(waterData);
        setWaterData(data);
        saveWaterData(data);
      } else {
        const cachedData = await getLatestWaterData();
        setWaterData(cachedData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error instanceof USGSError) {
        setError(`Failed to fetch data: ${error.message}`);
        if (showError) {
          Alert.alert(
            'Error',
            `Failed to fetch water data: ${error.message}`,
            [{ text: 'OK', onPress: () => setError(null) }]
          );
        }
      } else {
        setError('An unexpected error occurred');
        if (showError) {
          Alert.alert(
            'Error',
            'An unexpected error occurred while loading data',
            [{ text: 'OK', onPress: () => setError(null) }]
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();

    // Set up periodic refresh (every 4 hours)
    const interval = setInterval(() => loadData(false), 4 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading && !waterData) {
    return (
      <Surface style={styles.container}>
        <Text>Loading...</Text>
      </Surface>
    );
  }

  if (error && !waterData) {
    return (
      <Surface style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => loadData()} style={styles.retryButton}>
          Retry
        </Button>
      </Surface>
    );
  }

  // Debug: log the raw history arrays
  if (waterData) {
    console.log('Raw temperature history:', waterData.temperature.history);
    console.log('Raw discharge history:', waterData.discharge.history);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {isOffline && (
        <Surface style={[styles.offlineBanner, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.offlineText}>Offline Mode - Showing Cached Data</Text>
        </Surface>
      )}

      {error && (
        <Surface style={[styles.errorBanner, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.errorText}>{error}</Text>
        </Surface>
      )}

      <TemperatureCard
        current={waterData?.temperature.current}
        unit={waterData?.temperature.unit}
        lastUpdated={waterData?.temperature.lastUpdated}
        previousValue={previousData?.temperature.current}
        history={waterData?.temperature.history || []}
      />

      <DischargeCard
        current={waterData?.discharge.current}
        unit={waterData?.discharge.unit}
        lastUpdated={waterData?.discharge.lastUpdated}
        previousValue={previousData?.discharge.current}
        history={waterData?.discharge.history || []}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  offlineBanner: {
    padding: 8,
    margin: 8,
    borderRadius: 4,
  },
  offlineText: {
    color: 'white',
    textAlign: 'center',
  },
  errorBanner: {
    padding: 8,
    margin: 8,
    borderRadius: 4,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    margin: 16,
  },
}); 