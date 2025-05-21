import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Location, WaterConditions } from '../types/location';
import { storage } from '../database/storage';
import { fetchWaterConditions } from '../api/ndbcApi';
import LocationCard from '../components/LocationCard';
import AddLocationFAB from '../components/AddLocationFAB';

const LocationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [waterConditions, setWaterConditions] = useState<Record<string, WaterConditions>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const loadedLocations = await storage.getLocations();
      setLocations(loadedLocations);
      setError(null);
    } catch (err) {
      setError('Failed to load locations. Please try again.');
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWaterConditions = async () => {
    try {
      // First try to get cached conditions
      const cachedConditions = await storage.getAllWaterConditions();
      
      // If we have locations but no cached conditions, fetch them
      if (locations.length > 0 && Object.keys(cachedConditions).length === 0) {
        const newConditions: Record<string, WaterConditions> = {};
        
        // Fetch conditions for each location
        for (const location of locations) {
          try {
            const conditions = await fetchWaterConditions(location.ndbcStationId);
            if (conditions) {
              newConditions[location.id] = conditions;
              // Save to storage
              await storage.saveWaterConditions(conditions);
            }
          } catch (err) {
            console.error(`Error fetching conditions for ${location.name}:`, err);
          }
        }
        
        setWaterConditions(newConditions);
      } else {
        setWaterConditions(cachedConditions);
      }
    } catch (err) {
      console.error('Error loading water conditions:', err);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLocations();
    await loadWaterConditions();
    setRefreshing(false);
  }, []);

  const handleLocationPress = (location: Location) => {
    navigation.navigate('LocationDetail', { locationId: location.id });
  };

  const handleFavoriteToggle = async (location: Location) => {
    try {
      const updatedLocation = {
        ...location,
        isFavorite: !location.isFavorite,
      };
      
      await storage.saveLocation(updatedLocation);
      
      // Update the locations state
      setLocations(prevLocations =>
        prevLocations.map(loc =>
          loc.id === location.id ? updatedLocation : loc
        )
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update favorite status. Please try again.');
      console.error('Error updating favorite status:', err);
    }
  };

  const handleAddLocation = () => {
    navigation.navigate('AddLocation');
  };

  // Load data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLocations();
      loadWaterConditions();
    }, [])
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map" size={64} color="#BDBDBD" />
      <Text style={styles.emptyText}>No locations added yet</Text>
      <Text style={styles.emptySubtext}>
        Tap the + button to add your first location
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={48} color="#F44336" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadLocations}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Locations</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading locations...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={locations}
          renderItem={({ item }) => (
            <LocationCard
              location={item}
              waterConditions={waterConditions[item.id]}
              onPress={handleLocationPress}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <AddLocationFAB onPress={handleAddLocation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});

export default LocationsScreen; 