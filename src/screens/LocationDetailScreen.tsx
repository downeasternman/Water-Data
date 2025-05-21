import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Location, WaterConditions } from '../types/location';
import { storage } from '../database/storage';
import { fetchWaterConditions } from '../api/ndbcApi';
import WaveHeightCard from '../components/WaveHeightCard';

type LocationDetailRouteParams = {
  LocationDetail: {
    locationId: string;
  };
};

const LocationDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LocationDetailRouteParams, 'LocationDetail'>>();
  const { locationId } = route.params;

  const [location, setLocation] = useState<Location | null>(null);
  const [waterConditions, setWaterConditions] = useState<WaterConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLocation = async () => {
    try {
      setLoading(true);
      const loadedLocation = await storage.getLocation(locationId);
      
      if (!loadedLocation) {
        setError('Location not found');
        return;
      }
      
      setLocation(loadedLocation);
      setError(null);
    } catch (err) {
      setError('Failed to load location. Please try again.');
      console.error('Error loading location:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWaterConditions = async () => {
    if (!location) return;
    
    try {
      // First try to get cached conditions
      const cachedConditions = await storage.getWaterConditions(locationId);
      
      if (cachedConditions) {
        setWaterConditions(cachedConditions);
      } else {
        // Fetch from API
        const conditions = await fetchWaterConditions(location.ndbcStationId);
        if (conditions) {
          setWaterConditions(conditions);
          // Save to storage
          await storage.saveWaterConditions(conditions);
        }
      }
    } catch (err) {
      console.error('Error loading water conditions:', err);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLocation();
    await loadWaterConditions();
    setRefreshing(false);
  }, [location]);

  const handleFavoriteToggle = async () => {
    if (!location) return;
    
    try {
      const updatedLocation = {
        ...location,
        isFavorite: !location.isFavorite,
      };
      
      await storage.saveLocation(updatedLocation);
      setLocation(updatedLocation);
    } catch (err) {
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
      console.error('Error updating favorite status:', err);
    }
  };

  const handleDeleteLocation = async () => {
    if (!location) return;
    
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete ${location.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.deleteLocation(locationId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete location. Please try again.');
              console.error('Error deleting location:', err);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadLocation();
  }, [locationId]);

  useEffect(() => {
    if (location) {
      loadWaterConditions();
    }
  }, [location]);

  const renderContent = () => {
    if (!location) return null;

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationRegion}>{location.region}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Ionicons
              name={location.isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={location.isFavorite ? '#F44336' : '#757575'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.coordinatesContainer}>
          <View style={styles.coordinateItem}>
            <Text style={styles.coordinateLabel}>Latitude</Text>
            <Text style={styles.coordinateValue}>
              {location.latitude.toFixed(4)}°
            </Text>
          </View>
          <View style={styles.coordinateItem}>
            <Text style={styles.coordinateLabel}>Longitude</Text>
            <Text style={styles.coordinateValue}>
              {location.longitude.toFixed(4)}°
            </Text>
          </View>
        </View>

        <View style={styles.stationInfoContainer}>
          <Text style={styles.sectionTitle}>Station Information</Text>
          <View style={styles.stationInfo}>
            <Text style={styles.stationInfoLabel}>Station ID:</Text>
            <Text style={styles.stationInfoValue}>{location.ndbcStationId}</Text>
          </View>
          <View style={styles.stationInfo}>
            <Text style={styles.stationInfoLabel}>Last Updated:</Text>
            <Text style={styles.stationInfoValue}>
              {new Date(location.lastUpdated).toLocaleString()}
            </Text>
          </View>
        </View>

        {waterConditions ? (
          <WaveHeightCard waterConditions={waterConditions} />
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="water" size={48} color="#BDBDBD" />
            <Text style={styles.noDataText}>No water conditions data available</Text>
            <Text style={styles.noDataSubtext}>
              Pull down to refresh and try again
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteLocation}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={styles.deleteButtonText}>Delete Location</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Location Details</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading location details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadLocation}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderContent()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  placeholder: {
    width: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  locationRegion: {
    fontSize: 16,
    color: '#757575',
    marginTop: 4,
  },
  favoriteButton: {
    padding: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  coordinateItem: {
    flex: 1,
    alignItems: 'center',
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#212121',
  },
  stationInfoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  stationInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stationInfoLabel: {
    fontSize: 14,
    color: '#757575',
    width: 100,
  },
  stationInfoValue: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
  noDataContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 8,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 16,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LocationDetailScreen; 