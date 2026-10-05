import { StyleSheet, Text, TextInput, View } from 'react-native';

type TargetFieldProps = {
  label: string;
  value: string;
  suffix: string;
  onChangeText: (value: string) => void;
};

export function TargetField({ label, value, suffix, onChangeText }: TargetFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
        />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
  },
  suffix: {
    fontSize: 18,
    color: '#666666',
    marginLeft: 8,
  },
});
