import React from 'react';
import { useTheme } from 'react-native-paper';
import { Icon } from './Icon';
import { ExpandableGraphCard } from './ExpandableGraphCard';

interface DischargeCardProps {
  current: number;
  unit: string;
  lastUpdated: string;
  previousValue?: number;
  history: { dateTime: string; value: number }[];
}

const cubicFeetToGallons = (cubicFeet: number): number => cubicFeet * 7.48052;
const isValidNumber = (n: any) => typeof n === 'number' && !isNaN(n) && isFinite(n);

export const DischargeCard: React.FC<DischargeCardProps> = ({
  current,
  unit,
  lastUpdated,
  previousValue,
  history = [],
}) => {
  const theme = useTheme();
  const change = previousValue ? current - previousValue : 0;
  const changeColor = change > 0 ? theme.colors.primary : change < 0 ? theme.colors.error : theme.colors.onSurface;

  // Always convert to gallons per second for display and graph
  const gallons = unit === 'ft³/s' ? cubicFeetToGallons(current) : current;
  const historyG = history
    .map(h => ({ ...h, value: unit === 'ft³/s' ? cubicFeetToGallons(h.value) : h.value }))
    .filter(h => isValidNumber(h.value));

  // Debug: log the processed history array
  console.log('DischargeCard historyG:', historyG);

  return (
    <ExpandableGraphCard
      title="Water Discharge"
      icon={<Icon name="water" size={24} color={theme.colors.primary} />}
      value={`${gallons.toFixed(0)} gal/s`}
      lastUpdated={lastUpdated}
      history={historyG}
      unit="gal/s"
    >
      {previousValue && (
        <>
          <Icon
            name={change > 0 ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={changeColor}
          />
          <span style={{ color: changeColor, marginLeft: 4 }}>
            {Math.abs(unit === 'ft³/s' ? cubicFeetToGallons(change) : change).toFixed(0)} gal/s
          </span>
        </>
      )}
    </ExpandableGraphCard>
  );
}; 