'use client';

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Button } from './Button';
import { semanticColors } from '@/theme/colors';

interface EmptyTripStateProps {
  onExplore: () => void;
  className?: string;
}

function TripEmptyIllustration() {
  return (
    <View className="mb-6 items-center justify-center">
      <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
        <Defs>
          {/* Soft ambient background glow */}
          <LinearGradient id="tripAmbientGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={semanticColors.accent} stopOpacity="0.14" />
            <Stop offset="60%" stopColor={semanticColors.primary} stopOpacity="0.06" />
            <Stop offset="100%" stopColor={semanticColors.secondary} stopOpacity="0.0" />
          </LinearGradient>

          {/* Primary needle gradient */}
          <LinearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={semanticColors.accent} />
            <Stop offset="100%" stopColor={semanticColors.primary} />
          </LinearGradient>

          {/* Map card gradient */}
          <LinearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#FAF9F6" />
          </LinearGradient>
        </Defs>

        {/* Ambient atmospheric backdrop */}
        <Circle cx="90" cy="78" r="66" fill="url(#tripAmbientGlow)" />
        <Circle
          cx="90"
          cy="78"
          r="72"
          stroke={semanticColors.border}
          strokeWidth="1"
          strokeDasharray="4 5"
          opacity={0.6}
        />

        {/* Layer 1: Tilted Itinerary Map Card */}
        <G transform="rotate(-5 90 78)">
          {/* Card Body */}
          <Rect
            x="42"
            y="32"
            width="96"
            height="90"
            rx="14"
            fill="url(#cardBg)"
            stroke={semanticColors.border}
            strokeWidth="1.5"
          />

          {/* Card Header Strip */}
          <Rect
            x="42"
            y="32"
            width="96"
            height="22"
            rx="14"
            fill={semanticColors.secondary}
          />
          <Rect x="42" y="44" width="96" height="10" fill={semanticColors.secondary} />

          {/* Dot status and title placeholder */}
          <Circle cx="54" cy="43" r="2.5" fill={semanticColors.accent} />
          <Rect
            x="62"
            y="41"
            width="34"
            height="4"
            rx="2"
            fill={semanticColors.mutedForeground}
            opacity={0.3}
          />

          {/* Content preview lines */}
          <Rect x="54" y="62" width="38" height="4" rx="2" fill={semanticColors.border} />
          <Rect
            x="54"
            y="70"
            width="26"
            height="4"
            rx="2"
            fill={semanticColors.border}
            opacity={0.7}
          />

          {/* Flight / Discovery Path */}
          <Path
            d="M 54 94 C 68 84, 80 104, 98 90 C 110 80, 118 84, 126 76"
            stroke={semanticColors.primary}
            strokeWidth="2"
            strokeDasharray="3 3"
            fill="none"
          />
          <Circle cx="54" cy="94" r="3" fill={semanticColors.primary} />
          <Circle cx="126" cy="76" r="3" fill={semanticColors.accent} />
        </G>

        {/* Layer 2: Floating Ticket / Luggage Stamp on Top-Right */}
        <G transform="rotate(7 130 46)">
          <Rect
            x="114"
            y="26"
            width="34"
            height="42"
            rx="8"
            fill="#FFFFFF"
            stroke={semanticColors.border}
            strokeWidth="1.5"
          />
          {/* Top bookmark ribbon */}
          <Path d="M 124 26 L 131 38 L 138 26 Z" fill={semanticColors.primary} />
          {/* Stamp Circle with Star */}
          <Circle
            cx="131"
            cy="52"
            r="7"
            stroke={semanticColors.border}
            strokeWidth="1"
            fill={semanticColors.secondary}
          />
          <Path
            d="M 131 48 L 132.3 50.8 L 135.2 51.2 L 133 53.1 L 133.7 56 L 131 54.5 L 128.3 56 L 129 53.1 L 126.8 51.2 L 129.7 50.8 Z"
            fill={semanticColors.primary}
          />
        </G>

        {/* Layer 3: Central Precision Compass Emblem */}
        <G transform="translate(90, 84)">
          {/* Outer Ring */}
          <Circle
            cx="0"
            cy="0"
            r="28"
            fill="#FFFFFF"
            stroke={semanticColors.border}
            strokeWidth="1.5"
          />
          {/* Inner Disc */}
          <Circle cx="0" cy="0" r="23" fill={semanticColors.secondary} />

          {/* Compass Rose Needles */}
          {/* North (Vibrant Brand Primary) */}
          <Path d="M 0 -17 L 4.5 0 L 0 3 L -4.5 0 Z" fill="url(#needleGradient)" />
          {/* South */}
          <Path
            d="M 0 17 L 4.5 0 L 0 -3 L -4.5 0 Z"
            fill={semanticColors.mutedForeground}
            opacity={0.35}
          />
          {/* East */}
          <Path
            d="M 17 0 L 0 4.5 L -3 0 L 0 -4.5 Z"
            fill={semanticColors.mutedForeground}
            opacity={0.25}
          />
          {/* West */}
          <Path
            d="M -17 0 L 0 4.5 L 3 0 L 0 -4.5 Z"
            fill={semanticColors.mutedForeground}
            opacity={0.25}
          />

          {/* Center Hub */}
          <Circle
            cx="0"
            cy="0"
            r="5"
            fill="#FFFFFF"
            stroke={semanticColors.primary}
            strokeWidth="2"
          />
          <Circle cx="0" cy="0" r="1.8" fill={semanticColors.primary} />
        </G>

        {/* Decorative Sparkles / Discovery Accents */}
        <Path
          d="M 32 46 Q 32 52 26 52 Q 32 52 32 58 Q 32 52 38 52 Q 32 52 32 46 Z"
          fill={semanticColors.accent}
          opacity={0.8}
        />
        <Path
          d="M 154 104 Q 154 109 149 109 Q 154 109 154 114 Q 154 109 159 109 Q 154 109 154 104 Z"
          fill={semanticColors.primary}
          opacity={0.7}
        />
      </Svg>
    </View>
  );
}

export function EmptyTripState({ onExplore, className = '' }: EmptyTripStateProps) {
  return (
    <View className={`flex-1 items-center justify-center px-6 py-12 ${className}`}>
      {/* Editorial travel illustration */}
      <TripEmptyIllustration />

      <Text className="mb-2 text-center font-sans text-[20px] font-medium leading-8 tracking-tight text-foreground">
        Every great trip starts somewhere.
      </Text>

      <Text className="mb-8 max-w-[280px] text-center font-sans text-[15px] leading-6 text-muted-foreground">
        Explore curated destinations and save the places you'd love to visit to assemble your
        itinerary.
      </Text>

      <View className="w-full max-w-[200px]">
        <Button variant="primary" fullWidth onPress={onExplore}>
          Explore destinations
        </Button>
      </View>
    </View>
  );
}
