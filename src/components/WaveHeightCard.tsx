import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WaterConditions } from '../types/location';

interface WaveHeightCardProps {
  waterConditions: WaterConditions;
}

const WaveHeightCard: React.FC<WaveHeightCardProps> = ({ waterConditions }) => {
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

  const getWaveHeightDescription = (value: number, unit: string) => {
    // Convert to feet if in meters
    const feet = unit === 'm' ? value * 3.28084 : value;
    
    if (feet < 1) return 'Flat';
    if (feet < 2) return 'Small';
    if (feet < 3) return 'Moderate';
    if (feet < 5) return 'Large';
    if (feet < 8) return 'Very Large';
    return 'Huge';
  };

  const getWaveDirectionText = (degrees: number) => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getWindDirectionText = (degrees: number) => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const waveHeight = waterConditions.waveHeight.value;
  const waveHeightUnit = waterConditions.waveHeight.unit;
  const waveHeightColor = getWaveHeightColor(waveHeight, waveHeightUnit);
  const waveHeightDescription = getWaveHeightDescription(waveHeight, waveHeightUnit);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="pulse" size={24} color={waveHeightColor} />
        <Text style={styles.title}>Wave Conditions</Text>
      </View>

      <View style={styles.mainInfo}>
        <Text style={[styles.waveHeight, { color: waveHeightColor }]}>
          {formatWaveHeight(waveHeight, waveHeightUnit)}
        </Text>
        <Text style={styles.waveDescription}>{waveHeightDescription}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Wave Period</Text>
            <Text style={styles.detailValue}>
              {waterConditions.wavePeriod.value.toFixed(1)} sec
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Wave Direction</Text>
            <Text style={styles.detailValue}>
              {getWaveDirectionText(waterConditions.waveDirection.value)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Wind Speed</Text>
            <Text style={styles.detailValue}>
              {waterConditions.windSpeed.value.toFixed(1)} {waterConditions.windSpeed.unit}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Wind Direction</Text>
            <Text style={styles.detailValue}>
              {getWindDirectionText(waterConditions.windDirection.value)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          Updated: {new Date(waterConditions.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#212121',
  },
  mainInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  waveHeight: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  waveDescription: {
    fontSize: 16,
    color: '#757575',
    marginTop: 4,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
  },
});

export default WaveHeightCard; 