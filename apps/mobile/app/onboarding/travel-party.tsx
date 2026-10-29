'use client'

import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { Button, ProgressIndicator, OnboardingOption } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import { TRAVEL_PARTY_OPTIONS } from '@/constants/onboarding'

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
  margin-top: 8px;
  margin-bottom: 4px;
`

const SubtitleText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 24px;
`

const OptionsContainer = styled(View)`
  flex: 1;
  padding: 0 24px 24px;
  gap: 12px;
`

const Footer = styled(View)`
  padding: 0 24px 32px;
  gap: 12px;
`

const SkipText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.muted};
  text-align: center;
`

const SkipButton = styled(Pressable)`
  padding: 8px;
`

export default function TravelPartyOnboardingScreen() {
  const router = useRouter()
  const { data, setTravelParty, completeOnboarding } = useOnboardingStore()
  
  const handleSelectParty = (party: import('@travel-planner/shared').TravelParty) => {
    setTravelParty(party)
  }
  
  const handleContinue = () => {
    if (data.travelParty) {
      completeOnboarding()
      router.push('/onboarding/permissions')
    }
  }
  
  const handleSkip = () => {
    completeOnboarding()
    router.push('/onboarding/permissions')
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
        <ProgressIndicator currentStep={4} totalSteps={5} style={styles.progress} />
        
        <View style={styles.contentPadding}>
          <TitleText>WhoWho's going with youapos;s going with you?</TitleText>
          <SubtitleText>This helps us suggest destinations suited to your group.</SubtitleText>
          
          <OptionsContainer>
            {TRAVEL_PARTY_OPTIONS.map((option) => (
              <OnboardingOption
                key={option.value}
                label={option.label}
                description={option.description}
                selected={data.travelParty === option.value}
                onPress={() => handleSelectParty(option.value)}
              />
            ))}
          </OptionsContainer>
        </View>
      </ScrollView>
      
      <Footer>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onPress={handleContinue}
          disabled={!data.travelParty}
        >
          Continue
        </Button>
        <SkipButton onPress={handleSkip} accessibilityLabel="Skip this question">
          <SkipText>Skip for now</SkipText>
        </SkipButton>
      </Footer>
    </Container>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  contentPadding: {
    paddingBottom: 24,
  },
  progress: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
})