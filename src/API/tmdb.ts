import { TMDBGenresResponse, TMDBSearchResponse, MediaItem, APIError } from '../Types';

const API_KEY = 'bf5766befcb7d7ef1941f2b96f16ab2d';
const BASE_URL = 'https://api.themoviedb.org/3';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZjU3NjZiZWZjYjdkN2VmMTk0MWYyYjk2ZjE2YWIyZCIsIm5iZiI6MTc2NTk1NDgzMy44MzAwMDAyLCJzdWIiOiI2OTQyNTUxMWI0MzhiMTdiMGI3YTJhODkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.5jEmQIMXICbnZxDVFULPAwyclG188VjVjfM35MkhCdY';

/**
 * Build URL with query parameters (React Native compatible)
 */
function buildUrl(endpoint: string, params: Record<string, string | number> = {}): string {
  // Build URL manually for better React Native compatibility
  let url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`;
  
  // Add custom parameters
  Object.entries(params).forEach(([key, value]) => {
    url += `&${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
  });
  
  return url;
}

/**
 * Fetch data from TMDB API (React Native compatible)
 */
export async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = buildUrl(endpoint, params);
  
  try {
    console.log('🔍 TMDB API Request:', url);
    
    // Simplified fetch for React Native compatibility
    const res = await fetch(url);

    console.log('📡 TMDB API Response Status:', res.status);

    if (!res.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await res.text();
      } catch (e) {
        console.warn('Could not read error response text');
      }
      
      console.error('❌ TMDB API Error Response:', errorText);
      throw new APIError(
        `TMDB request failed: ${res.status} ${res.statusText}`,
        'TMDB_REQUEST_FAILED',
        res.status
      );
    }

    const data = await res.json();
    console.log('✅ TMDB API Success:', data.total_results || data.results?.length || 'N/A', 'results');
    return data;
  } catch (error) {
    console.error('🚨 TMDB API Error:', error);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle different types of network errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('Network request failed') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('connection')) {
      throw new APIError(
        'Network connection failed. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    }
    
    throw new APIError(
      `Network error: ${errorMessage}`,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Get movie genres from TMDB (following TMDB documentation)
 */
export async function getMovieGenres(): Promise<TMDBGenresResponse> {
  return tmdbFetch<TMDBGenresResponse>('/genre/movie/list');
}

/**
 * Get TV show genres from TMDB (following TMDB documentation)
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
 * Search for movies and TV shows (following TMDB documentation)
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

  const response = await tmdbFetch<any>('/search/multi', {
    query: query.trim(),
    page: page,
  });
  
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
 * Search for movies only (following TMDB documentation)
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

  const response = await tmdbFetch<any>('/search/movie', {
    query: query.trim(),
    page: page,
  });
  
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
 * Search for TV shows only (following TMDB documentation)
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

  const response = await tmdbFetch<any>('/search/tv', {
    query: query.trim(),
    page: page,
  });
  
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

/**
 * Discover popular movies (following TMDB documentation)
 */
export async function discoverPopularMovies(page: number = 1): Promise<TMDBSearchResponse> {
  const response = await tmdbFetch<any>('/discover/movie', {
    sort_by: 'popularity.desc',
    page: page,
  });
  
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
 * Discover popular TV shows
 */
export async function discoverPopularTV(page: number = 1): Promise<TMDBSearchResponse> {
  const response = await tmdbFetch<any>('/discover/tv', {
    sort_by: 'popularity.desc',
    page: page,
  });
  
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

// ========== DETAIL METHODS (Following TMDB Documentation) ==========

/**
 * Get movie details with optional append_to_response
 * Following TMDB documentation: https://api.themoviedb.org/3/movie/{movie_id}
 */
export async function getMovieDetails(
  movieId: number, 
  appendToResponse?: string[]
): Promise<any> {
  const params: Record<string, string | number> = {};
  
  if (appendToResponse && appendToResponse.length > 0) {
    params.append_to_response = appendToResponse.join(',');
  }
  
  return tmdbFetch<any>(`/movie/${movieId}`, params);
}

/**
 * Get TV show details with optional append_to_response
 * Following TMDB documentation: https://api.themoviedb.org/3/tv/{tv_id}
 */
export async function getTVDetails(
  tvId: number, 
  appendToResponse?: string[]
): Promise<any> {
  const params: Record<string, string | number> = {};
  
  if (appendToResponse && appendToResponse.length > 0) {
    params.append_to_response = appendToResponse.join(',');
  }
  
  return tmdbFetch<any>(`/tv/${tvId}`, params);
}

/**
 * Get media details (movie or TV) with videos and images
 * This follows the TMDB workflow: Search → Get Details with append_to_response
 */
export async function getMediaDetailsWithExtras(
  mediaId: number, 
  mediaType: 'movie' | 'tv'
): Promise<any> {
  const appendToResponse = ['videos', 'images', 'credits'];
  
  if (mediaType === 'movie') {
    return getMovieDetails(mediaId, appendToResponse);
  } else {
    return getTVDetails(mediaId, appendToResponse);
  }
}

/**
 * Get movie videos
 */
export async function getMovieVideos(movieId: number): Promise<any> {
  return tmdbFetch<any>(`/movie/${movieId}/videos`);
}

/**
 * Get TV show videos
 */
export async function getTVVideos(tvId: number): Promise<any> {
  return tmdbFetch<any>(`/tv/${tvId}/videos`);
}

/**
 * Get movie images
 */
export async function getMovieImages(movieId: number): Promise<any> {
  return tmdbFetch<any>(`/movie/${movieId}/images`);
}

/**
 * Get TV show images
 */
export async function getTVImages(tvId: number): Promise<any> {
  return tmdbFetch<any>(`/tv/${tvId}/images`);
}

/**
 * Test TMDB API connection
 */
export async function testTMDBConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing TMDB API connection...');
    const response = await tmdbFetch<any>('/configuration');
    console.log('✅ TMDB API connection successful');
    return true;
  } catch (error) {
    console.error('❌ TMDB API connection failed:', error);
    return false;
  }
}
