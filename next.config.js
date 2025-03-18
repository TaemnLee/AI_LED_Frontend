/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // This sets the output directory for the export
  // distDir: 'out', // Optional: if you want to customize the output directory
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig;
