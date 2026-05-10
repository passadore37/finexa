/** @type {import('next').NextConfig} */

const ALLOWED_ORIGINS = [
  'https://finexa-one.vercel.app',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

// FIX #7 — CSP sem unsafe-inline: o nonce é gerado no middleware e injetado aqui
// O valor 'nonce-NONCE_PLACEHOLDER' é substituído em runtime pelo middleware
const buildCsp = (nonce) => [
  "default-src 'self'",
  // FIX #7 — strict-dynamic + nonce substitui unsafe-inline
  // 'unsafe-inline' mantido como fallback para browsers antigos que não suportam nonce
  // Na prática browsers modernos ignoram unsafe-inline quando nonce está presente
  `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `connect-src 'self' ${ALLOWED_ORIGINS.join(' ')} https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.openai.com`,
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const staticHeaders = [
  { key: 'X-Frame-Options',              value: 'DENY' },
  { key: 'X-Content-Type-Options',       value: 'nosniff' },
  { key: 'Strict-Transport-Security',    value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Referrer-Policy',              value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',           value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images:     { unoptimized: true },
  async headers() {
    return [
      {
        source: '/(.*)',
        // Apenas headers estáticos aqui — CSP com nonce é injetado pelo middleware
        headers: staticHeaders,
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
