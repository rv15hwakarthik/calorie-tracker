import { Pressable, StyleSheet, Text, View } from 'react-native';

type NumberStepperProps = {
  label: string;
  value: number;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

export function NumberStepper({
  label,
  value,
  suffix,
  step = 1,
  min = 0,
  max = 999,
  onChange,
}: NumberStepperProps) {
  const decrease = () => onChange(Math.max(min, value - step));
  const increase = () => onChange(Math.min(max, value + step));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={decrease} style={styles.button}>
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>
          {value}
          {suffix ? ` ${suffix}` : ''}
        </Text>
        <Pressable accessibilityRole="button" onPress={increase} style={styles.button}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B5E20',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },
});
