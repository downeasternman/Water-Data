import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NDBCStation } from '../types/location';
import { fetchStationList } from '../api/ndbcApi';
import { storage } from '../database/storage';
import { v4 as uuidv4 } from 'uuid';

const AddLocationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState<NDBCStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<NDBCStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = [
    'Northeast',
    'Southeast',
    'Gulf Coast',
    'West Coast',
    'Hawaii',
    'Alaska',
    'Great Lakes',
  ];

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    filterStations();
  }, [searchQuery, selectedRegion, stations]);

  const loadStations = async () => {
    try {
      setLoading(true);
      const stationList = await fetchStationList();
      setStations(stationList);
      setFilteredStations(stationList);
      setError(null);
    } catch (err) {
      setError('Failed to load stations. Please try again.');
      console.error('Error loading stations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterStations = () => {
    let filtered = [...stations];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        station =>
          station.name.toLowerCase().includes(query) ||
          station.id.toLowerCase().includes(query)
      );
    }

    // Filter by region
    if (selectedRegion) {
      filtered = filtered.filter(station => station.region === selectedRegion);
    }

    setFilteredStations(filtered);
  };

  const handleAddLocation = async (station: NDBCStation) => {
    try {
      const locationId = uuidv4();
      const newLocation = {
        id: locationId,
        name: station.name,
        region: station.region,
        latitude: station.latitude,
        longitude: station.longitude,
        ndbcStationId: station.id,
        isFavorite: false,
        userGroups: [],
        lastUpdated: new Date().toISOString(),
      };

      await storage.saveLocation(newLocation);
      Alert.alert('Success', `${station.name} has been added to your locations.`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to add location. Please try again.');
      console.error('Error adding location:', err);
    }
  };

  const renderStationItem = ({ item }: { item: NDBCStation }) => (
    <TouchableOpacity
      style={styles.stationItem}
      onPress={() => handleAddLocation(item)}
    >
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.stationId}>Station ID: {item.id}</Text>
        <Text style={styles.stationRegion}>{item.region}</Text>
      </View>
      <View style={styles.stationData}>
        {item.hasWaterTemperature && (
          <View style={styles.dataIndicator}>
            <Ionicons name="water" size={16} color="#2196F3" />
            <Text style={styles.dataText}>Temp</Text>
          </View>
        )}
        {item.hasWaveHeight && (
          <View style={styles.dataIndicator}>
            <Ionicons name="pulse" size={16} color="#FF9800" />
            <Text style={styles.dataText}>Waves</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
    </TouchableOpacity>
  );

  const renderRegionFilter = () => (
    <View style={styles.regionFilterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.regionFilter,
            selectedRegion === null && styles.regionFilterActive,
          ]}
          onPress={() => setSelectedRegion(null)}
        >
          <Text
            style={[
              styles.regionFilterText,
              selectedRegion === null && styles.regionFilterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {regions.map(region => (
          <TouchableOpacity
            key={region}
            style={[
              styles.regionFilter,
              selectedRegion === region && styles.regionFilterActive,
            ]}
            onPress={() => setSelectedRegion(region)}
          >
            <Text
              style={[
                styles.regionFilterText,
                selectedRegion === region && styles.regionFilterTextActive,
              ]}
            >
              {region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Location</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or station ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#757575" />
          </TouchableOpacity>
        ) : null}
      </View>

      {renderRegionFilter()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading stations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadStations}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredStations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color="#BDBDBD" />
          <Text style={styles.emptyText}>No stations found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStations}
          renderItem={renderStationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#212121',
  },
  clearButton: {
    padding: 4,
  },
  regionFilterContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  regionFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  regionFilterActive: {
    backgroundColor: '#2196F3',
  },
  regionFilterText: {
    fontSize: 14,
    color: '#757575',
  },
  regionFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  stationId: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  stationRegion: {
    fontSize: 14,
    color: '#757575',
  },
  stationData: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  dataText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 2,
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

export default AddLocationScreen; 