'use client';

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@travel-planner/shared';
import type { Destination } from '@travel-planner/shared';
import * as Haptics from 'expo-haptics';
import { semanticColors } from '@/theme/colors';

export interface ItineraryRowProps {
  position: number;
  destination: Partial<Destination>;
  onPress: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isDragging?: boolean;
  isAnyDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
}

const DRAG_THRESHOLD = 32;

export function ItineraryRow({
  position,
  destination,
  onPress,
  onRemove,
  onMoveUp,
  canMoveUp,
  canMoveDown,
  onMoveDown,
  isDragging = false,
  isAnyDragging = false,
  onDragStart,
  onDragEnd,
  className = '',
}: ItineraryRowProps) {
  const name = destination.name ?? 'Destination';
  const location = destination.region
    ? `${destination.region}, ${destination.country}`
    : destination.country ?? '';
  const costMinor = destination.estimatedCostMinor ?? 0;
  const heroImage =
    destination.heroImage ??
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop';

  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [internalDragging, setInternalDragging] = useState(false);
  const activeDrag = isDragging || internalDragging;

  const canMoveUpRef = useRef(canMoveUp);
  const canMoveDownRef = useRef(canMoveDown);
  canMoveUpRef.current = canMoveUp;
  canMoveDownRef.current = canMoveDown;

  const onMoveUpRef = useRef(onMoveUp);
  const onMoveDownRef = useRef(onMoveDown);
  onMoveUpRef.current = onMoveUp;
  onMoveDownRef.current = onMoveDown;

  const isHeldRef = useRef(false);

  const startDrag = () => {
    if (isHeldRef.current) return;
    isHeldRef.current = true;
    setInternalDragging(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onDragStart?.();
    Animated.spring(scale, {
      toValue: 1.05,
      useNativeDriver: true,
      tension: 280,
      friction: 20,
    }).start();
  };

  const endDrag = (gestureDy: number) => {
    const wasHeld = isHeldRef.current;
    isHeldRef.current = false;
    setInternalDragging(false);

    if (wasHeld) {
      if (gestureDy < -DRAG_THRESHOLD && canMoveUpRef.current) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        onMoveUpRef.current();
      } else if (gestureDy > DRAG_THRESHOLD && canMoveDownRef.current) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        onMoveDownRef.current();
      }
    }

    onDragEnd?.();

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 320,
        friction: 24,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 320,
        friction: 24,
      }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => isHeldRef.current,
      onMoveShouldSetPanResponderCapture: () => isHeldRef.current,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: () => {
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isHeldRef.current) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        endDrag(gestureState.dy);
      },
      onPanResponderTerminate: () => {
        endDrag(0);
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY }, { scale }],
          zIndex: activeDrag ? 9999 : 1,
          elevation: activeDrag ? 24 : 1,
          opacity: isAnyDragging && !activeDrag ? 0.45 : 1,
        },
      ]}
      className={`bg-card rounded-[20px] border border-border p-3.5 flex-row items-center gap-3.5 ${
        activeDrag ? 'shadow-2xl border-primary bg-surface' : ''
      } ${className}`}
      {...panResponder.panHandlers}
      pointerEvents={isAnyDragging && !activeDrag ? 'none' : 'auto'}
    >
      {/* Position Badge & Reorder Handle */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Reorder ${name}`}
        onLongPress={startDrag}
        delayLongPress={200}
        onPressOut={() => {
          if (!isHeldRef.current) {
            setInternalDragging(false);
          }
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="flex-col items-center justify-center p-1 active:opacity-75"
      >
        <View className="w-7 h-7 rounded-full bg-secondary items-center justify-center">
          <Text className="font-sans font-medium text-xs text-primary">
            {position + 1}
          </Text>
        </View>
        <Ionicons
          name="reorder-two"
          size={14}
          color={activeDrag ? semanticColors.primary : semanticColors.mutedForeground}
          style={{ marginTop: 2 }}
        />
      </Pressable>

      {/* Main card body: Long press to drag, tap to view destination */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${location}`}
        onPress={() => {
          if (!activeDrag && !isAnyDragging) {
            onPress();
          }
        }}
        onLongPress={startDrag}
        delayLongPress={200}
        onPressOut={() => {
          if (!isHeldRef.current) {
            setInternalDragging(false);
          }
        }}
        className="flex-1 flex-row items-center gap-3 min-w-0 active:opacity-85"
      >
        {/* Thumbnail */}
        <View className="w-14 h-14 rounded-[14px] overflow-hidden relative bg-surface-muted shrink-0" pointerEvents="none">
          <ExpoImage
            source={{ uri: heroImage }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
        </View>

        {/* Text Info */}
        <View className="flex-1 justify-center min-w-0" pointerEvents="none">
          <Text className="font-sans font-medium text-[16px] text-card-foreground" numberOfLines={1}>
            {name}
          </Text>
          {location ? (
            <Text className="font-sans text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
              {location}
            </Text>
          ) : null}
          <Text className="font-sans font-medium text-sm text-primary mt-1">
            {formatCurrency(costMinor, 'USD')}
          </Text>
        </View>
      </Pressable>

      {/* Action Controls: Chevrons & Delete */}
      <View className="flex-row items-center gap-1 shrink-0" pointerEvents={activeDrag ? 'none' : 'auto'}>
        <View className="flex-col items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Move ${name} up`}
            onPress={onMoveUp}
            disabled={!canMoveUp || activeDrag}
            hitSlop={{ top: 12, bottom: 4, left: 12, right: 12 }}
            className={`p-1.5 ${!canMoveUp || activeDrag ? 'opacity-20' : 'active:opacity-50'}`}
          >
            <Ionicons name="chevron-up" size={18} color={canMoveUp ? semanticColors.foreground : semanticColors.mutedForeground} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Move ${name} down`}
            onPress={onMoveDown}
            disabled={!canMoveDown || activeDrag}
            hitSlop={{ top: 4, bottom: 12, left: 12, right: 12 }}
            className={`p-1.5 ${!canMoveDown || activeDrag ? 'opacity-20' : 'active:opacity-50'}`}
          >
            <Ionicons name="chevron-down" size={18} color={canMoveDown ? semanticColors.foreground : semanticColors.mutedForeground} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name} from itinerary`}
          onPress={onRemove}
          disabled={activeDrag}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="p-2 ml-1 active:opacity-50"
        >
          <Ionicons name="trash-outline" size={20} color={semanticColors.destructive} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
