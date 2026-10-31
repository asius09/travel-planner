'use client';

import { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useTripStore } from '@/store/tripStore';
import { semanticColors } from '@/theme/colors';
import { typography } from '@/theme/tokens';
import { TextMorph } from '@/components/ui/TextMorph';

/** React Navigation's event emitter, as exposed on a navigation object. */
type TabNavEmitter = (event: {
  type: string;
  target: string;
  canPreventDefault?: boolean;
}) => { defaultPrevented?: boolean } | void;

/**
 * Props this custom tab bar reads. They mirror what Expo Router passes to a
 * `tabBar` renderer: React Navigation's navigator state plus Expo Router's
 * `emitter` / `navigateToTab` helpers. Every member is optional so the
 * navigator's richer props stay assignable, and none are typed as `any`.
 */
export interface FloatingTabBarProps {
  state?: { index: number; routes: { key: string; name: string }[] };
  descriptors?: Record<string, unknown>;
  navigation?: { navigate: (name: string) => void; emit?: TabNavEmitter };
  navigateToTab?: (routeKey: string) => void;
  insets?: { top: number; right: number; bottom: number; left: number };
}

interface TabConfig {
  name: string;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  explore: {
    name: 'explore',
    label: 'Explore',
    activeIcon: 'compass',
    inactiveIcon: 'compass-outline',
  },
  trip: {
    name: 'trip',
    label: 'My Trip',
    activeIcon: 'bookmark',
    inactiveIcon: 'bookmark-outline',
  },
  settings: {
    name: 'settings',
    label: 'Settings',
    activeIcon: 'settings',
    inactiveIcon: 'settings-outline',
  },
};

// ---------------------------------------------------------------------------
// Dock geometry
//
// Every gutter of the dock derives from the single DOCK_PADDING constant, so
// the left, right, top and bottom insets always match exactly and stay
// tightly coupled:
//   horizontal gutter = dockWrapper paddingHorizontal
//   vertical gutter   = (DOCK_HEIGHT - ICON_BOX) / 2 = DOCK_PADDING
// ---------------------------------------------------------------------------
const DOCK_PADDING = 4;
const ICON_BOX = 36; // Indicator height / icon slot (square)
const LABEL_GAP = 4; // 8-point grid step between icon and label
const LABEL_WIDTH = 52; // Fixed label slot so every pill aligns identically
const LABEL_SLIDE = 12; // How far the label travels while revealing
const LABEL_SLOT = LABEL_GAP + LABEL_WIDTH; // Fully expanded label slot
const DOCK_HEIGHT = ICON_BOX + DOCK_PADDING * 2;
const DOCK_RADIUS = DOCK_HEIGHT / 2;
const ICON_SIZE = 20;
const INDICATOR_LIFT = -1;

// Grounded spring for the indicator slide (DESIGN.md motion: no bouncy effects).
const SLIDE_SPRING = { duration: 420, dampingRatio: 0.85 };
const PRESS_TIMING = { duration: 80 };

interface TabItemProps {
  config: TabConfig;
  index: number;
  progress: SharedValue<number>;
  isFocused: boolean;
  showBadge: boolean;
  badgeLabel: string;
  onPress: () => void;
  onLongPress: () => void;
}

/**
 * One tab. Inactive tabs render their outline glyph only; the focused tab
 * reveals a TextMorph label beside the glyph. Every frame derives from the
 * same shared `progress` that drives the sliding indicator, so icon, label
 * and indicator move in lockstep. Only opacity, translation and layout width
 * are animated — nothing ever scales.
 */
function TabItem({
  config,
  index,
  progress,
  isFocused,
  showBadge,
  badgeLabel,
  onPress,
  onLongPress,
}: TabItemProps) {
  const pressOpacity = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  // Windowed ramps around this tab's index. Values clamp outside the range,
  // so a tab only reacts while the indicator travels between its neighbours.
  const activation = (): number => {
    'worklet';
    return interpolate(progress.value, [index - 1, index, index + 1], [0, 1, 0], Extrapolation.CLAMP);
  };

  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: activation(),
  }));

  const inactiveStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [index - 1, index, index + 1], [1, 0, 1], Extrapolation.CLAMP),
  }));

  const liftStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [index - 1, index, index + 1],
          [0, INDICATOR_LIFT, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // The label slot grows from 0 to its fixed width, which re-centers the
  // whole icon + label row inside the tab and keeps both optically aligned.
  const labelSlotStyle = useAnimatedStyle(() => ({
    width: activation() * LABEL_SLOT,
    opacity: activation(),
  }));

  const labelSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - activation()) * LABEL_SLIDE }],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    opacity: pressOpacity.value,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={config.label}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability
        pressOpacity.value = withTiming(0.72, PRESS_TIMING);
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability
        pressOpacity.value = withTiming(1, PRESS_TIMING);
      }}
      style={styles.tabButton}
      hitSlop={{ top: 8, bottom: 8 }}
    >
      <Animated.View style={[styles.tabContent, liftStyle, pressStyle]}>
        <Animated.View style={styles.iconSlot}>
          {/* Inactive: outline glyph + trip badge */}
          <Animated.View style={[styles.iconLayer, inactiveStyle]}>
            <Ionicons
              name={config.inactiveIcon}
              size={ICON_SIZE}
              color="rgba(255, 255, 255, 0.72)"
            />
            {showBadge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeLabel}</Text>
              </View>
            )}
          </Animated.View>
          {/* Active: filled glyph rides the sliding accent pill */}
          <Animated.View style={[styles.iconLayer, activeIconStyle]}>
            <Ionicons
              name={config.activeIcon}
              size={ICON_SIZE}
              color={semanticColors.accentForeground}
            />
          </Animated.View>
        </Animated.View>

        {/* Label: TextMorph morphs the glyphs in with its minor scale whenever
            this tab becomes active, and morphs them out on deactivate. */}
        <Animated.View style={[styles.labelSlot, labelSlotStyle]}>
          <Animated.View style={[styles.labelInner, labelSlideStyle]}>
            <TextMorph
              text={isFocused ? config.label : ''}
              initial={!reduceMotion}
              autoSize={false}
              scatter={{ x: 0, y: 0 }}
              textStyle={styles.labelText}
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Geometry for the travelling indicator at a (possibly fractional) tab
 * position. Mid-flight the pill collapses to a circle over the gap between
 * tabs, then re-expands around the incoming icon + label.
 */
const indicatorGeometry = (position: number, tabWidth: number): { left: number; width: number } => {
  'worklet';
  const nearest = Math.round(position);
  const activation = Math.max(0, Math.min(1, 1 - 2 * Math.abs(position - nearest)));
  const width = ICON_BOX + activation * LABEL_SLOT;
  const center = position * tabWidth + tabWidth / 2;
  return { left: center - width / 2, width };
};

export function FloatingTabBar({ state, navigation, navigateToTab, insets }: FloatingTabBarProps) {
  const { width } = useWindowDimensions();
  const { destinations } = useTripStore();
  const tripCount = destinations.length;
  const reduceMotion = useReducedMotion();

  const routes = state?.routes?.filter(route => route.name in TAB_CONFIGS) ?? [];
  const activeIndex = state?.index ?? 0;

  const dockWidth = Math.min(width - 96, 300);
  const tabWidth = routes.length > 0 ? (dockWidth - DOCK_PADDING * 2) / routes.length : 0;
  const bottomMargin = Math.max(insets?.bottom || 0, 14) + 6;

  // A single animated value drives the whole switch choreography (indicator
  // travel + expansion, icon crossfades, label reveal) so every layer stays
  // in lockstep. It springs to the focused index; reduced motion snaps instead.
  const activeProgress = useSharedValue(activeIndex);

  useEffect(() => {
    if (activeProgress.value === activeIndex) return;
    activeProgress.value = reduceMotion
      ? activeIndex
      : withSpring(activeIndex, SLIDE_SPRING);
  }, [activeIndex, activeProgress, reduceMotion]);

  // The accent pill stays centered on the travelling tab position while its
  // width breathes between a circle (in flight) and the icon + label pill.
  const indicatorStyle = useAnimatedStyle(() => {
    const geometry = indicatorGeometry(activeProgress.value, tabWidth);
    return {
      width: geometry.width,
      transform: [{ translateX: geometry.left }, { translateY: INDICATOR_LIFT }],
    };
  });

  if (routes.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          bottom: bottomMargin,
        },
      ]}
    >
      <View
        style={[
          styles.dockWrapper,
          {
            width: dockWidth,
            height: DOCK_HEIGHT,
            borderRadius: DOCK_RADIUS,
          },
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(18, 24, 20, 0.94)' }]} />
        )}

        {/* Hairline top gloss border */}
        <View style={styles.topGloss} />

        {/* Tab Items Row */}
        <View style={styles.tabsRow}>
          {/* Shared accent indicator that glides and expands between tabs */}
          <Animated.View pointerEvents="none" style={[styles.activeIndicator, indicatorStyle]} />

          {routes.map((route, index) => {
            const config = TAB_CONFIGS[route.name];
            if (!config) return null;
            const isFocused = activeIndex === index;

            const onPress = () => {
              try {
                Haptics.selectionAsync();
              } catch {
                // Ignore
              }

              const emit = navigation?.emit;
              const event = emit
                ? emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  })
                : { defaultPrevented: false };

              if (!isFocused && !event?.defaultPrevented) {
                if (navigateToTab) {
                  navigateToTab(route.key);
                } else if (navigation?.navigate) {
                  navigation.navigate(route.name);
                }
              }
            };

            const onLongPress = () => {
              const emit = navigation?.emit;
              emit?.({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const showBadge = route.name === 'trip' && tripCount > 0;

            return (
              <TabItem
                key={route.key}
                config={config}
                index={index}
                progress={activeProgress}
                isFocused={isFocused}
                showBadge={showBadge}
                badgeLabel={tripCount > 9 ? '9+' : String(tripCount)}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  dockWrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: Platform.select({
      ios: 'rgba(20, 26, 22, 0.85)',
      default: 'rgba(20, 26, 22, 0.95)',
    }),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 10,
    justifyContent: 'center',
    // Vertical gutter comes from height = ICON_BOX + 2 * DOCK_PADDING.
    paddingHorizontal: DOCK_PADDING,
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: ICON_BOX,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: ICON_BOX,
    borderRadius: ICON_BOX / 2,
    backgroundColor: semanticColors.accent,
    shadowColor: semanticColors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    height: ICON_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSlot: {
    width: ICON_BOX,
    height: ICON_BOX,
  },
  iconLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: semanticColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 10,
    lineHeight: 12,
    color: semanticColors.accentForeground,
  },
  labelSlot: {
    height: ICON_BOX,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingLeft: LABEL_GAP,
  },
  labelInner: {
    width: LABEL_WIDTH,
    alignItems: 'flex-start',
  },
  labelText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.caption,
    lineHeight: 14,
    color: semanticColors.accentForeground,
  },
});
