import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type StepScreenProps = {
  title: string;
  subtitle?: string;
  stepLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Scroll only the step body — header/footer stay fixed; off for horizontal pickers */
  scrollBody?: boolean;
};

export function StepScreen({
  title,
  subtitle,
  stepLabel,
  children,
  footer,
  scrollBody = false,
}: StepScreenProps) {
  const header = (
    <>
      <Text style={styles.stepLabel}>{stepLabel}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.main}>
        <View style={styles.header}>{header}</View>

        {scrollBody ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.body}>{children}</View>
        )}

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  main: {
    flex: 1,
  },
  header: {
    flexShrink: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: '#444444',
    marginBottom: 8,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
});
