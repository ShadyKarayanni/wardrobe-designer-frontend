import { useRef, useState, useCallback } from 'react';
import PagerView from 'react-native-pager-view';
import { StyleSheet } from 'react-native';
import { YStack, Text, XStack, Button } from 'tamagui';
import { LogOut } from '@tamagui/lucide-icons';

import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FAB } from '@/components/common/FAB';
import { AddItemSheet } from '@/components/wardrobe/AddItemSheet';
import { useAuth } from '@/lib/auth/AuthContext';
import { WardrobeContent } from '@/components/wardrobe/WardrobeContent';

// Page indices: Settings (0) - Schedule (1) - Wardrobe (2)
const SETTINGS_PAGE = 0;
const SCHEDULE_PAGE = 1;
const WARDROBE_PAGE = 2;

function SettingsContent() {
  const { signOut, user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$6">
      <Text fontSize="$6" color="$textSecondary">
        App settings
      </Text>
      {user?.email && (
        <Text fontSize="$3" color="$textMuted">
          Signed in as {user.email}
        </Text>
      )}
      <Button
        onPress={handleSignOut}
        disabled={signingOut}
        backgroundColor="$background"
        borderColor="$border"
        borderWidth={1}
        pressStyle={{ backgroundColor: '$backgroundPress' }}
      >
        <XStack alignItems="center" gap="$2">
          <LogOut size={18} color="#4A4A4A" />
          <Text color="$textSecondary" fontSize="$3">
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </XStack>
      </Button>
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


export default function MainApp() {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(SCHEDULE_PAGE);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const refreshWardrobeRef = useRef<(() => void) | undefined>(undefined);

  const handlePageChange = (page: number) => {
    pagerRef.current?.setPage(page);
  };

  const handleFABPress = () => {
    // FAB action depends on current page
    // For now, it opens the add item sheet (wardrobe action)
    setAddSheetOpen(true);
  };

  const handleAddSuccess = useCallback(() => {
    setAddSheetOpen(false);
    refreshWardrobeRef.current?.();
  }, []);

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
          <WardrobeContent
            onRefreshReady={(refresh) => {
              refreshWardrobeRef.current = refresh;
            }}
          />
        </YStack>
      </PagerView>
      <Footer currentPage={currentPage} onPageChange={handlePageChange} />
      <FAB onPress={handleFABPress} />
      <AddItemSheet
        isOpen={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </PageContainer>
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
