import { findInstagramReelUrl, parseImportLink } from '../reelLinks';

describe('findInstagramReelUrl', () => {
  it.each([
    ['https://www.instagram.com/reel/C9abc123/?igsh=MWx', 'C9abc123'],
    ['Watch this 🔥 https://instagram.com/reels/C9abc_1-2', 'C9abc_1-2'],
    ['https://www.instagram.com/p/C9abc123/', 'C9abc123'],
  ])('normalises %s', (text, id) => {
    expect(findInstagramReelUrl(text)).toBe(`https://www.instagram.com/reel/${id}/`);
  });

  it('returns null without an Instagram media link', () => {
    expect(findInstagramReelUrl('https://www.instagram.com/filmbuff/')).toBeNull();
    expect(findInstagramReelUrl('')).toBeNull();
    expect(findInstagramReelUrl(null)).toBeNull();
  });
});

describe('parseImportLink', () => {
  it('decodes the shared text', () => {
    const shared = 'Look! https://www.instagram.com/reel/C9abc123/?igsh=a&b=1';
    expect(parseImportLink(`nextup://import?url=${encodeURIComponent(shared)}`)).toBe(shared);
  });

  it('ignores other links and malformed input', () => {
    expect(parseImportLink('nextup://media/1')).toBeNull();
    expect(parseImportLink('https://example.com/?url=x')).toBeNull();
    expect(parseImportLink('nextup://import?url=%E0%A4%A')).toBeNull();
    expect(parseImportLink('nextup://import')).toBeNull();
    expect(parseImportLink(null)).toBeNull();
  });
});
