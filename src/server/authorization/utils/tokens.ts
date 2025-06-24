/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import crypto from 'crypto'
import { prisma } from "@/server/authorization/database/connection";
import { TokenType } from '@prisma/client'

interface TokenConfig {
    type: TokenType
    maxAgeMinutes: number
    isNumeric?: boolean
}

const TOKEN_CONFIGS: Record<TokenType, TokenConfig> = {
    RESET: {
        type: 'RESET',
        maxAgeMinutes: 60, // 1 godzina / 1 hour
    },
    VERIFICATION: {
        type: 'VERIFICATION',
        maxAgeMinutes: 24 * 60, // 24 godziny / 24 hours
    },
    TWO_FA: {
        type: 'TWO_FA',
        maxAgeMinutes: 10, // 10 minut / 10 minutes
        isNumeric: true // 6-cyfrowy kod numeryczny / 6 numeric code
    }
}

export async function generateToken(
    type: TokenType,
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    email: string
): Promise<string> {
    const config = TOKEN_CONFIGS[type]

    let tokenValue: string

    if (config.isNumeric) {
        tokenValue = Math.floor(100000 + Math.random() * 900000).toString()
    } else {
        tokenValue = crypto.randomBytes(32).toString('hex')
    }

    const expiresAt = generateTokenExpiry(type)

    await Promise.all([
        prisma.token.deleteMany({
            where: {
                userId: userId,
                type: type
            }
        }),
        prisma.token.create({
            data: {
                type: type,
                token: tokenValue,
                expiresAt,
                userId: userId
            }
        })
    ])

    return tokenValue
}


export function isValidTokenFormat(token: string, type?: TokenType): boolean {
    if (type) {
        const config = TOKEN_CONFIGS[type]
        if (config.isNumeric) {
            return token.length === 6 && /^\d{6}$/.test(token)
        }
    }

    return token.length === 64 && /^[a-f0-9]+$/.test(token);
}

export async function verifyTokenInDatabase(
    token: string,
    type: TokenType
): Promise<{ valid: boolean; user?: any; error?: string }> {
    try {
        if (!isValidTokenFormat(token, type)) {
            return { valid: false, error: "Nieprawidłowy format tokenu" }
        }

        const tokenRecord = await prisma.token.findFirst({
            where: {
                token,
                type: type,
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        providers: true,
                        emailVerified: true,
                        twoFactorEnabled: true
                    }
                }
            }
        })

        if (!tokenRecord) {
            return { valid: false, error: "Token nie istnieje lub wygasł" }
        }

        return { valid: true, user: tokenRecord.user }

    } catch (error) {
        console.error("❌ Token database verification error:", error)
        return { valid: false, error: "Błąd weryfikacji tokenu" }
    }
}

export function generateTokenExpiry(type: TokenType): Date {
    const config = TOKEN_CONFIGS[type]
    return new Date(Date.now() + config.maxAgeMinutes * 60 * 1000)
}

export { TokenType } from '@prisma/client'

export async function deleteToken(token: string): Promise<void> {
    try {
        await prisma.token.delete({
            where: { token }
        })
    } catch (error) {
        console.error("❌ Token deletion error:", error)
    }
}
