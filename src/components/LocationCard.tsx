import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Location, WaterConditions } from '../types/location';

interface LocationCardProps {
  location: Location;
  waterConditions?: WaterConditions | null;
  onPress: (location: Location) => void;
  onFavoriteToggle: (location: Location) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  waterConditions,
  onPress,
  onFavoriteToggle,
}) => {
  const formatTemperature = (value: number, unit: string) => {
    // Convert to Fahrenheit if in Celsius
    if (unit === 'degC') {
      const fahrenheit = (value * 9/5) + 32;
      return `${fahrenheit.toFixed(1)}°F`;
    }
    return `${value.toFixed(1)}°F`;
  };

  const formatWaveHeight = (value: number, unit: string) => {
    // Convert to feet if in meters
    if (unit === 'm') {
      const feet = value * 3.28084;
      return `${feet.toFixed(1)} ft`;
    }
    return `${value.toFixed(1)} ft`;
  };

  const getWaveHeightColor = (value: number, unit: string) => {
    // Convert to feet if in meters
    const feet = unit === 'm' ? value * 3.28084 : value;
    
    if (feet < 1) return '#4CAF50'; // Green for small waves
    if (feet < 3) return '#FFC107'; // Yellow for moderate waves
    if (feet < 5) return '#FF9800'; // Orange for large waves
    return '#F44336'; // Red for very large waves
  };

  const getTemperatureColor = (value: number, unit: string) => {
    // Convert to Fahrenheit if in Celsius
    const fahrenheit = unit === 'degC' ? (value * 9/5) + 32 : value;
    
    if (fahrenheit < 50) return '#2196F3'; // Blue for cold water
    if (fahrenheit < 65) return '#4CAF50'; // Green for cool water
    if (fahrenheit < 75) return '#FFC107'; // Yellow for warm water
    return '#F44336'; // Red for hot water
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(location)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.locationName}>{location.name}</Text>
        <TouchableOpacity
          onPress={() => onFavoriteToggle(location)}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={location.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={location.isFavorite ? '#F44336' : '#757575'}
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.region}>{location.region}</Text>
      
      {waterConditions ? (
        <View style={styles.conditionsContainer}>
          <View style={styles.conditionItem}>
            <Ionicons name="water" size={20} color="#2196F3" />
            <Text style={styles.conditionLabel}>Water Temp</Text>
            <Text 
              style={[
                styles.conditionValue, 
                { color: getTemperatureColor(
                  waterConditions.waterTemperature.value, 
                  waterConditions.waterTemperature.unit
                )}
              ]}
            >
              {formatTemperature(
                waterConditions.waterTemperature.value,
                waterConditions.waterTemperature.unit
              )}
            </Text>
          </View>
          
          <View style={styles.conditionItem}>
            <Ionicons name="pulse" size={20} color="#FF9800" />
            <Text style={styles.conditionLabel}>Wave Height</Text>
            <Text 
              style={[
                styles.conditionValue, 
                { color: getWaveHeightColor(
                  waterConditions.waveHeight.value, 
                  waterConditions.waveHeight.unit
                )}
              ]}
            >
              {formatWaveHeight(
                waterConditions.waveHeight.value,
                waterConditions.waveHeight.unit
              )}
            </Text>
          </View>
          
          <View style={styles.conditionItem}>
            <Ionicons name="time" size={20} color="#9C27B0" />
            <Text style={styles.conditionLabel}>Wave Period</Text>
            <Text style={styles.conditionValue}>
              {waterConditions.wavePeriod.value.toFixed(1)} sec
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No water conditions data available</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.lastUpdated}>
          Last updated: {new Date(location.lastUpdated).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  favoriteButton: {
    padding: 4,
  },
  region: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  conditionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  conditionItem: {
    alignItems: 'center',
    flex: 1,
  },
  conditionLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  conditionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  noDataContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noDataText: {
    color: '#757575',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
  },
});

export default LocationCard; 