'use client'

import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Link } from 'expo-router'
import styled from 'styled-components/native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'

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

const PermissionCard = styled(View)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: 20px;
  margin: 0 24px 16px;
  gap: 12px;
`

const PermissionIconWrapper = styled(View)`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.soft};
`

const PermissionIcon = styled(Ionicons)`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
`

const PermissionTitle = styled(Text)`
  font-family: Geist_Medium;
  font-size: 17px;
  color: ${({ theme }) => theme.colors.text};
`

const PermissionDescription = styled(Text)`
  font-family: Geist_Regular;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 20px;
`

const PermissionActions = styled(View)`
  flex-direction: row;
  gap: 12px;
  margin-top: 8px;
`

const Footer = styled(View)`
  padding: 0 24px 32px;
  gap: 12px;
`

const SkipButton = styled(Pressable)`
  padding: 8px;
`

const SkipText = styled(Text)`
  font-family: Geist_Regular;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.muted};
  text-align: center;
`

export default function PermissionsOnboardingScreen() {
  const router = useRouter()
  const { completeOnboarding } = useOnboardingStore()
  
  const handleEnableLocation = () => {
    // In a real app, this would request the location permission
    // For now, just navigate to explore
    router.push('/(tabs)')
  }
  
  const handleEnableNotifications = () => {
    // In a real app, this would request the notification permission
    // For now, just navigate to explore
    router.push('/(tabs)')
  }
  
  const handleSkip = () => {
    completeOnboarding()
    router.push('/(tabs)')
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
        <View style={styles.contentPadding}>
          <TitleText>Make planning a little easier</TitleText>
          <SubtitleText>These are optional. You can enable them later in Settings.</SubtitleText>
          
          <PermissionCard>
            <View style={styles.permissionHeader}>
              <PermissionIconWrapper>
                <PermissionIcon name="location-outline" />
              </PermissionIconWrapper>
              <View>
                <PermissionTitle>Use your location</PermissionTitle>
                <PermissionDescription>Help sort nearby ideas and find local recommendations.</PermissionDescription>
              </View>
            </View>
            <PermissionActions>
              <Button variant="primary" size="sm" onPress={handleEnableLocation} style={styles.actionButton}>
                Enable location
              </Button>
              <Button variant="ghost" size="sm" onPress={() => {}} style={styles.actionButton}>
                Not now
              </Button>
            </PermissionActions>
          </PermissionCard>
          
          <PermissionCard>
            <View style={styles.permissionHeader}>
              <PermissionIconWrapper>
                <PermissionIcon name="notifications-outline" />
              </PermissionIconWrapper>
              <View>
                <PermissionTitle>Get useful reminders</PermissionTitle>
                <PermissionDescription>Receive trip reminders when you choose to plan.</PermissionDescription>
              </View>
            </View>
            <PermissionActions>
              <Button variant="primary" size="sm" onPress={handleEnableNotifications} style={styles.actionButton}>
                Enable notifications
              </Button>
              <Button variant="ghost" size="sm" onPress={() => {}} style={styles.actionButton}>
                Maybe later
              </Button>
            </PermissionActions>
          </PermissionCard>
        </View>
      </ScrollView>
      
      <Footer>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onPress={() => {
            completeOnboarding()
            router.push('/(tabs)')
          }}
        >
          Explore destinations
        </Button>
        <SkipButton onPress={handleSkip} accessibilityLabel="Skip permissions">
          <SkipText>Not now</SkipText>
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
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
})