/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import React, { useState } from "react";
import { FaApple, FaFacebook, FaGithub, FaGoogle, FaLinkedinIn } from "react-icons/fa6";
import { signInByProvider } from "@/server/authorization/actions/auth";
import {devError} from "@/server/helpers/logger";
import LoadingSpinner from "@/components/ui/loadingspinner";

type OAuthProvider = 'google' | 'facebook' | 'github' | 'linkedin' | 'apple';

interface LoginByProviderProps {
    provider: OAuthProvider;
}

/**
 * PL: Konfiguracja providerów OAuth z ikonami i nazwami
 * EN: OAuth providers configuration with icons and names
 */
const providerConfig = {
    google: {
        name: 'Google',
        icon: <FaGoogle className="text-lg" />
    },
    facebook: {
        name: 'Facebook',
        icon: <FaFacebook className="text-lg" />
    },
    github: {
        name: 'GitHub',
        icon: <FaGithub className="text-lg" />
    },
    linkedin: {
        name: 'LinkedIn',
        icon: <FaLinkedinIn className="text-lg" />
    },
    apple: {
        name: 'Apple',
        icon: <FaApple className="text-lg" />
    }
};

/**
 * PL: Komponent przycisku logowania przez określonego providera OAuth
 * EN: OAuth provider login button component
 * @param provider - PL: Provider OAuth do użycia | EN: OAuth provider to use
 * @param redirectTo - PL: Opcjonalny URL przekierowania | EN: Optional redirect URL
 * @returns PL: JSX Element przycisku providera lub null | EN: JSX Element of provider button or null
 */
export default function LoginByProvider({ provider }: LoginByProviderProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleProviderSignIn = async () => {
        if (isLoading) return;

        setIsLoading(true);
        await signInByProvider(provider);
    };

    /**
     * PL: Pobranie konfiguracji dla wybranego providera
     * EN: Get configuration for selected provider
     */
    const config = providerConfig[provider];

    if (!config) {
        devError(`Unsupported provider: ${provider}`);
        return null;
    }

    return (
        <button
            type="button"
            onClick={handleProviderSignIn}
            disabled={isLoading}
            className={`
                p-3 border-[#191919] border-[1px] flex items-center justify-center rounded-lg 
                hover:cursor-pointer hover:bg-gray-100 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isLoading ? 'animate-pulse' : ''}
            `}
        >
            {isLoading ? (
                <LoadingSpinner className="h-4 w-4" />
            ) : (
                config.icon
            )}
        </button>
    );
}