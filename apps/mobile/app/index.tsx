'use client'

import { View, Text, StyleSheet, ImageBackground } from 'react-native'
import { Link, useRouter } from 'expo-router'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'

const Container = styled(View)`
  flex: 1;
`

const HeroSection = styled(ImageBackground)`
  flex: 1;
  justify-content: flex-end;
  padding: 24px;
  padding-bottom: 48px;
`

const Overlay = styled(View)`
  flex: 1;
  background-color: rgba(32, 40, 34, 0.6);
`

const Content = styled(View)`
  max-width: 320px;
  gap: 16px;
`

const Headline = styled(Text)`
  font-family: Geist_Medium;
  font-size: 32px;
  line-height: 38px;
  letter-spacing: -0.5px;
  color: #FFFFFF;
`

const Subtext = styled(Text)`
  font-family: Geist_Regular;
  font-size: 17px;
  line-height: 26px;
  color: rgba(255, 255, 255, 0.9);
`

const ButtonGroup = styled(View)`
  gap: 12px;
  margin-top: 8px;
`

const SecondaryButton = styled(Link)`
  align-self: center;
  margin-top: 8px;
`

const SecondaryButtonText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration-line: underline;
`

export default function WelcomeScreen() {
  const router = useRouter()
  const { resetOnboarding } = useOnboardingStore()
  
  // Reset onboarding when returning to welcome
  resetOnboarding()
  
  const handlePlanTrip = () => {
    router.push('/onboarding/mood')
  }
  
  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  return (
    <Container>
      <HeroSection
        source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=1600&fit=crop' }}
        style={styles.heroImage}
        resizeMode="cover"
      >
        <Overlay>
          <Content>
            <Headline>Your next trip starts here.</Headline>
            <Subtext>Find places that fit your mood, time and budget.</Subtext>
            <ButtonGroup>
              <Button variant="primary" size="lg" fullWidth onPress={handlePlanTrip}>
                Plan a trip
              </Button>
              <SecondaryButton onPress={handleSignIn} accessibilityRole="button">
                <SecondaryButtonText>I already have an account</SecondaryButtonText>
              </SecondaryButton>
            </ButtonGroup>
          </Content>
        </Overlay>
      </HeroSection>
    </Container>
  )
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: '100%',
  },
})