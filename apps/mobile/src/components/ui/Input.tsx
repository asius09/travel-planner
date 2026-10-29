'use client'

import { TextInput, View, Text, StyleSheet } from 'react-native'
import { forwardRef } from 'react'
import styled from 'styled-components/native'

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const InputContainer = styled(View)`
  width: 100%;
  gap: 6px;
`

const Label = styled(Text)`
  font-family: Geist_Medium;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`

const InputWrapper = styled(View)`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  border-width: 1px;
  border-color: ${({ theme, $hasError }) => $hasError ? '#E57373' : theme.colors.border};
  padding-horizontal: 16px;
`

const StyledInput = styled(TextInput).attrs({
  placeholderTextColor: '#777F78',
})`
  flex: 1;
  font-family: Geist_Regular;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  padding-vertical: 14px;
`

const HelperText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 12px;
  color: ${({ theme, $hasError }) => $hasError ? '#E57373' : theme.colors.muted};
`

const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, style, ...props }, ref) => {
    const hasError = !!error
    
    return (
      <InputContainer style={style}>
        {label && <Label>{label}</Label>}
        <InputWrapper $hasError={hasError}>
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
          <StyledInput
            ref={ref}
            $hasError={hasError}
            {...props}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
              props.style,
            ]}
          />
          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </InputWrapper>
        {error && <HelperText $hasError={true}>{error}</HelperText>}
        {!error && helperText && <HelperText>{helperText}</HelperText>}
      </InputContainer>
    )
  }
)

Input.displayName = 'Input'

export { Input }

const styles = StyleSheet.create({
  iconContainer: {
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
})