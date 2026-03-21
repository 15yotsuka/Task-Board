import React, { useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../lib/useTheme';
import { useTranslation } from '../../lib/useTranslation';
import { radius, spacing, withAlpha } from '../../lib/theme';
import type { TranslationKey } from '../../lib/i18n/index';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SlideConfig {
  icon: IoniconsName;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}

const SLIDE_CONFIGS: SlideConfig[] = [
  {
    icon: 'checkmark-done-circle-outline',
    titleKey: 'tutorial.slide0.title',
    bodyKey: 'tutorial.slide0.body',
  },
  {
    icon: 'add-circle-outline',
    titleKey: 'tutorial.slide1.title',
    bodyKey: 'tutorial.slide1.body',
  },
  {
    icon: 'layers-outline',
    titleKey: 'tutorial.slide2.title',
    bodyKey: 'tutorial.slide2.body',
  },
  {
    icon: 'hand-left-outline',
    titleKey: 'tutorial.slide3.title',
    bodyKey: 'tutorial.slide3.body',
  },
];

interface Props {
  visible: boolean;
  onComplete: () => void;
}

export function TutorialModal({ visible, onComplete }: Props) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideOpacity = useSharedValue(1);

  const slide = SLIDE_CONFIGS[currentIndex];
  const isLast = currentIndex === SLIDE_CONFIGS.length - 1;

  const animatedSlideStyle = useAnimatedStyle(() => ({ opacity: slideOpacity.value }));

  const changeSlide = (nextIndex: number) => {
    slideOpacity.value = withTiming(0, { duration: 120 }, () => {
      runOnJS(setCurrentIndex)(nextIndex);
      slideOpacity.value = withTiming(1, { duration: 180 });
    });
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      changeSlide(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    setCurrentIndex(0);
    slideOpacity.value = 1;
    onComplete();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          {/* Skip */}
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.5 : 1 }]}
          >
            <Text style={[styles.skipText, { color: theme.secondaryText }]}>{t('tutorial.skip')}</Text>
          </Pressable>

          {/* Animated slide content */}
          <Animated.View style={[styles.slideContent, animatedSlideStyle]}>
            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: withAlpha(theme.primary, 0.12) }]}>
              <Ionicons name={slide.icon} size={56} color={theme.primary} />
            </View>

            {/* Text */}
            <Text style={[styles.title, { color: theme.text }]}>{t(slide.titleKey)}</Text>
            <Text style={[styles.body, { color: theme.secondaryText }]}>{t(slide.bodyKey)}</Text>
          </Animated.View>

          {/* Progress dots */}
          <View style={styles.dots}>
            {SLIDE_CONFIGS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === currentIndex ? theme.primary : theme.border },
                  i === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Next / Done */}
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextBtn,
              { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.nextText}>{isLast ? t('tutorial.start') : t('tutorial.next')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  slideContent: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
  },
  nextBtn: {
    width: '100%',
    paddingVertical: spacing.md - 2,
    borderRadius: radius.button,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  nextText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
