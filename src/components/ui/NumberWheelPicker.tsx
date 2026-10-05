import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const WHEEL_HEIGHT = 72;

type NumberWheelPickerProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
  style?: StyleProp<ViewStyle>;
};

function buildValues(min: number, max: number, step: number) {
  const values: number[] = [];
  for (let current = min; current <= max; current += step) {
    values.push(current);
  }
  return values;
}

export function NumberWheelPicker({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
  style,
}: NumberWheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const isInteracting = useRef(false);
  const hasMomentum = useRef(false);
  const dragEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [frameWidth, setFrameWidth] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const values = useMemo(() => buildValues(min, max, step), [min, max, step]);
  const itemWidth = suffix ? 96 : 72;
  const sidePadding = frameWidth > 0 ? (frameWidth - itemWidth) / 2 : 0;

  const indexFromOffset = (offsetX: number) => {
    const index = Math.round(offsetX / itemWidth);
    return Math.min(Math.max(index, 0), values.length - 1);
  };

  const scrollToIndex = (index: number, animated = false) => {
    if (!scrollRef.current || index < 0 || index >= values.length) {
      return;
    }

    scrollRef.current.scrollTo({ x: index * itemWidth, animated });
    setFocusedIndex(index);
  };

  // Only sync scroll position when value changes externally (not mid-gesture)
  useEffect(() => {
    if (isInteracting.current || frameWidth <= 0) {
      return;
    }

    const index = values.indexOf(value);
    if (index >= 0) {
      setFocusedIndex(index);
      requestAnimationFrame(() => scrollToIndex(index));
    }
  }, [value, values, frameWidth, itemWidth]);

  const commitIndex = (index: number, animated = true) => {
    scrollToIndex(index, animated);
    const nextValue = values[index];
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const finishScroll = (offsetX: number, animated = true) => {
    commitIndex(indexFromOffset(offsetX), animated);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setFocusedIndex(indexFromOffset(event.nativeEvent.contentOffset.x));
  };

  const handleScrollBeginDrag = () => {
    isInteracting.current = true;
    if (dragEndTimer.current) {
      clearTimeout(dragEndTimer.current);
      dragEndTimer.current = null;
    }
  };

  const handleMomentumScrollBegin = () => {
    hasMomentum.current = true;
    if (dragEndTimer.current) {
      clearTimeout(dragEndTimer.current);
      dragEndTimer.current = null;
    }
  };

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    // Wait briefly — if momentum starts, let onMomentumScrollEnd handle the snap
    dragEndTimer.current = setTimeout(() => {
      if (!hasMomentum.current) {
        finishScroll(offsetX);
      }
      isInteracting.current = false;
    }, 80);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    hasMomentum.current = false;
    isInteracting.current = false;
    finishScroll(event.nativeEvent.contentOffset.x);
  };

  useEffect(() => {
    return () => {
      if (dragEndTimer.current) {
        clearTimeout(dragEndTimer.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {suffix ? <Text style={styles.suffixLabel}>{suffix}</Text> : null}
      </View>
      <View
        style={styles.wheelFrame}
        onLayout={(event) => setFrameWidth(event.nativeEvent.layout.width)}
      >
        <View
          pointerEvents="none"
          style={[styles.selectionBand, { width: itemWidth, marginLeft: -itemWidth / 2 }]}
        />
        <ScrollView
          ref={scrollRef}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={itemWidth}
          decelerationRate={0.985}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: sidePadding }}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollBegin={handleMomentumScrollBegin}
          onMomentumScrollEnd={handleMomentumScrollEnd}
        >
          {values.map((item, index) => {
            const isFocused = index === focusedIndex;
            return (
              <View key={item} style={[styles.itemCell, { width: itemWidth }]}>
                <Text style={[styles.itemText, isFocused ? styles.itemTextFocused : null]}>{item}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  suffixLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
  },
  wheelFrame: {
    height: WHEEL_HEIGHT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  selectionBand: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: '50%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1B5E20',
    backgroundColor: 'rgba(232, 245, 233, 0.25)',
    zIndex: 0,
  },
  itemCell: {
    height: WHEEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    width: '100%',
    fontSize: 24,
    color: '#AAAAAA',
    fontWeight: '600',
    textAlign: 'center',
  },
  itemTextFocused: {
    fontSize: 28,
    color: '#1B5E20',
    fontWeight: '800',
  },
});
