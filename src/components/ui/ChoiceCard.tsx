import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type ChoiceCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  selected: boolean;
  onPress: () => void;
};

function CheckBadge() {
  return (
    <View style={styles.checkBadge} accessibilityLabel="Selected">
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 6 9 17l-5-5"
          stroke="#FFFFFF"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function ChoiceCard({
  title,
  description = '',
  icon,
  selected,
  onPress,
}: ChoiceCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.card, selected ? styles.selected : null]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {selected ? <CheckBadge /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 18,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: {
    borderColor: '#1B5E20',
    backgroundColor: '#F1F8E9',
  },
  iconWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
  },
  description: {
    fontSize: 17,
    lineHeight: 24,
    color: '#555555',
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
