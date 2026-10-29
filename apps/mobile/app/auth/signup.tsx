'use client'

import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Link } from 'expo-router'
import { useRef } from 'react'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.canvas};
`

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
`

const BackButton = styled(Pressable)`
  padding: 8px;
`

const TitleText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 26px;
  color: ${({ theme }) => theme.colors.text};
  margin: 24px 24px 8px;
`

const SubtitleText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.muted};
  margin: 0 24px 32px;
`

const FormContainer = styled(View)`
  padding: 0 24px;
  gap: 16px;
`

const Footer = styled(View)`
  padding: 0 24px 32px;
  gap: 16px;
`

const Divider = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-vertical: 8px;
`

const DividerLine = styled(View)`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`

const DividerText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`

export default function SignUpScreen() {
  const router = useRouter()
  const { signUp, loading, error, clearError } = useAuthStore()
  const emailRef = useRef<any>(null)
  const passwordRef = useRef<any>(null)
  
  const handleSignUp = async () => {
    const email = emailRef.current?._lastNativeText ?? ''
    const password = passwordRef.current?._lastNativeText ?? ''
    if (!email || !password) return
    
    const success = await signUp(email, password)
    if (success) {
      router.replace('/(tabs)')
    }
  }
  
  const handleBack = () => {
    router.back()
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={handleBack} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={28} color="#202822" />
        </BackButton>
      </Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TitleText>Create your account</TitleText>
        <SubtitleText>Save your trips and access them anywhere.</SubtitleText>
        
        <FormContainer>
          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            ref={emailRef}
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={error?.includes('email') ? error : undefined}
            onChangeText={clearError}
          />
          <Input
            label="Password"
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
            ref={passwordRef}
            onSubmitEditing={handleSignUp}
            error={error?.includes('password') ? error : undefined}
            onChangeText={clearError}
            helperText="Must be at least 8 characters"
          />
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
          >
            Create account
          </Button>
        </FormContainer>
      </ScrollView>
      
      <Footer>
        <Divider>
          <DividerLine />
          <DividerText>Already have an account?</DividerText>
          <DividerLine />
        </Divider>
        <Button variant="outline" size="lg" fullWidth onPress={() => router.push('/auth/signin')}>
          Sign in
        </Button>
      </Footer>
    </Container>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  errorText: {
    fontFamily: 'Geist_Regular',
    fontSize: 13,
    color: '#E57373',
    marginTop: -8,
  },
})