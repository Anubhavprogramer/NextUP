import { CollectionItem, MediaItem } from '../Types';
import { logger } from '../Utils/debugger';

/**
 * Statistics types for watch history and analytics
 */
export interface WatchStatistics {
  totalWatched: number;
  totalWatching: number;
  totalWillWatch: number;
  totalMovies: number;
  totalTVShows: number;
  totalHoursWatched: number;
  averageRating: number;
  topGenres: { genreId: number; count: number }[];
  favoriteYear: number | null;
  mostWatchedGenre: string | null;
  viewingStreak: number;
  lastWatchDate: string | null;
  genreBreakdown: Map<string, number>;
  yearDistribution: Map<number, number>;
  monthlyWatchActivity: Map<string, number>;
}

export interface WatchHistoryEntry {
  mediaItemId: number;
  title: string;
  watchedDate: string;
  rating?: number;
  mediaType: 'movie' | 'tv';
  posterPath: string | null;
}

/**
 * StatisticsManager - Calculate and track watch history analytics
 */
export class StatisticsManager {
  private static instance: StatisticsManager;

  private constructor() {}

  public static getInstance(): StatisticsManager {
    if (!StatisticsManager.instance) {
      StatisticsManager.instance = new StatisticsManager();
    }
    return StatisticsManager.instance;
  }

  /**
   * Calculate comprehensive statistics from collections
   */
  calculateStatistics(
    watchedItems: CollectionItem[],
    watchingItems: CollectionItem[],
    willWatchItems: CollectionItem[],
  ): WatchStatistics {
    logger.info('StatisticsManager', 'Calculating statistics');

    const stats: WatchStatistics = {
      totalWatched: watchedItems.length,
      totalWatching: watchingItems.length,
      totalWillWatch: willWatchItems.length,
      totalMovies: this.countMediaType(watchedItems, 'movie'),
      totalTVShows: this.countMediaType(watchedItems, 'tv'),
      totalHoursWatched: this.calculateTotalHours(watchedItems),
      averageRating: this.calculateAverageRating(watchedItems),
      topGenres: this.getTopGenres(watchedItems),
      favoriteYear: this.getFavoriteYear(watchedItems),
      mostWatchedGenre: null,
      viewingStreak: this.calculateViewingStreak(watchedItems),
      lastWatchDate: this.getLastWatchDate(watchedItems),
      genreBreakdown: this.getGenreBreakdown(watchedItems),
      yearDistribution: this.getYearDistribution(watchedItems),
      monthlyWatchActivity: this.getMonthlyActivity(watchedItems),
    };

    logger.debug('StatisticsManager', 'Statistics calculated', stats);
    return stats;
  }

  /**
   * Get watch history timeline
   */
  getWatchHistory(items: CollectionItem[]): WatchHistoryEntry[] {
    const history: WatchHistoryEntry[] = items
      .filter(item => item.watchedDate)
      .map(item => ({
        mediaItemId: item.mediaItem.id,
        title: item.mediaItem.title,
        watchedDate: item.watchedDate!,
        rating: item.userRating,
        mediaType: item.mediaItem.mediaType,
        posterPath: item.mediaItem.posterPath,
      }))
      .sort(
        (a, b) =>
          new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime(),
      );

    logger.debug('StatisticsManager', 'Generated watch history', {
      count: history.length,
    });

    return history;
  }

  /**
   * Count items by media type
   */
  private countMediaType(
    items: CollectionItem[],
    type: 'movie' | 'tv',
  ): number {
    return items.filter(item => item.mediaItem.mediaType === type).length;
  }

  /**
   * Calculate total hours watched
   * Estimates: Movies = 2 hours, TV Shows = 1 hour per episode (assume 10 episodes)
   */
  private calculateTotalHours(items: CollectionItem[]): number {
    return items.reduce((total, item) => {
      if (item.mediaItem.mediaType === 'movie') {
        return total + 2; // Average movie duration
      } else {
        // Rough estimate: 10 episodes per season
        return total + 10;
      }
    }, 0);
  }

  /**
   * Calculate average rating from user ratings
   */
  private calculateAverageRating(items: CollectionItem[]): number {
    const ratedItems = items.filter(item => item.mediaItem.voteAverage);
    if (ratedItems.length === 0) return 0;

    const sum = ratedItems.reduce(
      (total, item) => total + (item.mediaItem.voteAverage || 0),
      0,
    );
    return Number((sum / ratedItems.length).toFixed(1));
  }

  /**
   * Get top genres from watched items
   */
  private getTopGenres(
    items: CollectionItem[],
  ): { genreId: number; count: number }[] {
    const genreMap = new Map<number, number>();

    items.forEach(item => {
      item.mediaItem.genreIds.forEach(genreId => {
        genreMap.set(genreId, (genreMap.get(genreId) || 0) + 1);
      });
    });

    return Array.from(genreMap.entries())
      .map(([genreId, count]) => ({ genreId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 genres
  }

  /**
   * Get favorite year (most watched movies/shows from)
   */
  private getFavoriteYear(items: CollectionItem[]): number[] | null {
    if (items.length === 0) return null;

    const yearMap = new Map<number, number>();

    items.forEach(item => {
      const year = new Date(item.mediaItem.releaseDate).getFullYear();
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    });

    const maxCount = Math.max(...yearMap.values());

    const favoriteYears = Array.from(yearMap.entries())
      .filter(([, count]) => count === maxCount)
      .map(([year]) => year);

    return favoriteYears;
  }

  /**
   * Calculate viewing streak (consecutive days watched)
   */
  private calculateViewingStreak(items: CollectionItem[]): number {
    if (items.length === 0) return 0;

    const sortedDates = items
      .filter(item => item.watchedDate)
      .map(item => new Date(item.watchedDate!).toDateString())
      .filter((date, index, arr) => index === 0 || arr[index - 1] !== date)
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from the most recent watch date
    let currentDate = new Date(sortedDates[0]);
    currentDate.setHours(0, 0, 0, 0);

    // If the most recent watch is not today or yesterday, streak is 0
    const daysDiff = Math.floor(
      (today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff > 1) return 0;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      prevDate.setHours(0, 0, 0, 0);

      const diff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diff === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get the last watch date
   */
  private getLastWatchDate(items: CollectionItem[]): string | null {
    const watchedItems = items.filter(item => item.watchedDate);
    if (watchedItems.length === 0) return null;

    return (
      watchedItems.reduce((latest, item) => {
        const currentDate = new Date(item.watchedDate!).getTime();
        const latestDate = new Date(latest.watchedDate!).getTime();
        return currentDate > latestDate ? item : latest;
      }).watchedDate || null
    );
  }

  /**
   * Get genre breakdown
   */
  private getGenreBreakdown(items: CollectionItem[]): Map<string, number> {
    const breakdown = new Map<string, number>();

    // This would need genre ID to name mapping from TMDB
    // For now, we'll just track by ID
    items.forEach(item => {
      item.mediaItem.genreIds.forEach(genreId => {
        const key = `genre_${genreId}`;
        breakdown.set(key, (breakdown.get(key) || 0) + 1);
      });
    });

    return breakdown;
  }

  /**
   * Get year distribution
   */
  private getYearDistribution(items: CollectionItem[]): Map<number, number> {
    const distribution = new Map<number, number>();

    items.forEach(item => {
      const year = new Date(item.mediaItem.releaseDate).getFullYear();
      distribution.set(year, (distribution.get(year) || 0) + 1);
    });

    return distribution;
  }

  /**
   * Get monthly watch activity
   */
  private getMonthlyActivity(items: CollectionItem[]): Map<string, number> {
    const activity = new Map<string, number>();

    items.forEach(item => {
      if (item.watchedDate) {
        const date = new Date(item.watchedDate);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, '0')}`;
        activity.set(monthKey, (activity.get(monthKey) || 0) + 1);
      }
    });

    return activity;
  }

  /**
   * Format statistics for display
   */
  formatStatisticsForDisplay(stats: WatchStatistics): {
    watched: string;
    watching: string;
    willWatch: string;
    hours: string;
    movies: string;
    tvShows: string;
    avgRating: string;
    streak: string;
  } {
    return {
      watched: `${stats.totalWatched} watched`,
      watching: `${stats.totalWatching} watching`,
      willWatch: `${stats.totalWillWatch} to watch`,
      hours: `${stats.totalHoursWatched}h watched`,
      movies: `${stats.totalMovies} movies`,
      tvShows: `${stats.totalTVShows} TV shows`,
      avgRating:
        stats.averageRating > 0 ? `${stats.averageRating}/10` : 'No ratings',
      streak: `${stats.viewingStreak} day streak`,
    };
  }
}

export const statisticsManager = StatisticsManager.getInstance();
