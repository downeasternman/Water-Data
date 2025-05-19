import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Icon } from './Icon';

interface DischargeCardProps {
  current: number;
  unit: string;
  lastUpdated: string;
  previousValue?: number;
}

const cubicFeetToGallons = (cubicFeet: number): number => {
  return cubicFeet * 7.48052;
};

const gallonsToCubicFeet = (gallons: number): number => {
  return gallons / 7.48052;
};

export const DischargeCard: React.FC<DischargeCardProps> = ({
  current,
  unit,
  lastUpdated,
  previousValue,
}) => {
  const theme = useTheme();
  const change = previousValue ? current - previousValue : 0;
  const changeColor = change > 0 ? theme.colors.primary : change < 0 ? theme.colors.error : theme.colors.onSurface;

  // Convert based on input unit
  let cubicFeet: number;
  let gallons: number;
  
  if (unit === 'ft³/s') {
    cubicFeet = current;
    gallons = cubicFeetToGallons(current);
  } else {
    gallons = current;
    cubicFeet = gallonsToCubicFeet(current);
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Icon name="water" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium">Water Discharge</Text>
        </View>
        
        <View style={styles.valueContainer}>
          <Text variant="displaySmall" style={styles.value}>
            {`${cubicFeet.toFixed(0)} ft³/s (${gallons.toFixed(0)} gal/s)`}
          </Text>
        </View>

        {previousValue && (
          <View style={styles.changeContainer}>
            <Icon
              name={change > 0 ? 'arrow-up' : 'arrow-down'}
              size={16}
              color={changeColor}
            />
            <Text
              variant="bodyMedium"
              style={[styles.change, { color: changeColor }]}
            >
              {Math.abs(change).toFixed(0)} {unit}
            </Text>
          </View>
        )}

        <Text variant="bodySmall" style={styles.lastUpdated}>
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    marginRight: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  change: {
    marginLeft: 4,
  },
  lastUpdated: {
    opacity: 0.6,
  },
}); 