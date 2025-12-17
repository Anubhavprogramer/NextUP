const API_KEY = 'bf5766befcb7d7ef1941f2b96f16ab2d';
const BASE_URL = 'https://api.themoviedb.org/3';
const AccessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZjU3NjZiZWZjYjdkN2VmMTk0MWYyYjk2ZjE2YWIyZCIsIm5iZiI6MTc2NTk1NDgzMy44MzAwMDAyLCJzdWIiOiI2OTQyNTUxMWI0MzhiMTdiMGI3YTJhODkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.5jEmQIMXICbnZxDVFULPAwyclG188VjVjfM35MkhCdY';

export async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('TMDB request failed');
  }

  return res.json();
}
