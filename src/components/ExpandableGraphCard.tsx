import React, { useState } from 'react';
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

  // Prepare data for the chart
  const chartData = {
    labels: history.map((h, i) => (i % Math.ceil(history.length / 6) === 0 ? new Date(h.dateTime).toLocaleDateString() : '')),
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
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: '3',
                    strokeWidth: '2',
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