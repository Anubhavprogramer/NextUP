import { TMDBGenresResponse, TMDBSearchResponse, MediaItem, APIError } from '../Types';

const API_KEY = 'bf5766befcb7d7ef1941f2b96f16ab2d';
const BASE_URL = 'https://api.themoviedb.org/3';
const AccessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZjU3NjZiZWZjYjdkN2VmMTk0MWYyYjk2ZjE2YWIyZCIsIm5iZiI6MTc2NTk1NDgzMy44MzAwMDAyLCJzdWIiOiI2OTQyNTUxMWI0MzhiMTdiMGI3YTJhODkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.5jEmQIMXICbnZxDVFULPAwyclG188VjVjfM35MkhCdY';

export async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`;
  
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new APIError(
        `TMDB request failed: ${res.statusText}`,
        'TMDB_REQUEST_FAILED',
        res.status
      );
    }

    return res.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      `Network error: ${error}`,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Get movie genres from TMDB
 */
export async function getMovieGenres(): Promise<TMDBGenresResponse> {
  return tmdbFetch<TMDBGenresResponse>('/genre/movie/list');
}

/**
 * Get TV show genres from TMDB
 */
export async function getTVGenres(): Promise<TMDBGenresResponse> {
  return tmdbFetch<TMDBGenresResponse>('/genre/tv/list');
}

/**
 * Get all genres (combined movie and TV)
 */
export async function getAllGenres(): Promise<TMDBGenresResponse> {
  try {
    const [movieGenres, tvGenres] = await Promise.all([
      getMovieGenres(),
      getTVGenres(),
    ]);

    // Combine and deduplicate genres
    const allGenres = [...movieGenres.genres, ...tvGenres.genres];
    const uniqueGenres = allGenres.filter((genre, index, arr) => 
      arr.findIndex(g => g.id === genre.id) === index
    );

    return {
      genres: uniqueGenres.sort((a, b) => a.name.localeCompare(b.name)),
    };
  } catch (error) {
    throw new APIError(
      `Failed to fetch genres: ${error}`,
      'GENRES_FETCH_ERROR'
    );
  }
}

/**
 * Transform TMDB API response to our MediaItem format
 */
function transformTMDBItem(item: any): MediaItem | null {
  // Skip null/undefined items
  if (!item || typeof item !== 'object') return null;
  
  // Skip person results
  if (item.media_type === 'person') return null;
  
  // Handle both movie and TV show formats
  const title = item.title || item.name || 'Unknown Title';
  const releaseDate = item.release_date || item.first_air_date || '';
  const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
  
  return {
    id: item.id,
    title,
    overview: item.overview || '',
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    releaseDate,
    voteAverage: (typeof item.vote_average === 'number' && !isNaN(item.vote_average)) ? item.vote_average : 0,
    genreIds: item.genre_ids || [],
    mediaType,
    originalLanguage: item.original_language || 'en',
  };
}

/**
 * Search for movies and TV shows
 */
export async function searchMulti(query: string, page: number = 1): Promise<TMDBSearchResponse> {
  if (!query.trim()) {
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  const sanitizedQuery = encodeURIComponent(query.trim());
  const response = await tmdbFetch<any>(`/search/multi?query=${sanitizedQuery}&page=${page}`);
  
  // Transform results to our MediaItem format
  const transformedResults = response.results
    .map(transformTMDBItem)
    .filter((item): item is MediaItem => item !== null);
  
  return {
    page: response.page,
    results: transformedResults,
    total_pages: response.total_pages,
    total_results: response.total_results,
  };
}

/**
 * Search for movies only
 */
export async function searchMovies(query: string, page: number = 1): Promise<TMDBSearchResponse> {
  if (!query.trim()) {
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  const sanitizedQuery = encodeURIComponent(query.trim());
  const response = await tmdbFetch<any>(`/search/movie?query=${sanitizedQuery}&page=${page}`);
  
  // Transform results to our MediaItem format
  const transformedResults = response.results
    .map((item: any) => transformTMDBItem({ ...item, media_type: 'movie' }))
    .filter((item): item is MediaItem => item !== null);
  
  return {
    page: response.page,
    results: transformedResults,
    total_pages: response.total_pages,
    total_results: response.total_results,
  };
}

/**
 * Search for TV shows only
 */
export async function searchTV(query: string, page: number = 1): Promise<TMDBSearchResponse> {
  if (!query.trim()) {
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  const sanitizedQuery = encodeURIComponent(query.trim());
  const response = await tmdbFetch<any>(`/search/tv?query=${sanitizedQuery}&page=${page}`);
  
  // Transform results to our MediaItem format
  const transformedResults = response.results
    .map((item: any) => transformTMDBItem({ ...item, media_type: 'tv' }))
    .filter((item): item is MediaItem => item !== null);
  
  return {
    page: response.page,
    results: transformedResults,
    total_pages: response.total_pages,
    total_results: response.total_results,
  };
}
