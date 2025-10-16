/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es"
  }
};
export default nextConfig;
