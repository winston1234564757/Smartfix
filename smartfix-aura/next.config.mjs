/** @type {import('next').NextConfig} */
const nextConfig = {
  // Дозволяємо картинки з UploadThing (на майбутнє, якщо захочеш використовувати next/image)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;