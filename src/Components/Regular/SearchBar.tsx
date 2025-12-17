import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Store/ThemeContext';
import { SearchBarProps } from '../../Types';
import { DESIGN_CONSTANTS } from '../../Utils/constants';

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search movies and TV shows...',
  debounceMs = 300,
}) => {
  const { theme } = useTheme();
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
  }, []);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS.medium,
      paddingHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
      marginHorizontal: DESIGN_CONSTANTS.SPACING.medium,
      marginVertical: DESIGN_CONSTANTS.SPACING.small,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: {
      marginRight: DESIGN_CONSTANTS.SPACING.small,
    },
    input: {
      flex: 1,
      fontSize: DESIGN_CONSTANTS.TYPOGRAPHY.sizes.body,
      color: theme.colors.text,
      paddingVertical: DESIGN_CONSTANTS.SPACING.small,
    },
    clearButton: {
      padding: DESIGN_CONSTANTS.SPACING.small,
      marginLeft: DESIGN_CONSTANTS.SPACING.small,
    },
  });

  return (
    <View style={styles.container}>
      <Icon
        name="search"
        size={20}
        color={theme.colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
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
  );
};