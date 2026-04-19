/** @type {import('next').NextConfig} */

const ALLOWED_ORIGINS = [
  'https://finexa-one.vercel.app',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

const securityHeaders = [
  // Evita clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Evita MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Força HTTPS por 1 ano
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Restringe referrer
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Permissões de browser APIs
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      `connect-src 'self' ${ALLOWED_ORIGINS.join(' ')} https://*.supabase.co wss://*.supabase.co https://api.resend.com`,
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Aplicar em todas as rotas
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // CORS restritivo nas APIs
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: ALLOWED_ORIGINS[0] ?? 'https://finexa-one.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-admin-secret' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
