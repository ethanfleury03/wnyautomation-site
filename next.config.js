/** @type {import('next').NextConfig} */
const isStaging = process.env.APP_ENV === "staging";

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    const stagingHeaders = isStaging
      ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      : [];

    return [
      {
        source: "/:path*",
        headers: [
          ...stagingHeaders,
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; connect-src 'self'",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
