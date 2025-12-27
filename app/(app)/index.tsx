import { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, Pressable, Dimensions, Modal } from 'react-native';
import { YStack, Text, XStack, Button, View, Input } from 'tamagui';
import { LogOut, X, MapPin, Check, Sparkles } from '@tamagui/lucide-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AddItemSheet } from '@/components/wardrobe/AddItemSheet';
import { BulkUploadScreen } from '@/components/wardrobe/BulkUploadScreen';
import { FABMenuSheet } from '@/components/common/FABMenuSheet';
import { AddEventSheet } from '@/components/events/AddEventSheet';
import { useAuth } from '@/lib/auth/AuthContext';
import { WardrobeContent } from '@/components/wardrobe/WardrobeContent';
import { ScheduleContent } from '@/components/schedule/ScheduleContent';
import { useWardrobeItems } from '@/lib/wardrobe/useWardrobeItems';
import { useEvents } from '@/lib/events/useEvents';
import { profileService } from '@/lib/profile/profileService';
import { userPreferences } from '@/lib/preferences/userPreferences';
import { UserProfile, CreateEventRequest } from '@/lib/wardrobe/types';

// Page indices: Schedule (0) - Wardrobe (1)
const SCHEDULE_PAGE = 0;
const WARDROBE_PAGE = 1;

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = Dimensions.get('window').width * 0.8;

function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { signOut, user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);

  // Style preferences (saved locally)
  const [stylePreferences, setStylePreferences] = useState('');
  const [savedStylePreferences, setSavedStylePreferences] = useState('');
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      translateX.value = withTiming(0, { duration: 250 });
      backdropOpacity.value = withTiming(0.5, { duration: 250 });
      loadProfile();
      loadPreferences();
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 }, () => {
        'worklet';
        runOnJS(setModalVisible)(false);
      });
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      setCity(profileData.default_city || '');
      setCountry(profileData.default_country || '');
    } catch {
      // Profile might not exist yet
    }
  };

  const loadPreferences = async () => {
    const prefs = await userPreferences.get();
    setStylePreferences(prefs.stylePreferences);
    setSavedStylePreferences(prefs.stylePreferences);
  };

  const handleSaveLocation = async () => {
    setSavingLocation(true);
    setLocationSaved(false);
    try {
      const updated = await profileService.updateProfile({
        default_city: city.trim() || undefined,
        default_country: country.trim() || undefined,
      });
      setProfile(updated);
      setLocationSaved(true);
      setTimeout(() => setLocationSaved(false), 2000);
    } catch {
      // Failed to save
    } finally {
      setSavingLocation(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    setPreferencesSaved(false);
    try {
      await userPreferences.set({ stylePreferences: stylePreferences.trim() });
      setSavedStylePreferences(stylePreferences.trim());
      setPreferencesSaved(true);
      setTimeout(() => setPreferencesSaved(false), 2000);
    } catch {
      // Failed to save
    } finally {
      setSavingPreferences(false);
    }
  };

  const hasPreferencesChanged = stylePreferences.trim() !== savedStylePreferences;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const hasLocationChanged =
    city.trim() !== (profile?.default_city || '') ||
    country.trim() !== (profile?.default_country || '');

  if (!modalVisible) return null;

  return (
    <Modal transparent visible={modalVisible} onRequestClose={onClose}>
      <View style={styles.drawerContainer}>
        <Pressable style={styles.backdropPressable} onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
        <Animated.View style={[styles.drawer, drawerStyle]}>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
            <Text fontSize={20} fontWeight="600" color="$text">
              Settings
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={24} color="#4A4A4A" />
            </Pressable>
          </XStack>

          <YStack flex={1} gap="$5">
            {/* Account Section */}
            <YStack gap="$2">
              <Text fontSize={12} fontWeight="600" color="$textMuted" textTransform="uppercase">
                Account
              </Text>
              {user?.email && (
                <Text fontSize={14} color="$textSecondary">
                  {user.email}
                </Text>
              )}
            </YStack>

            {/* Location Section */}
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <MapPin size={16} color="#666666" />
                <Text fontSize={12} fontWeight="600" color="$textMuted" textTransform="uppercase">
                  Default Location
                </Text>
              </XStack>
              <Input
                size="$3"
                placeholder="City"
                value={city}
                onChangeText={setCity}
                backgroundColor="$background"
                borderColor="$border"
              />
              <Input
                size="$3"
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
                backgroundColor="$background"
                borderColor="$border"
              />
              {hasLocationChanged && (
                <Button
                  size="$3"
                  backgroundColor="#3B82F6"
                  onPress={handleSaveLocation}
                  disabled={savingLocation}
                  pressStyle={{ backgroundColor: '#2563EB' }}
                >
                  <XStack alignItems="center" gap="$2">
                    {locationSaved ? (
                      <>
                        <Check size={16} color="#FFFFFF" />
                        <Text color="#FFFFFF" fontSize={14}>
                          Saved!
                        </Text>
                      </>
                    ) : (
                      <Text color="#FFFFFF" fontSize={14}>
                        {savingLocation ? 'Saving...' : 'Save Location'}
                      </Text>
                    )}
                  </XStack>
                </Button>
              )}
              <Text fontSize={11} color="$textMuted">
                Used for weather-based outfit scheduling
              </Text>
            </YStack>

            {/* Style Preferences Section */}
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <Sparkles size={16} color="#666666" />
                <Text fontSize={12} fontWeight="600" color="$textMuted" textTransform="uppercase">
                  Style Preferences
                </Text>
              </XStack>
              <Input
                size="$3"
                placeholder="e.g., casual, minimalist, prefer dark colors..."
                value={stylePreferences}
                onChangeText={setStylePreferences}
                backgroundColor="$background"
                borderColor="$border"
              />
              {hasPreferencesChanged && (
                <Button
                  size="$3"
                  backgroundColor="#3B82F6"
                  onPress={handleSavePreferences}
                  disabled={savingPreferences}
                  pressStyle={{ backgroundColor: '#2563EB' }}
                >
                  <XStack alignItems="center" gap="$2">
                    {preferencesSaved ? (
                      <>
                        <Check size={16} color="#FFFFFF" />
                        <Text color="#FFFFFF" fontSize={14}>
                          Saved!
                        </Text>
                      </>
                    ) : (
                      <Text color="#FFFFFF" fontSize={14}>
                        {savingPreferences ? 'Saving...' : 'Save Preferences'}
                      </Text>
                    )}
                  </XStack>
                </Button>
              )}
              <Text fontSize={11} color="$textMuted">
                AI will consider these when generating outfits
              </Text>
            </YStack>

            {/* Sign Out - pushed to bottom */}
            <YStack marginTop="auto">
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
          </YStack>
        </Animated.View>
      </View>
    </Modal>
  );
}

const MIN_ITEMS_FOR_SCHEDULE = 10;

export default function MainApp() {
  const [currentPage, setCurrentPage] = useState(SCHEDULE_PAGE);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [addItemSheetOpen, setAddItemSheetOpen] = useState(false);
  const [addEventSheetOpen, setAddEventSheetOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const refreshWardrobeRef = useRef<(() => void) | undefined>(undefined);
  const refreshScheduleRef = useRef<(() => void) | undefined>(undefined);
  const { items: wardrobeItems } = useWardrobeItems();
  const { createEvent } = useEvents();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFABPress = () => {
    setFabMenuOpen(true);
  };

  const handleAddItem = () => {
    setAddItemSheetOpen(true);
  };

  const handleAddEvent = () => {
    setAddEventSheetOpen(true);
  };

  const handleBulkUpload = () => {
    setBulkUploadOpen(true);
  };

  const handleBulkUploadComplete = useCallback(() => {
    setBulkUploadOpen(false);
    refreshWardrobeRef.current?.();
  }, []);

  const handleAddItemSuccess = useCallback(() => {
    setAddItemSheetOpen(false);
    refreshWardrobeRef.current?.();
  }, []);

  const handleCreateEvent = useCallback(async (data: CreateEventRequest) => {
    await createEvent(data);
    refreshScheduleRef.current?.();
  }, [createEvent]);

  const getTitle = () => {
    switch (currentPage) {
      case SCHEDULE_PAGE:
        return 'Schedule';
      case WARDROBE_PAGE:
        return 'Wardrobe';
      default:
        return 'Schedule';
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case SCHEDULE_PAGE:
        return (
          <ScheduleContent
            wardrobeItemCount={wardrobeItems.length}
            minItemsRequired={MIN_ITEMS_FOR_SCHEDULE}
            onRefreshReady={(refresh) => {
              refreshScheduleRef.current = refresh;
            }}
          />
        );
      case WARDROBE_PAGE:
        return (
          <WardrobeContent
            onRefreshReady={(refresh) => {
              refreshWardrobeRef.current = refresh;
            }}
          />
        );
      default:
        return (
          <ScheduleContent
            wardrobeItemCount={wardrobeItems.length}
            minItemsRequired={MIN_ITEMS_FOR_SCHEDULE}
            onRefreshReady={(refresh) => {
              refreshScheduleRef.current = refresh;
            }}
          />
        );
    }
  };

  return (
    <PageContainer>
      <Header title={getTitle()} onSettingsPress={() => setSettingsOpen(true)} />
      <YStack flex={1}>
        {renderContent()}
      </YStack>
      <Footer currentPage={currentPage} onPageChange={handlePageChange} onFABPress={handleFABPress} />
      <FABMenuSheet
        isOpen={fabMenuOpen}
        onClose={() => setFabMenuOpen(false)}
        onAddEvent={handleAddEvent}
        onAddItem={handleAddItem}
        onBulkUpload={handleBulkUpload}
      />
      <AddItemSheet
        isOpen={addItemSheetOpen}
        onClose={() => setAddItemSheetOpen(false)}
        onSuccess={handleAddItemSuccess}
      />
      <AddEventSheet
        isOpen={addEventSheetOpen}
        onClose={() => setAddEventSheetOpen(false)}
        onSubmit={handleCreateEvent}
      />
      <BulkUploadScreen
        isOpen={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onComplete={handleBulkUploadComplete}
      />
      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
});
