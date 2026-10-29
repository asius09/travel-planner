'use client'

import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { Button, ProgressIndicator, OnboardingOption } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import { BUDGET_OPTIONS } from '@/constants/onboarding'

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

export default function BudgetOnboardingScreen() {
  const router = useRouter()
  const { data, setBudget } = useOnboardingStore()
  
  const handleSelectBudget = (budget: string) => {
    setBudget(budget as any)
  }
  
  const handleContinue = () => {
    if (data.budget) {
      router.push('/onboarding/travel-party')
    }
  }
  
  const handleSkip = () => {
    router.push('/onboarding/travel-party')
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
        <ProgressIndicator currentStep={3} totalSteps={5} style={styles.progress} />
        
        <View style={styles.contentPadding}>
          <TitleText>What feels right for your budget?</TitleText>
          <SubtitleText>We&apos;ll show you destinations that match your comfort level.</SubtitleText>
          
          <OptionsContainer>
            {BUDGET_OPTIONS.map((option) => (
              <OnboardingOption
                key={option.value}
                label={option.label}
                description={option.description}
                selected={data.budget === option.value}
                onPress={() => handleSelectBudget(option.value)}
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
          disabled={!data.budget}
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