'use client'

import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Link } from 'expo-router'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { Button, Input } from '@/components/ui'
import { useThemeStore } from '@/store/themeStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import { MOOD_OPTIONS, DURATION_OPTIONS, BUDGET_OPTIONS, TRAVEL_PARTY_OPTIONS } from '@/constants/onboarding'
import { formatCurrency } from '@travel-planner/shared'

const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.canvas};
`

const Header = styled(View)`
  padding: 20px 20px 12px;
`

const TitleText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 28px;
  color: ${({ theme }) => theme.colors.text};
`

const Section = styled(View)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  margin: 0 20px 16px;
  overflow: hidden;
`

const SectionHeader = styled(View)`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`

const SectionTitle = styled(Text)`
  font-family: Geist_Medium;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
`

const SectionDescription = styled(Text)`
  font-family: Geist_Regular;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 4px;
`

const SectionContent = styled(View)`
  padding: 16px 20px 20px;
  gap: 16px;
`

const SettingRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 8px;
`

const SettingInfo = styled(View)`
  flex: 1;
`

const SettingLabel = styled(Text)`
  font-family: Geist_Regular;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`

const SettingSubtext = styled(Text)`
  font-family: Geist_Regular;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 2px;
`

const MoodSelector = styled(View)`
  gap: 10px;
`

const MoodOption = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
  border-width: 2px;
  border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ $selected, theme }) => $selected ? theme.colors.soft : theme.colors.surface};
  gap: 12px;
`

const MoodIconWrapper = styled(View)`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
`

const MoodIcon = styled(Ionicons)`
  font-size: 18px;
  color: ${({ $selected, theme }) => $selected ? '#FFFFFF' : theme.colors.primary};
`

const MoodTextContainer = styled(View)`
  flex: 1;
`

const MoodLabel = styled(Text)`
  font-family: ${({ $selected }) => $selected ? 'Geist_Medium' : 'Geist_Regular'};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`

const MoodDescription = styled(Text)`
  font-family: Geist_Regular;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`

const CurrencySelector = styled(View)`
  flex-direction: row;
  gap: 10px;
`

const CurrencyOption = styled(Pressable)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: 14px;
  border-radius: 12px;
  border-width: 2px;
  border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ $selected, theme }) => $selected ? theme.colors.soft : theme.colors.surface};
`

const CurrencyText = styled(Text)`
  font-family: ${({ $selected }) => $selected ? 'Geist_Medium' : 'Geist_Regular'};
  font-size: 15px;
  color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.text};
`

const DangerZone = styled(View)`
  background-color: #FFF0F0;
  border-color: #FFCCCC;
`

const DangerButton = styled(Button).attrs({ variant: 'ghost', fullWidth: true })``

const DangerText = styled(Text)`
  font-family: Geist_Medium;
  font-size: 16px;
  color: #E57373;
`

export default function SettingsScreen() {
  const router = useRouter()
  const { theme, setTheme, tokens } = useThemeStore()
  const { data: onboardingData, setMood, setDuration, setBudget, setTravelParty, resetOnboarding } = useOnboardingStore()
  const { user, signOut } = useAuthStore()
  const { clearTrip } = useTripStore()
  
  const handleMoodChange = (mood: import('@travel-planner/shared').TravelMood) => {
    setMood(mood)
    setTheme(mood)
  }
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign out?',
      'You\'ll need to sign in again to sync your trip.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign out', 
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/')
          }
        },
      ]
    )
  }
  
  const handleClearTrip = () => {
    Alert.alert(
      'Clear your trip?',
      'This will remove all destinations from your trip. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear trip', 
          style: 'destructive',
          onPress: () => {
            clearTrip()
            // Also clear from server if authenticated
          }
        },
      ]
    )
  }
  
  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset preferences?',
      'This will reset your travel preferences but keep your saved trip.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetOnboarding()
            router.replace('/onboarding/mood')
          }
        },
      ]
    )
  }

  return (
    <Container>
      <Header>
        <TitleText>Settings</TitleText>
      </Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Travel Mood */}
        <Section>
          <SectionHeader>
            <SectionTitle>Travel mood</SectionTitle>
            <SectionDescription>Changes recommendations and accent colors. Your trip stays the same.</SectionDescription>
          </SectionHeader>
          <SectionContent>
            <MoodSelector>
              {MOOD_OPTIONS.map((option) => (
                <MoodOption
                  key={option.value}
                  $selected={theme === option.value}
                  onPress={() => handleMoodChange(option.value)}
                >
                  <MoodIconWrapper $selected={theme === option.value}>
                    <MoodIcon name={option.icon} $selected={theme === option.value} />
                  </MoodIconWrapper>
                  <MoodTextContainer>
                    <MoodLabel $selected={theme === option.value}>{option.label}</MoodLabel>
                    <MoodDescription>{option.description}</MoodDescription>
                  </MoodTextContainer>
                </MoodOption>
              ))}
            </MoodSelector>
          </SectionContent>
        </Section>
        
        {/* Display Currency */}
        <Section>
          <SectionHeader>
            <SectionTitle>Display currency</SectionTitle>
            <SectionDescription>Changes how prices are formatted. Does not convert amounts.</SectionDescription>
          </SectionHeader>
          <SectionContent>
            <CurrencySelector>
              <CurrencyOption
                $selected={true}
                onPress={() => {}} // Would update currency preference
              >
                <CurrencyText $selected={true}>USD ($)</CurrencyText>
              </CurrencyOption>
              <CurrencyOption
                $selected={false}
                onPress={() => {}} // Would update currency preference
              >
                <CurrencyText $selected={false}>INR (₹)</CurrencyText>
              </CurrencyOption>
            </CurrencySelector>
          </SectionContent>
        </Section>
        
        {/* Planning Preferences */}
        <Section>
          <SectionHeader>
            <SectionTitle>Planning preferences</SectionTitle>
            <SectionDescription>Update your preferences to get better recommendations.</SectionDescription>
          </SectionHeader>
          <SectionContent>
            <SettingRow>
              <SettingInfo>
                <SettingLabel>Duration</SettingLabel>
                <SettingSubtext>{onboardingData.duration ? DURATION_OPTIONS.find(o => o.value === onboardingData.duration)?.label : 'Not set'}</SettingSubtext>
              </SettingInfo>
              <Ionicons name="chevron-forward" size={20} color="#777F78" />
            </SettingRow>
            
            <SettingRow>
              <SettingInfo>
                <SettingLabel>Budget</SettingLabel>
                <SettingSubtext>{onboardingData.budget ? BUDGET_OPTIONS.find(o => o.value === onboardingData.budget)?.label : 'Not set'}</SettingSubtext>
              </SettingInfo>
              <Ionicons name="chevron-forward" size={20} color="#777F78" />
            </SettingRow>
            
            <SettingRow>
              <SettingInfo>
                <SettingLabel>Travel party</SettingLabel>
                <SettingSubtext>{onboardingData.travelParty ? TRAVEL_PARTY_OPTIONS.find(o => o.value === onboardingData.travelParty)?.label : 'Not set'}</SettingSubtext>
              </SettingInfo>
              <Ionicons name="chevron-forward" size={20} color="#777F78" />
            </SettingRow>
            
            <Button variant="outline" size="sm" fullWidth onPress={() => router.push('/onboarding/mood')}>
              Update all preferences
            </Button>
          </SectionContent>
        </Section>
        
        {/* Permissions */}
        <Section>
          <SectionHeader>
            <SectionTitle>Permissions</SectionTitle>
            <SectionDescription>Manage optional permissions for enhanced features.</SectionDescription>
          </SectionHeader>
          <SectionContent>
            <SettingRow>
              <SettingInfo>
                <SettingLabel>Location</SettingLabel>
                <SettingSubtext>Used for nearby destination sorting</SettingSubtext>
              </SettingInfo>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#E5E7DF', true: tokens.primary }}
                thumbColor={tokens.primary}
              />
            </SettingRow>
            
            <SettingRow>
              <SettingInfo>
                <SettingLabel>Notifications</SettingLabel>
                <SettingSubtext>Trip reminders and updates</SettingSubtext>
              </SettingInfo>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#E5E7DF', true: tokens.primary }}
                thumbColor={tokens.primary}
              />
            </SettingRow>
          </SectionContent>
        </Section>
        
        {/* Account */}
        {user && (
          <Section>
            <SectionHeader>
              <SectionTitle>Account</SectionTitle>
            </SectionHeader>
            <SectionContent>
              <SettingRow>
                <SettingInfo>
                  <SettingLabel>Email</SettingLabel>
                  <SettingSubtext>{user.email}</SettingSubtext>
                </SettingInfo>
              </SettingRow>
              <DangerButton onPress={handleSignOut}>
                <DangerText>Sign out</DangerText>
              </DangerButton>
            </SectionContent>
          </Section>
        )}
        
        {/* Danger Zone */}
        <Section>
          <SectionHeader>
            <SectionTitle>Data</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <DangerButton onPress={handleClearTrip}>
              <DangerText>Clear my trip</DangerText>
            </DangerButton>
            <DangerButton onPress={handleResetOnboarding}>
              <DangerText>Reset preferences</DangerText>
            </DangerButton>
          </SectionContent>
        </Section>
        
        <View style={styles.versionText}>
          <Text style={styles.versionTextInner}>{'Travel Planner v0.1.0'}</Text>
        </View>
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  versionText: {
    padding: 20,
    alignItems: 'center',
  },
  versionTextInner: {
    fontFamily: 'Geist_Regular',
    fontSize: 13,
    color: '#777F78',
  },
})