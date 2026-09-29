import { resolveReel, ReelError } from '../reels';

const mockFetch = (status: number, body: unknown) => {
  (globalThis as any).fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
};

describe('resolveReel', () => {
  it('maps candidates to plain MediaItems', async () => {
    mockFetch(200, {
      success: true,
      data: {
        reelId: 'C9abc123',
        canonicalUrl: 'https://www.instagram.com/reel/C9abc123/',
        caption: '“Inception”',
        author: 'filmbuff',
        thumbnail: '',
        candidates: [
          {
            media: {
              id: 27205, title: 'Inception', overview: 'Dreams', posterPath: '/p.jpg', backdropPath: null,
              releaseDate: '2010-07-15', voteAverage: 8.4, genreIds: [28], mediaType: 'movie',
              originalLanguage: 'en', originalTitle: 'Inception', popularity: 57,
            },
            confidence: 0.97,
            matchedOn: 'quoted',
            query: 'Inception',
          },
        ],
      },
    });

    const result = await resolveReel('https://www.instagram.com/reel/C9abc123/');
    expect(result.candidates[0].media).toEqual({
      id: 27205, title: 'Inception', overview: 'Dreams', posterPath: '/p.jpg', backdropPath: null,
      releaseDate: '2010-07-15', voteAverage: 8.4, genreIds: [28], mediaType: 'movie', originalLanguage: 'en',
    });
    const [, init] = (globalThis as any).fetch.mock.calls[0];
    expect(init.headers['x-api-key']).toBeTruthy();
  });

  it('surfaces backend error codes and keywords', async () => {
    mockFetch(422, { success: false, code: 'NO_MATCH', message: 'none', keywords: ['Some Film'] });
    await expect(resolveReel('x')).rejects.toMatchObject({ code: 'NO_MATCH', keywords: ['Some Film'] });
  });

  it('treats unknown failures as UNKNOWN and 504s as TIMEOUT', async () => {
    mockFetch(500, { success: false, code: 'MISCONFIGURED' });
    await expect(resolveReel('x')).rejects.toMatchObject({ code: 'UNKNOWN' });
    mockFetch(504, null);
    await expect(resolveReel('x')).rejects.toMatchObject({ code: 'TIMEOUT' });
  });

  it('reports network failures', async () => {
    (globalThis as any).fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const error = await resolveReel('x').catch(e => e);
    expect(error).toBeInstanceOf(ReelError);
    expect(error.code).toBe('NETWORK_ERROR');
  });
});
