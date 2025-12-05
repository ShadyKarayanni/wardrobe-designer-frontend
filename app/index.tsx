import { useRef, useState } from 'react';
import PagerView from 'react-native-pager-view';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, YStack, Text } from 'tamagui';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import config from '../tamagui.config';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Page indices: Settings (0) - Schedule (1) - Wardrobe (2)
const SETTINGS_PAGE = 0;
const SCHEDULE_PAGE = 1;
const WARDROBE_PAGE = 2;

function SettingsContent() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
      <Text fontSize="$6" color="$textSecondary">
        App settings
      </Text>
    </YStack>
  );
}

function ScheduleContent() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
      <Text fontSize="$6" color="$textSecondary">
        Schedule your outfits
      </Text>
    </YStack>
  );
}

function WardrobeContent() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
      <Text fontSize="$6" color="$textSecondary">
        Manage your items
      </Text>
    </YStack>
  );
}

export default function App() {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(SCHEDULE_PAGE);

  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    InterMedium: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterSemiBold: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const handlePageChange = (page: number) => {
    pagerRef.current?.setPage(page);
  };

  const getTitle = () => {
    switch (currentPage) {
      case SETTINGS_PAGE:
        return 'Settings';
      case SCHEDULE_PAGE:
        return 'Schedule';
      case WARDROBE_PAGE:
        return 'Wardrobe';
      default:
        return 'Schedule';
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme="light">
          <PageContainer>
            <Header title={getTitle()} />
            <PagerView
              ref={pagerRef}
              style={styles.pager}
              initialPage={SCHEDULE_PAGE}
              onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
              <YStack key="settings" style={styles.page}>
                <SettingsContent />
              </YStack>
              <YStack key="schedule" style={styles.page}>
                <ScheduleContent />
              </YStack>
              <YStack key="wardrobe" style={styles.page}>
                <WardrobeContent />
              </YStack>
            </PagerView>
            <Footer currentPage={currentPage} onPageChange={handlePageChange} />
          </PageContainer>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
