#!/bin/bash

echo "Setting up React Native Vector Icons fonts..."

# Create Android fonts directory
mkdir -p android/app/src/main/assets/fonts

# Copy only Ionicons font to Android (to avoid duplicates)
cp node_modules/react-native-vector-icons/Fonts/Ionicons.ttf android/app/src/main/assets/fonts/

echo "Ionicons font copied to Android assets folder"

# For iOS, the fonts should be automatically linked via the Info.plist configuration
echo "iOS fonts configured in Info.plist"

echo "Font setup complete! Please clean and rebuild your project:"
echo "npx react-native clean"
echo "cd android && ./gradlew clean && cd .."
echo "npx react-native run-android"