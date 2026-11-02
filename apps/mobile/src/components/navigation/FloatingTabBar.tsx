'use client';

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
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
  type SharedValue,
} from 'react-native-reanimated';
import { useTripStore } from '@/store/tripStore';
import { semanticColors } from '@/theme/colors';

type TabNavEmitter = (event: {
  type: string;
  target: string;
  canPreventDefault?: boolean;
}) => { defaultPrevented?: boolean } | void;

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

const DOCK_PADDING = 4;
const ICON_BOX = 44;
const DOCK_HEIGHT = ICON_BOX + DOCK_PADDING * 2; // 52px
const DOCK_RADIUS = DOCK_HEIGHT / 2; // 26px
const TAB_GAP = 4;

// Inactive tab is a 44x44 square, perfectly concentric with the dock's 26px radius ends
const INACTIVE_WIDTH = 44;

// Uniform active width across all tabs for consistent padding and perfect symmetry
const ACTIVE_WIDTH = 102;

const SLIDE_SPRING = { damping: 22, stiffness: 220, mass: 0.5 };

interface TabItemProps {
  config: TabConfig;
  index: number;
  progress: SharedValue<number>;
  showBadge: boolean;
  badgeLabel: string;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({
  config,
  index,
  progress,
  showBadge,
  badgeLabel,
  onPress,
  onLongPress,
}: TabItemProps) {
  const animatedTabStyle = useAnimatedStyle(() => {
    const dist = Math.abs(progress.value - index);
    const width = interpolate(dist, [0, 1], [ACTIVE_WIDTH, INACTIVE_WIDTH], Extrapolation.CLAMP);
    return { width };
  });

  const inactiveStyle = useAnimatedStyle(() => {
    const dist = Math.abs(progress.value - index);
    const opacity = interpolate(dist, [0, 0.35], [0, 1], Extrapolation.CLAMP);
    const scale = interpolate(dist, [0, 0.35], [0.82, 1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const activeStyle = useAnimatedStyle(() => {
    const dist = Math.abs(progress.value - index);
    const opacity = interpolate(dist, [0, 0.35], [1, 0], Extrapolation.CLAMP);
    const scale = interpolate(dist, [0, 0.35], [1, 0.82], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.tabButton, animatedTabStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={config.label}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.pressableFill}
        hitSlop={{ top: 8, bottom: 8 }}
      >
        {/* Inactive State: Centered Outline Icon in 44x44 target */}
        <Animated.View style={[styles.inactiveContainer, inactiveStyle]} pointerEvents="none">
          <View style={styles.iconContainer}>
            <Ionicons
              name={config.inactiveIcon}
              size={20}
              color={semanticColors.navigationForeground}
            />
            {showBadge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeLabel}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Active State: Centered Icon + Label with balanced padding */}
        <Animated.View style={[styles.activeRow, activeStyle]} pointerEvents="none">
          <View style={styles.iconContainer}>
            <Ionicons name={config.activeIcon} size={18} color="#FFFFFF" />
            {showBadge && (
              <View style={styles.badgeActive}>
                <Text style={styles.badgeTextActive}>{badgeLabel}</Text>
              </View>
            )}
          </View>
          <Text numberOfLines={1} style={styles.activeLabel}>
            {config.label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function FloatingTabBar({
  state,
  navigation,
  navigateToTab,
  insets,
}: FloatingTabBarProps) {
  const { destinations } = useTripStore();
  const tripCount = destinations.length;
  const reduceMotion = useReducedMotion();

  const routes = state?.routes?.filter(r => r.name in TAB_CONFIGS) ?? [];
  const activeIndex = state?.index ?? 0;

  const bottomMargin = Math.max(insets?.bottom || 0, 16) + 4;
  const activeProgress = useSharedValue(activeIndex);

  useEffect(() => {
    if (activeProgress.value === activeIndex) return;
    activeProgress.value = reduceMotion ? activeIndex : withSpring(activeIndex, SLIDE_SPRING);
  }, [activeIndex, activeProgress, reduceMotion]);

  // Exact symmetrical geometry:
  // 1 active tab (102px) + 2 inactive tabs (44px * 2) + 2 gaps (4px * 2) + dock padding (4px * 2) = 206px
  const dockWidth =
    routes.length * INACTIVE_WIDTH +
    (ACTIVE_WIDTH - INACTIVE_WIDTH) +
    (routes.length - 1) * TAB_GAP +
    DOCK_PADDING * 2;

  // Indicator positions:
  // Tab 0 (Explore):  4px
  // Tab 1 (Trip):     4 + 44 + 4 = 52px
  // Tab 2 (Settings): 4 + 44 + 4 + 44 + 4 = 100px
  const indX0 = DOCK_PADDING;
  const indX1 = DOCK_PADDING + INACTIVE_WIDTH + TAB_GAP;
  const indX2 = DOCK_PADDING + (INACTIVE_WIDTH + TAB_GAP) * 2;

  const indicatorStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      activeProgress.value,
      [0, 1, 2],
      [indX0, indX1, indX2],
      Extrapolation.CLAMP
    );
    return {
      width: ACTIVE_WIDTH,
      transform: [{ translateX }],
    };
  });

  if (routes.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.container, { bottom: bottomMargin }]}>
      <View style={[styles.dockShadowContainer, { width: dockWidth, height: DOCK_HEIGHT }]}>
        <View style={[styles.dockWrapper, { width: dockWidth, height: DOCK_HEIGHT }]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={85} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(250, 249, 246, 0.98)' }]}
            />
          )}

          {/* Active Gliding Pill Indicator */}
          <Animated.View pointerEvents="none" style={[styles.activeIndicator, indicatorStyle]} />

          {/* Tab Touch Targets: perfectly balanced with 4px padding on all 4 sides */}
          <View style={styles.tabsRow}>
            {routes.map((route, index) => {
              const config = TAB_CONFIGS[route.name];
              if (!config) return null;
              const isFocused = activeIndex === index;

              const onPress = () => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}

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
                navigation?.emit?.({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              return (
                <TabItem
                  key={route.key}
                  config={config}
                  index={index}
                  progress={activeProgress}
                  showBadge={route.name === 'trip' && tripCount > 0}
                  badgeLabel={tripCount > 9 ? '9+' : String(tripCount)}
                  onPress={onPress}
                  onLongPress={onLongPress}
                />
              );
            })}
          </View>
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
  dockShadowContainer: {
    borderRadius: DOCK_RADIUS,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
  },
  dockWrapper: {
    overflow: 'hidden',
    borderRadius: DOCK_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 233, 0.95)',
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.90)',
      default: 'rgba(250, 249, 246, 0.98)',
    }),
    position: 'relative',
  },
  tabsRow: {
    position: 'absolute',
    top: DOCK_PADDING,
    left: DOCK_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    height: ICON_BOX,
    gap: TAB_GAP,
  },
  activeIndicator: {
    position: 'absolute',
    top: DOCK_PADDING,
    left: 0,
    height: ICON_BOX,
    borderRadius: ICON_BOX / 2,
    backgroundColor: semanticColors.primary,
    shadowColor: semanticColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    height: ICON_BOX,
    position: 'relative',
    overflow: 'hidden',
  },
  pressableFill: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inactiveContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 6,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontFamily: 'Geist',
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    includeFontPadding: false,
    flexShrink: 0,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -7,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: semanticColors.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontFamily: 'Geist',
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 11,
  },
  badgeActive: {
    position: 'absolute',
    top: -4,
    right: -7,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: semanticColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeTextActive: {
    fontFamily: 'Geist',
    fontSize: 9,
    fontWeight: '700',
    color: semanticColors.primary,
    lineHeight: 11,
  },
});
