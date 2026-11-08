// Copy this file to `config.js` (same folder) and fill in your Supabase values.
// Supabase → Project Settings → API:
//   * Project URL           → SUPABASE_URL
//   * anon / publishable key → SUPABASE_ANON_KEY
//
// The anon key is designed to live in the browser; your data is protected by
// login + Row Level Security. NEVER put the `service_role` / secret key here.
// `config.js` is git-ignored so it is not committed to the repository.
window.APP_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co', // only up to .supabase.co — no /rest/v1/ at the end
  SUPABASE_ANON_KEY: 'YOUR-ANON-KEY',
};
