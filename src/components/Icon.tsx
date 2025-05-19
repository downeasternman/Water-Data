import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface IconProps {
  name: string;
  size: number;
  color: string;
}

const getEmojiIcon = (name: string): string => {
  switch (name) {
    case 'thermometer':
      return '🌡️';
    case 'water':
      return '💧';
    case 'arrow-up':
      return '↑';
    case 'arrow-down':
      return '↓';
    default:
      return '•';
  }
};

export const Icon: React.FC<IconProps> = ({ name, size, color }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webIcon, { width: size, height: size }]}>
        <span style={{ fontSize: size, color }}>{getEmojiIcon(name)}</span>
      </View>
    );
  }

  return <MaterialCommunityIcons name={name} size={size} color={color} />;
};

const styles = StyleSheet.create({
  webIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 