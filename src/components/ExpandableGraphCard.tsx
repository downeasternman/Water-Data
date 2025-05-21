import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet, Dimensions } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExpandableGraphCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  lastUpdated: string;
  history: { dateTime: string; value: number }[];
  unit: string;
  children?: React.ReactNode;
}

const roundToNearestStep = (value: number, step: number): number => {
  return Math.round(value / step) * step;
};

const calculateOptimalStep = (min: number, max: number, targetSteps: number = 5): number => {
  const range = max - min;
  const roughStep = range / targetSteps;
  
  // Possible step sizes
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  
  // Find the step size that gives closest to desired number of steps
  return steps.reduce((prev, curr) => {
    return Math.abs(roughStep - curr) < Math.abs(roughStep - prev) ? curr : prev;
  });
};

export const ExpandableGraphCard: React.FC<ExpandableGraphCardProps> = ({
  title,
  icon,
  value,
  lastUpdated,
  history,
  unit,
  children,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  // Calculate Y-axis configuration
  const yAxisConfig = useMemo(() => {
    if (history.length === 0) return { min: 0, max: 100, step: 20 };

    const values = history.map(h => h.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Add padding to min/max (10% of range)
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    let step;
    if (unit === '°F') {
      step = 5; // Fixed 5°F increments for temperature
    } else if (unit === 'gal/s') {
      step = calculateOptimalStep(minValue - padding, maxValue + padding);
    } else {
      step = calculateOptimalStep(minValue - padding, maxValue + padding);
    }

    // Round min and max to nearest step
    const min = Math.floor((minValue - padding) / step) * step;
    const max = Math.ceil((maxValue + padding) / step) * step;

    return { min, max, step };
  }, [history, unit]);

  // Prepare data for the chart
  const chartData = {
    // Show fewer labels on x-axis (only every 12th point)
    labels: history.map((h, i) => (i % 12 === 0 ? new Date(h.dateTime).toLocaleDateString() : '')),
    datasets: [
      {
        data: history.map(h => h.value),
      },
    ],
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            {icon}
            <Text variant="titleMedium">{title}</Text>
          </View>
          <View style={styles.valueContainer}>
            <Text variant="displaySmall" style={styles.value}>{value}</Text>
          </View>
          <Text variant="bodySmall" style={styles.lastUpdated}>
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </Text>
          {expanded && (
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 48}
                height={180}
                yAxisSuffix={` ${unit}`}
                yAxisInterval={1} // Show all grid lines
                segments={Math.floor((yAxisConfig.max - yAxisConfig.min) / yAxisConfig.step)}
                fromNumber={yAxisConfig.max}
                toNumber={yAxisConfig.min}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: unit === '°F' ? 1 : 0,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  strokeWidth: 2,
                  propsForBackgroundLines: {
                    strokeDasharray: '', // Solid lines
                    strokeWidth: '0.5',
                    stroke: '#E0E0E0',
                  },
                  propsForVerticalLabels: {
                    fontSize: 10,
                  },
                  propsForHorizontalLabels: {
                    fontSize: 10,
                  },
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: '2',
                    strokeWidth: '1',
                    stroke: '#2196f3',
                  },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
              />
            </View>
          )}
          {children}
        </Card.Content>
      </Card>
    </TouchableOpacity>
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
  lastUpdated: {
    opacity: 0.6,
  },
  chartContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
}); 