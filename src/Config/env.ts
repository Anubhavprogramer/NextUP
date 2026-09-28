// Backend config. Kept in source because the repo is private and the key only
// gates the reel-resolve endpoint (see NextUPBakend/doc/API.md).
export const NEXTUP_API = {
  BASE_URL: 'https://nextup-backend-lime.vercel.app',
  API_KEY: '46f31e8b331f46a94245801ed8f8b8ba064527cea34956a4',
  RESOLVE_TIMEOUT_MS: 45000,
} as const;
