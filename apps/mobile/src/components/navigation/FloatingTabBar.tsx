'use client'

import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTripStore } from '@/store/tripStore'

/** React Navigation's event emitter, as exposed on a navigation object. */
type TabNavEmitter = (event: {
  type: string
  target: string
  canPreventDefault?: boolean
}) => { defaultPrevented?: boolean } | void

/**
 * Props this custom tab bar reads. They mirror what Expo Router passes to a
 * `tabBar` renderer: React Navigation's navigator state plus Expo Router's
 * `emitter` / `navigateToTab` helpers. Every member is optional so the
 * navigator's richer props stay assignable, and none are typed as `any`.
 */
export interface FloatingTabBarProps {
  state?: { index: number; routes: Array<{ key: string; name: string }> }
  descriptors?: Record<string, unknown>
  navigation?: { navigate: (name: string) => void; emit?: TabNavEmitter }
  navigateToTab?: (routeKey: string) => void
  insets?: { top: number; right: number; bottom: number; left: number }
}

interface TabConfig {
  name: string
  label: string
  activeIcon: keyof typeof Ionicons.glyphMap
  inactiveIcon: keyof typeof Ionicons.glyphMap
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
}

export function FloatingTabBar({
  state,
  navigation,
  navigateToTab,
  insets,
}: FloatingTabBarProps) {
  const { width } = useWindowDimensions()
  const { destinations } = useTripStore()
  const tripCount = destinations.length

  // Filter routes to primary tabs
  const routes = state?.routes?.filter((route) => route.name in TAB_CONFIGS) ?? []

  // Compact dock width matching reference design
  const dockWidth = Math.min(width - 96, 260)
  const bottomMargin = Math.max(insets?.bottom || 0, 14) + 6

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
          },
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={85}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(18, 24, 20, 0.94)' },
            ]}
          />
        )}

        {/* Hairline top gloss border */}
        <View style={styles.topGloss} />

        {/* Tab Items Row */}
        <View style={styles.tabsRow}>
          {routes.map((route, index) => {
            const isFocused = (state?.index ?? -1) === index
            const config = TAB_CONFIGS[route.name]
            if (!config) return null

            const onPress = () => {
              try {
                Haptics.selectionAsync()
              } catch {
                // Ignore
              }

              const emit = navigation?.emit
              const event = emit
                ? emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  })
                : { defaultPrevented: false }

              if (!isFocused && !event?.defaultPrevented) {
                if (navigateToTab) {
                  navigateToTab(route.key)
                } else if (navigation?.navigate) {
                  navigation.navigate(route.name)
                }
              }
            }

            const onLongPress = () => {
              const emit = navigation?.emit
              emit?.({
                type: 'tabLongPress',
                target: route.key,
              })
            }

            const showBadge = route.name === 'trip' && tripCount > 0

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={config.label}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {/* Active Vivid Lime Circular Indicator or Inactive Icon */}
                {isFocused ? (
                  <View style={styles.activeCircle}>
                    <Ionicons
                      name={config.activeIcon}
                      size={21}
                      color="#121614"
                    />
                  </View>
                ) : (
                  <View style={styles.inactivePill}>
                    <Ionicons
                      name={config.inactiveIcon}
                      size={21}
                      color="rgba(255, 255, 255, 0.72)"
                    />
                    {showBadge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {tripCount > 9 ? '9+' : tripCount}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
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
    height: 56,
    borderRadius: 28,
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
    paddingHorizontal: 6,
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
    justifyContent: 'space-around',
    width: '100%',
  },
  tabButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The selected tab lifts slightly toward the lime indicator.
  activeTabButton: {
    transform: [{ translateY: -2 }],
  },
  activeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4F638',
    shadowColor: '#D4F638',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  inactivePill: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D4F638',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: 'Geist_SemiBold',
    fontSize: 10,
    color: '#121614',
  },
})
