import React from 'react';
import { useTheme } from 'react-native-paper';
import { Icon } from './Icon';
import { ExpandableGraphCard } from './ExpandableGraphCard';

interface TemperatureCardProps {
  current: number;
  unit: string;
  lastUpdated: string;
  previousValue?: number;
  history: { dateTime: string; value: number }[];
}

const celsiusToFahrenheit = (c: number): number => (c * 9/5) + 32;
const isValidNumber = (n: any) => typeof n === 'number' && !isNaN(n) && isFinite(n);

export const TemperatureCard: React.FC<TemperatureCardProps> = ({
  current,
  unit,
  lastUpdated,
  previousValue,
  history = [],
}) => {
  const theme = useTheme();
  const change = previousValue ? current - previousValue : 0;
  const changeColor = change > 0 ? theme.colors.error : change < 0 ? theme.colors.primary : theme.colors.onSurface;

  // Always convert to Fahrenheit for display and graph
  const fahrenheit = unit.includes('C') ? celsiusToFahrenheit(current) : current;
  const historyF = history
    .map(h => ({ ...h, value: unit.includes('C') ? celsiusToFahrenheit(h.value) : h.value }))
    .filter(h => isValidNumber(h.value));

  // Debug: log the processed history array
  console.log('TemperatureCard historyF:', historyF);

  return (
    <ExpandableGraphCard
      title="Water Temperature"
      icon={<Icon name="thermometer" size={24} color={theme.colors.primary} />}
      value={`${fahrenheit.toFixed(1)}°F`}
      lastUpdated={lastUpdated}
      history={historyF}
      unit="°F"
    >
      {previousValue && (
        <>
          <Icon
            name={change > 0 ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={changeColor}
          />
          <span style={{ color: changeColor, marginLeft: 4 }}>
            {Math.abs(unit.includes('C') ? celsiusToFahrenheit(change) : change).toFixed(1)} °F
          </span>
        </>
      )}
    </ExpandableGraphCard>
  );
}; 