/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-prisma-nextintl-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import createNextIntlPlugin from 'next-intl/plugin';
import { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    /**
     * PL: Musisz tutaj dodać logikę pobierania zdjęć profilowych z OAuth provider - aktualnie jest tylko Google
     * EN: You have to add logic to handle user profile image from OAuth provider - actually it is only configured for Google
     */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
        ],
    },
};

export default withNextIntl(nextConfig);
