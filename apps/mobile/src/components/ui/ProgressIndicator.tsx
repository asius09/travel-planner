'use client'

import { View, StyleSheet } from 'react-native'
import styled from 'styled-components/native'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

const ProgressContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`

const StepDot = styled(View)<{ $active: boolean; $completed: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ $active, $completed, theme }) => 
    $completed ? theme.colors.primary : $active ? theme.colors.primary : theme.colors.border
  };
`

const StepLine = styled(View)<{ $completed: boolean }>`
  flex: 1;
  height: 2px;
  background-color: ${({ $completed, theme }) => $completed ? theme.colors.primary : theme.colors.border};
`

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <ProgressContainer>
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