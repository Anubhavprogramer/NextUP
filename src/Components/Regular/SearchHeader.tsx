import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Store/ThemeContext';
import { DESIGN_CONSTANTS } from '../../Utils/constants';
import { Images } from '../../Utils/Imges';

export interface SearchHeaderProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onSearch,
  placeholder = 'Search movies and TV shows...',
  debounceMs = 300,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    onSearch('');
  }, [onSearch]);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.small,
      // paddingVertical: DESIGN_CONSTANTS.SPACING.small,
    },

    backButton: {
      paddingRight: DESIGN_CONSTANTS.SPACING.small,
    },

    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.xlarge,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      borderWidth: 1.5,
      borderColor: theme.colors.primaryDark,
      height: 45,
    },

    searchIcon: {
      marginRight: DESIGN_CONSTANTS.SPACING.small,
    },

    input: {
      flex: 1,
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
      color: theme.colors.text,
      paddingVertical: DESIGN_CONSTANTS.SPACING.small, // reduced
      fontWeight: DESIGN_CONSTANTS.TYPOGRAPHY.weights.regular,
    },

    clearButton: {
      paddingLeft: DESIGN_CONSTANTS.SPACING.small,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-back" size={40} color={theme.colors.primaryDark} />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
            <Image
              source={Images.search}
              style={{ width: 22, height: 22, tintColor: theme.colors.primaryDark }}
              resizeMode="contain"
            />
        </View>

        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Icon
              name="close-circle"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
