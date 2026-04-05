import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  Keyboard,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../lib/useTheme";
import { radius, spacing } from "../../lib/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const CLOSE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 800;

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, children }: Props) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  const [localVisible, setLocalVisible] = useState(false);
  const isMounted = useRef(false);

  const overlayOpacity = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const keyboardOffset = useSharedValue(0);
  const iosEase = Easing.bezier(0.32, 0.72, 0, 1);

  const openSheet = () => {
    overlayOpacity.value = withTiming(1, { duration: 220 });
    translateY.value = withSpring(0, {
      damping: 28,
      stiffness: 300,
      mass: 0.8,
    });
  };

  useEffect(() => {
    // 初期マウント時に visible=false であればアニメーションをスキップ
    if (!isMounted.current) {
      isMounted.current = true;
      if (!visible) return;
    }

    if (visible) {
      setLocalVisible(true);
      // openSheet is called via Modal's onShow callback
    } else {
      // 前のアニメーションをキャンセルしてからcloseアニメーション開始
      cancelAnimation(overlayOpacity);
      cancelAnimation(translateY);
      overlayOpacity.value = withTiming(0, { duration: 220 });
      translateY.value = withTiming(
        SCREEN_HEIGHT,
        { duration: 300, easing: iosEase },
        () => {
          runOnJS(setLocalVisible)(false);
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // アンマウント時にアニメーションをキャンセルしてModalが残留しないようにする
  useEffect(() => {
    return () => {
      cancelAnimation(overlayOpacity);
      cancelAnimation(translateY);
      translateY.value = SCREEN_HEIGHT;
      overlayOpacity.value = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!localVisible) {
      keyboardOffset.value = 0; // Modal非表示時はoffsetをリセット
      return;
    }
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = Keyboard.addListener(showEvent, (e) => {
      keyboardOffset.value = withTiming(e.endCoordinates.height, {
        duration: 250,
      });
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      keyboardOffset.value = withTiming(0, { duration: 250 });
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localVisible]);

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        overlayOpacity.value = Math.max(0, 1 - e.translationY / SCREEN_HEIGHT);
      }
    })
    .onEnd((e) => {
      if (
        e.translationY > CLOSE_THRESHOLD ||
        e.velocityY > VELOCITY_THRESHOLD
      ) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, {
          damping: 28,
          stiffness: 180,
          mass: 0.9,
        });
        overlayOpacity.value = withTiming(1, { duration: 150 });
      }
    });

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const wrapperStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardOffset.value,
  }));

  return (
    <Modal
      visible={localVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      onShow={openSheet}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.root}>
          <Animated.View style={[styles.overlay, overlayStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          </Animated.View>

          <Animated.View
            style={[styles.sheetWrapper, wrapperStyle]}
            pointerEvents="box-none"
          >
            <GestureDetector gesture={dragGesture}>
              <Animated.View
                style={[
                  styles.sheet,
                  sheetStyle,
                  {
                    backgroundColor: theme.cardBg,
                    paddingBottom: insets.bottom + spacing.md,
                  },
                ]}
              >
                {/* Grab bar */}
                <Pressable
                  hitSlop={{ top: 16, bottom: 16, left: 60, right: 60 }}
                >
                  <View
                    style={[styles.grabBar, { backgroundColor: theme.border }]}
                  />
                </Pressable>
                <ScrollView
                  style={styles.scroll}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {children}
                </ScrollView>
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    flex: 1,
    maxHeight: "90%",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  grabBar: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: spacing.md - 4,
  },
  scroll: {
    flex: 1,
  },
});
