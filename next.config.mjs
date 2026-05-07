/** @type {import('next').NextConfig} */

const ALLOWED_ORIGINS = [
  'https://finexa-one.vercel.app',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

const securityHeaders = [
  { key: 'X-Frame-Options',             value: 'DENY' },
  { key: 'X-Content-Type-Options',      value: 'nosniff' },
  { key: 'Strict-Transport-Security',   value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Referrer-Policy',             value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',          value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy',  value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy',value: 'same-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `connect-src 'self' ${ALLOWED_ORIGINS.join(' ')} https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.anthropic.com`,
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images:     { unoptimized: true },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: ALLOWED_ORIGINS[0] ?? 'https://finexa-one.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-admin-secret' },
          { key: 'Access-Control-Max-Age',       value: '86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
