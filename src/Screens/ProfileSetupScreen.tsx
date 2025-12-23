import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
import { validateUserProfile } from '../Utils/helpers';
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

  const validateForm = (): boolean => {
    const newErrors: ProfileValidationErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 1) {
      newErrors.name = 'Name must be at least 1 character';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create user profile
      await dataManager.createUserProfile(formData.name.trim());

      // Mark first launch as complete
      await dataManager.completeFirstLaunch();

      // Notify parent component
      onProfileCreated();
    } catch (error) {
      console.error('Failed to create profile:', error);
      showError('Failed to create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText variant="title" style={styles.title}>
                Welcome to NextUP
              </ThemedText>
              <ThemedText variant="body" style={styles.subtitle}>
                Let's set up your profile to get started with tracking your favorite movies and TV shows
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Input */}
              <ThemedInput
                label="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                error={errors.name}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
              />
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <ThemedButton
                title="Create Profile"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                fullWidth
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText variant="caption" style={styles.footerText}>
                Your data is stored locally on your device and never shared with third parties.
              </ThemedText>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: DESIGN_CONSTANTS.CONTAINER_PADDING,
    paddingVertical: DESIGN_CONSTANTS.SPACING.large,
  },
  header: {
    alignItems: 'center',
    marginBottom: DESIGN_CONSTANTS.SPACING.xxlarge,
  },
  title: {
    textAlign: 'center',
    marginBottom: DESIGN_CONSTANTS.SPACING.medium,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body * 1.5,
  },
  form: {
    flex: 1,
    marginBottom: DESIGN_CONSTANTS.SPACING.large,
  },
  buttonContainer: {
    marginBottom: DESIGN_CONSTANTS.SPACING.large,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.caption * 1.4,
  },
});