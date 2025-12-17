/**
 * TMDB API Usage Examples
 * Following the official TMDB documentation workflow
 */

import { 
  searchMulti, 
  searchMovies, 
  searchTV, 
  getMovieDetails, 
  getTVDetails, 
  getMediaDetailsWithExtras 
} from './tmdb';

/**
 * Example 1: Basic Search Workflow (from TMDB docs)
 * 1. Search for content
 * 2. Get details using the ID from search results
 */
export async function exampleSearchWorkflow() {
  try {
    // Step 1: Search for "Jack Reacher" (example from TMDB docs)
    console.log('🔍 Searching for "Jack Reacher"...');
    const searchResults = await searchMovies('Jack Reacher');
    
    if (searchResults.results.length > 0) {
      const firstResult = searchResults.results[0];
      console.log(`📽️ Found: ${firstResult.title} (ID: ${firstResult.id})`);
      
      // Step 2: Get detailed information using the ID
      console.log('📋 Getting movie details...');
      const movieDetails = await getMovieDetails(firstResult.id);
      console.log(`🎬 Runtime: ${movieDetails.runtime} minutes`);
      console.log(`⭐ Rating: ${movieDetails.vote_average}/10`);
    }
  } catch (error) {
    console.error('❌ Search workflow error:', error);
  }
}

/**
 * Example 2: Using append_to_response (from TMDB docs)
 * Get movie details with videos and images in a single request
 */
export async function exampleAppendToResponse() {
  try {
    // Using movie ID 11 (Star Wars) as shown in TMDB docs
    console.log('🎬 Getting movie details with videos and images...');
    
    const movieWithExtras = await getMediaDetailsWithExtras(11, 'movie');
    
    console.log(`🎥 Title: ${movieWithExtras.title}`);
    console.log(`📹 Videos found: ${movieWithExtras.videos?.results?.length || 0}`);
    console.log(`🖼️ Images found: ${movieWithExtras.images?.posters?.length || 0} posters`);
    
    // Show trailer if available
    const trailer = movieWithExtras.videos?.results?.find(
      (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    if (trailer) {
      console.log(`🎞️ Trailer: https://www.youtube.com/watch?v=${trailer.key}`);
    }
  } catch (error) {
    console.error('❌ Append to response error:', error);
  }
}

/**
 * Example 3: Multi-search (movies, TV shows, people)
 * Then get specific details based on media type
 */
export async function exampleMultiSearch() {
  try {
    console.log('🔍 Multi-searching for "Avengers"...');
    const results = await searchMulti('Avengers');
    
    for (const item of results.results.slice(0, 3)) { // First 3 results
      console.log(`\n📺 ${item.title} (${item.mediaType})`);
      
      if (item.mediaType === 'movie') {
        const details = await getMovieDetails(item.id, ['videos']);
        console.log(`   🎬 Runtime: ${details.runtime} minutes`);
      } else if (item.mediaType === 'tv') {
        const details = await getTVDetails(item.id, ['videos']);
        console.log(`   📺 Seasons: ${details.number_of_seasons}`);
        console.log(`   📺 Episodes: ${details.number_of_episodes}`);
      }
    }
  } catch (error) {
    console.error('❌ Multi-search error:', error);
  }
}

/**
 * Example 4: Efficient batch requests using append_to_response
 * This demonstrates the power of TMDB's append_to_response feature
 */
export async function exampleEfficientRequests() {
  try {
    console.log('⚡ Demonstrating efficient API usage...');
    
    // Instead of making 4 separate requests:
    // 1. GET /movie/550 (Fight Club details)
    // 2. GET /movie/550/videos
    // 3. GET /movie/550/images  
    // 4. GET /movie/550/credits
    
    // We make just 1 request with append_to_response:
    const movieId = 550; // Fight Club
    const allData = await getMovieDetails(movieId, ['videos', 'images', 'credits']);
    
    console.log(`🎬 ${allData.title}`);
    console.log(`📹 Videos: ${allData.videos?.results?.length || 0}`);
    console.log(`🖼️ Images: ${allData.images?.posters?.length || 0}`);
    console.log(`👥 Cast: ${allData.credits?.cast?.length || 0} actors`);
    
    console.log('✅ All data retrieved in a single API call!');
  } catch (error) {
    console.error('❌ Efficient requests error:', error);
  }
}