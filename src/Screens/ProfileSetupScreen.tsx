import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ThemedView,
  ThemedText,
  ThemedInput,
  ThemedButton,
} from '../Components/Themed';

import { useTheme } from '../Store/ThemeContext';
import { useToast } from '../Store/ToastContext';
import { DESIGN_CONSTANTS } from '../Utils/constants';
import { dataManager } from '../Manager/DataManager';
import { ProfileFormData, ProfileValidationErrors } from '../Types';

export interface ProfileSetupScreenProps {
  onProfileCreated: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onProfileCreated,
}) => {
  const { theme } = useTheme();
  const { showError } = useToast();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
  });

  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: ProfileValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
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

  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            
            {/* HERO SECTION */}
            <View style={styles.hero}>
              <Image
                source={require('../../assets/app-icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <ThemedText variant="title" style={styles.title}>
                Your Watchlist, Organized
              </ThemedText>

              <ThemedText
                variant="body"
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
              >
                Track shows, save movies, and never lose what you wanted to
                watch again.
              </ThemedText>
            </View>

            {/* INPUT CARD */}
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: theme.colors.background,
                },
              ]}
            >
              <ThemedText variant="subtitle" style={styles.inputTitle}>
                Let's start with your name
              </ThemedText>

              <ThemedInput
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                error={errors.name}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>

            {/* CTA */}
            <View style={styles.buttonContainer}>
              <ThemedButton
                title="Continue"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                fullWidth
              />
            </View>

            {/* FOOTER */}
            <ThemedText
              variant="caption"
              style={[styles.footer, { color: theme.colors.textSecondary }]}
            >
              Takes less than 5 seconds
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  keyboardAvoid: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: DESIGN_CONSTANTS.CONTAINER_PADDING,
    justifyContent: 'center',
  },

  hero: {
    alignItems: 'center',
    marginBottom: DESIGN_CONSTANTS.CARD_PADDING,
  },

  logo: {
    width: '80%',
    height: '40%',
    marginBottom: DESIGN_CONSTANTS.SPACING.medium,
  },

  title: {
    textAlign: 'center',
    marginBottom: DESIGN_CONSTANTS.SPACING.small,
  },

  subtitle: {
    textAlign: 'center',
  },

  formCard: {
    // padding: DESIGN_CONSTANTS.SPACING.medium,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.large,
    marginBottom: DESIGN_CONSTANTS.SPACING.large,
  },

  inputTitle: {
    marginBottom: DESIGN_CONSTANTS.SPACING.small,
  },

  buttonContainer: {
    marginBottom: DESIGN_CONSTANTS.SPACING.medium,
  },

  footer: {
    textAlign: 'center',
    opacity: 0.7,
  },
});