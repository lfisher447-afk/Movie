const nextConfig = {
    images: {
        remotePatterns:[
            { protocol: 'https', hostname: 'image.tmdb.org' },
            { protocol: 'https', hostname: 'ui-avatars.com' }
        ],
    },
    async headers() {
        return[
            {
                source: '/(.*)',
                headers:[
                    {
                        key: 'Content-Security-Policy',
                        // Blocks malicious scripts & framing. Allows HLS stream media.
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://image.tmdb.org https://ui-avatars.com; media-src 'self' blob: https://*; connect-src 'self' https://api.themoviedb.org https://*;"
                    },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
