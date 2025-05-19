import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Icon } from './Icon';

interface TemperatureCardProps {
  current: number;
  unit: string;
  lastUpdated: string;
  previousValue?: number;
}

const celsiusToFahrenheit = (c: number): number => {
  return (c * 9/5) + 32;
};

const fahrenheitToCelsius = (f: number): number => {
  return (f - 32) * (5/9);
};

export const TemperatureCard: React.FC<TemperatureCardProps> = ({
  current,
  unit,
  lastUpdated,
  previousValue,
}) => {
  const theme = useTheme();
  const change = previousValue ? current - previousValue : 0;
  const changeColor = change > 0 ? theme.colors.error : change < 0 ? theme.colors.primary : theme.colors.onSurface;
  
  // Convert based on input unit
  let fahrenheit: number;
  let celsius: number;
  
  // Check if the unit string contains 'C' to determine if input is Celsius
  if (unit.includes('C')) {
    celsius = current;
    fahrenheit = celsiusToFahrenheit(current);
  } else {
    fahrenheit = current;
    celsius = fahrenheitToCelsius(current);
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Icon name="thermometer" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium">Water Temperature</Text>
        </View>
        
        <View style={styles.valueContainer}>
          <Text variant="displaySmall" style={styles.value}>
            {`${fahrenheit.toFixed(1)}°F (${celsius.toFixed(1)}°C)`}
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
              {Math.abs(change).toFixed(1)} {unit}
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