/**
 * Debug utilities for TMDB API
 */

import { APIError } from '../Types';

const API_KEY = 'bf5766befcb7d7ef1941f2b96f16ab2d';
const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Simple TMDB API test with minimal dependencies
 */
export async function debugTMDBAPI(): Promise<void> {
  console.log('🔍 Debug: Testing TMDB API...');
  
  // Test 1: Configuration endpoint (simplest test)
  try {
    const configUrl = `${BASE_URL}/configuration?api_key=${API_KEY}`;
    console.log('📡 Debug: Testing configuration endpoint:', configUrl);
    
    const response = await fetch(configUrl);
    console.log('📊 Debug: Response status:', response.status);
    console.log('📊 Debug: Response headers:', JSON.stringify([...response.headers.entries()]));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Debug: Configuration success:', !!data.images);
    } else {
      const errorText = await response.text();
      console.error('❌ Debug: Configuration failed:', errorText);
    }
  } catch (error) {
    console.error('🚨 Debug: Configuration error:', error);
  }
  
  // Test 2: Simple search
  try {
    const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=avengers`;
    console.log('📡 Debug: Testing search endpoint:', searchUrl);
    
    const response = await fetch(searchUrl);
    console.log('📊 Debug: Search response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Debug: Search success:', data.total_results, 'results');
    } else {
      const errorText = await response.text();
      console.error('❌ Debug: Search failed:', errorText);
    }
  } catch (error) {
    console.error('🚨 Debug: Search error:', error);
  }
}

/**
 * Test network connectivity
 */
export async function debugNetworkConnectivity(): Promise<void> {
  console.log('🌐 Debug: Testing network connectivity...');
  
  try {
    // Test basic HTTP request
    const response = await fetch('https://httpbin.org/get');
    console.log('✅ Debug: Network connectivity OK:', response.status);
  } catch (error) {
    console.error('❌ Debug: Network connectivity failed:', error);
  }
}

/**
 * Comprehensive debug function
 */
export async function runFullDebug(): Promise<void> {
  console.log('🧪 Starting full TMDB API debug...');
  
  await debugNetworkConnectivity();
  await debugTMDBAPI();
  
  console.log('🏁 Debug complete');
}