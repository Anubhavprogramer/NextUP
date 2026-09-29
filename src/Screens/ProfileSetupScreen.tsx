import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { ThemedText, ThemedInput, ThemedButton } from '../Components/Themed';
import { PosterWall } from '../Components/Regular/PosterWall';
import { useTheme } from '../Store/ThemeContext';
import { useToast } from '../Store/ToastContext';
import { DESIGN_CONSTANTS } from '../Utils/constants';
import { getTMDBImageUrl } from '../Utils/helpers';
import { dataManager } from '../Manager/DataManager';
import { discoverPopularMovies } from '../API/tmdb';
import { ProfileFormData, ProfileValidationErrors, VALIDATION_CONSTANTS } from '../Types';
import { logger } from '../Utils/debugger';

export interface ProfileSetupScreenProps {
  onProfileCreated: () => void;
}

const FEATURES = [
  { icon: 'paper-plane', label: 'Share a reel' },
  { icon: 'bookmark', label: 'Save in a tap' },
  { icon: 'play-circle', label: 'Track what’s next' },
];

type Step = 'welcome' | 'name';

/**
 * First launch: a movie-app style welcome (drifting wall of popular posters)
 * followed by a one-field profile step.
 */
export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onProfileCreated }) => {
  const { theme } = useTheme();
  const { showError } = useToast();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const [step, setStep] = useState<Step>('welcome');
  const [posters, setPosters] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProfileFormData>({ name: '' });
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const stepAnim = useRef(new Animated.Value(0)).current;

  // Real, current posters make the first screen feel alive; offline it keeps neutral tiles.
  useEffect(() => {
    let cancelled = false;
    discoverPopularMovies(1)
      .then(response => {
        const urls = response.results
          .map(item => getTMDBImageUrl(item.posterPath, 'w185'))
          .filter((url): url is string => !!url);
        if (!cancelled) setPosters(urls);
      })
      .catch(error => logger.warn('ProfileSetup', 'Poster wall unavailable', { error: String(error) }));
    return () => {
      cancelled = true;
    };
  }, []);

  const goToName = () => {
    setStep('name');
    stepAnim.setValue(0);
    Animated.timing(stepAnim, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  const validateForm = () => {
    const newErrors: ProfileValidationErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name';
    } else if (formData.name.length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
      newErrors.name = `Name cannot exceed ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} characters`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await dataManager.createUserProfile(formData.name.trim());
      await dataManager.completeFirstLaunch();
      onProfileCreated();
    } catch (error) {
      showError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wallHeight = Math.round(screenHeight * (step === 'welcome' ? 0.52 : 0.36));

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    hero: { height: wallHeight },
    content: {
      flexGrow: 1,
      paddingHorizontal: DESIGN_CONSTANTS.CONTAINER_PADDING + 4,
      paddingBottom: Math.max(insets.bottom, DESIGN_CONSTANTS.SPACING.medium) + DESIGN_CONSTANTS.SPACING.small,
      marginTop: -DESIGN_CONSTANTS.SPACING.small,
    },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: DESIGN_CONSTANTS.SPACING.medium },
    icon: { width: 44, height: 44, borderRadius: 11 },
    brandName: { fontSize: 22, fontWeight: '800', color: theme.colors.primaryDark, letterSpacing: -0.5 },
    headline: { fontSize: 34, lineHeight: 38, fontWeight: '800', color: theme.colors.primaryDark, letterSpacing: -1 },
    sub: { color: theme.colors.textSecondary, marginTop: DESIGN_CONSTANTS.SPACING.small, fontSize: 15, lineHeight: 21 },
    features: { flexDirection: 'row', gap: 8, marginTop: DESIGN_CONSTANTS.SPACING.large },
    feature: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
      backgroundColor: 'rgba(255,255,255,0.55)',
    },
    featureLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.primaryDark, textAlign: 'center' },
    spacer: { flex: 1, minHeight: DESIGN_CONSTANTS.SPACING.large },
    note: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: DESIGN_CONSTANTS.SPACING.small },
    question: { fontSize: 26, lineHeight: 31, fontWeight: '800', color: theme.colors.primaryDark, letterSpacing: -0.6, marginBottom: 4 },
    back: { alignSelf: 'center', marginTop: DESIGN_CONSTANTS.SPACING.small, padding: DESIGN_CONSTANTS.SPACING.small },
  });

  const nameStepStyle = {
    opacity: stepAnim,
    transform: [{ translateY: stepAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.hero}>
            <PosterWall posters={posters} height={wallHeight} fade={0.6} topFade={insets.top + 36} />
          </View>

          <View style={styles.content}>
            <View style={styles.brand}>
              <Image source={require('../../assets/app-icon.png')} style={styles.icon} accessibilityIgnoresInvertColors />
              <ThemedText style={styles.brandName}>NextUP</ThemedText>
            </View>

            {step === 'welcome' ? (
              <>
                <ThemedText style={styles.headline} accessibilityRole="header">
                  Your Watchlist,{'\n'}Organized
                </ThemedText>
                <ThemedText style={styles.sub}>
                  Save movies straight from reels, track what you’re watching, and never lose what’s next.
                </ThemedText>
                <View style={styles.features}>
                  {FEATURES.map(feature => (
                    <View key={feature.label} style={styles.feature}>
                      <Icon name={feature.icon} size={22} color={theme.colors.primary} />
                      <ThemedText style={styles.featureLabel}>{feature.label}</ThemedText>
                    </View>
                  ))}
                </View>
                <View style={styles.spacer} />
                <ThemedButton title="Get started" onPress={goToName} fullWidth />
                <ThemedText variant="caption" style={styles.note}>
                  No account needed · your lists stay on your phone
                </ThemedText>
              </>
            ) : (
              <Animated.View style={[{ flex: 1 }, nameStepStyle]}>
                <ThemedText style={styles.question} accessibilityRole="header">
                  What should we call you?
                </ThemedText>
                <ThemedText style={[styles.sub, { marginTop: 0, marginBottom: DESIGN_CONSTANTS.SPACING.medium }]}>
                  We’ll use it to greet you. That’s it.
                </ThemedText>
                <ThemedInput
                  placeholder="Your name"
                  value={formData.name}
                  onChangeText={text => {
                    setFormData({ name: text });
                    if (errors.name) setErrors({});
                  }}
                  error={errors.name}
                  autoCapitalize="words"
                  autoFocus
                  maxLength={VALIDATION_CONSTANTS.MAX_NAME_LENGTH}
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                />
                <View style={styles.spacer} />
                <ThemedButton title="Start watching" onPress={handleSubmit} loading={loading} disabled={loading} fullWidth />
                <ThemedText variant="caption" style={styles.back} onPress={() => setStep('welcome')} accessibilityRole="button">
                  Back
                </ThemedText>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
