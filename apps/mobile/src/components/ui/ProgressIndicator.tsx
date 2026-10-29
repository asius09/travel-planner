'use client'

import { View, StyleSheet } from 'react-native'
import styled from 'styled-components/native'
import { Animated, Easing } from 'react-native'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  style?: any
}

const ProgressContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  ${({ style }) => style}
`

const StepDot = styled(View)<{ $active: boolean; $completed: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ $active, $completed, theme }) => 
    $completed ? theme.colors.primary : $active ? theme.colors.primary : theme.colors.border
  };
  transition: background-color 200ms ease;
`

const StepLine = styled(View)<{ $completed: boolean }>`
  flex: 1;
  height: 2px;
  background-color: ${({ $completed, theme }) => $completed ? theme.colors.primary : theme.colors.border};
  transition: background-color 200ms ease;
`

export function ProgressIndicator({ currentStep, totalSteps, style }: ProgressIndicatorProps) {
  return (
    <ProgressContainer style={style}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep
        
        return (
          <View key={i} style={styles.stepContainer}>
            <StepDot $active={isActive} $completed={isCompleted} />
            {i < totalSteps - 1 && <StepLine $completed={isCompleted} />}
          </View>
        )
      })}
    </ProgressContainer>
  )
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
})