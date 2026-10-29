'use client'

import { View, StyleSheet } from 'react-native'
import styled, { keyframes } from 'styled-components/native'
import { Animated } from 'react-native'

const shimmerAnimation = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
`

const SkeletonContainer = styled(View)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`

const SkeletonImage = styled(Animated.View)`
  height: 180px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.border};
`

const SkeletonContent = styled(View)`
  padding: 14px 16px;
  gap: 10px;
`

const SkeletonLine = styled(Animated.View)<{ $width?: string }>`
  height: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.border};
  width: ${({ $width }) => $width || '60%'};
`

const SkeletonLineShort = styled(SkeletonLine)`
  width: 40%;
`

const SkeletonMetaRow = styled(View)`
  flex-direction: row;
  gap: 16px;
  margin-top: 4px;
`

const SkeletonMetaItem = styled(Animated.View)`
  height: 14px;
  width: 80px;
  border-radius: 7px;
  background-color: ${({ theme }) => theme.colors.border};
`

export function SkeletonCard() {
  const animation = new Animated.Value(0)
  
  // Start animation on mount
  // Note: In a real app, you'd use useEffect to start/stop
  
  return (
    <SkeletonContainer>
      <SkeletonImage />
      <SkeletonContent>
        <View style={styles.nameRow}>
          <SkeletonLine $width="70%" />
          <SkeletonLineShort $width="30%" />
        </View>
        <SkeletonLine $width="85%" />
        <SkeletonLine $width="100%" />
        <SkeletonMetaRow>
          <SkeletonMetaItem />
          <SkeletonMetaItem />
        </SkeletonMetaRow>
      </SkeletonContent>
    </SkeletonContainer>
  )
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})