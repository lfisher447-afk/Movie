/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns:[
            { protocol: 'https', hostname: 'image.tmdb.org' },
            { protocol: 'https', hostname: 'ui-avatars.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },
    async headers() {
        return[
            {
                source: '/(.*)',
                headers:[
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                ]
            }
        ];
    }
};

export default nextConfig;
