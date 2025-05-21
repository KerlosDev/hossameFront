/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'i.imgur.com',
            'imgur.com',
            'res.cloudinary.com',
            'images.unsplash.com',
            'lh3.googleusercontent.com',
            'avatars.githubusercontent.com'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    }, 
};

export default nextConfig;
