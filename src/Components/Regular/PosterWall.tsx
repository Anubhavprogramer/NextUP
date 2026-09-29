import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../Store/ThemeContext';

interface PosterWallProps {
  /** Poster image URLs; while empty, neutral tiles keep the layout. */
  posters: string[];
  height: number;
  /** Portion of the height (0–1) at the bottom that fades into the background. */
  fade?: number;
  /** Height in dp of a light fade at the top (keeps the status bar readable). */
  topFade?: number;
}

const COLUMNS = 4;
const GAP = 10;
const PER_COLUMN = 5;
// Slightly different speeds so the columns never line up (ms per full loop).
const DURATIONS = [52000, 64000, 58000, 70000];

/**
 * Movie-app style backdrop: tilted columns of posters drifting slowly in
 * opposite directions. Decorative only (hidden from screen readers) and still
 * when the user has "reduce motion" turned on.
 */
export const PosterWall: React.FC<PosterWallProps> = ({ posters, height, fade = 0.5, topFade = 0 }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const progress = useRef(DURATIONS.map(() => new Animated.Value(0))).current;

  const wallWidth = width * 1.22;
  const tileWidth = (wallWidth - GAP * (COLUMNS + 1)) / COLUMNS;
  const tileHeight = tileWidth * 1.5;
  const loopHeight = PER_COLUMN * (tileHeight + GAP);

  const columns = useMemo(
    () =>
      Array.from({ length: COLUMNS }, (_, c) =>
        Array.from({ length: PER_COLUMN }, (_, i) => (posters.length ? posters[(c * PER_COLUMN + i) % posters.length] : null)),
      ),
    [posters],
  );

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const loops = progress.map((value, i) =>
      Animated.loop(Animated.timing(value, { toValue: 1, duration: DURATIONS[i], easing: Easing.linear, useNativeDriver: true })),
    );
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [reduceMotion, progress]);

  return (
    // pointerEvents="none": the drifting columns extend far below the visible area; on
    // Android they would otherwise swallow taps meant for buttons underneath them.
    <View
      pointerEvents="none"
      style={[styles.clip, { height }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden>
      <View style={[styles.wall, { width: wallWidth, left: (width - wallWidth) / 2 }]}>
        {columns.map((items, c) => {
          // Alternate columns drift down/up; each column is drawn twice for a seamless loop.
          const direction = c % 2 === 1 ? 1 : -1;
          const translateY = progress[c].interpolate({
            inputRange: [0, 1],
            outputRange: direction < 0 ? [0, -loopHeight] : [-loopHeight, 0],
          });
          return (
            <Animated.View key={c} style={[styles.column, { width: tileWidth, marginTop: c % 2 === 1 ? -tileHeight / 2 : 0, transform: [{ translateY }] }]}>
              {[...items, ...items].map((uri, i) => (
                <View key={i} style={[styles.tile, { width: tileWidth, height: tileHeight, backgroundColor: theme.colors.surface }]}>
                  {uri && <Image source={{ uri }} style={styles.poster} resizeMode="cover" />}
                </View>
              ))}
            </Animated.View>
          );
        })}
      </View>
      <Fade edge="bottom" height={height * fade} color={theme.colors.background} />
      {topFade > 0 && <Fade edge="top" height={topFade} color={theme.colors.background} />}
    </View>
  );
};

/** Hex colour → "r, g, b" for rgba() stops. */
const rgb = (hex: string) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

/**
 * One natively drawn CSS gradient (New Architecture) fading the wall into the
 * background. A stack of translucent views looked the same but cost a full-screen
 * blend per layer on every animated frame.
 */
const Fade: React.FC<{ edge: 'top' | 'bottom'; height: number; color: string }> = ({ edge, height, color }) => {
  const c = rgb(color);
  const direction = edge === 'bottom' ? 'to bottom' : 'to top';
  return (
    <View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: 0, right: 0, height },
        edge === 'bottom' ? { bottom: 0 } : { top: 0 },
        {
          experimental_backgroundImage: `linear-gradient(${direction}, rgba(${c}, 0) 0%, rgba(${c}, 0.6) 45%, rgba(${c}, 0.92) 78%, rgba(${c}, 1) 100%)`,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', width: '100%' },
  wall: {
    position: 'absolute',
    top: -60,
    flexDirection: 'row',
    gap: GAP,
    paddingHorizontal: GAP,
    transform: [{ rotate: '-8deg' }],
  },
  column: { gap: GAP },
  tile: { borderRadius: 12, overflow: 'hidden' },
  poster: { width: '100%', height: '100%' },
});
