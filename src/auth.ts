/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import LinkedIn from "next-auth/providers/linkedin"
import GitHub from "next-auth/providers/github"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import { loginSchema } from "@/server/authorization/schemas/schemas";
import { devError } from "@/server/helpers/logger";
import { prisma } from "@/server/authorization/database/connection"
import { verifyPassword } from "@/server/authorization/utils/hashing";
import type { Prisma } from '@prisma/client'
import { Role } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
        updateAge: 60 * 60,
    },

    jwt: {
        maxAge: 24 * 60 * 60,
    },

    trustHost: true,

    providers: [
        Google,
        Facebook,
        LinkedIn,
        GitHub,
        Apple,

        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                verified2FA: { label: "2FA Verified", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const validatedData = loginSchema.parse({
                        email: credentials.email,
                        password: credentials.password,
                    })

                    const user = await prisma.user.findUnique({
                        where: { email: validatedData.email }
                    })

                    if (!user) return null

                    if (!user.providers.includes("credentials")) return null

                    if (!user.emailVerified) return null

                    if (credentials.verified2FA === "true" && credentials.password === "2FA_VERIFIED") {
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            role: user.role,
                            emailVerified: user.emailVerified,
                        }
                    }

                    if (!user.password || !verifyPassword(credentials.password as string, user.password)) {
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                        emailVerified: user.emailVerified,
                    }

                } catch (error) {
                    devError('Credentials authorize error:', error)
                    return null
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.emailVerified = user.emailVerified
            }

            if (account?.provider && account.provider !== "credentials" && token.email) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: token.email }
                    })

                    if (existingUser) {
                        let providers = existingUser.providers
                        if (!providers.includes(account.provider)) {
                            providers = [...providers, account.provider]
                        }

                        const updateData: Prisma.UserUpdateInput = {
                            providers: providers
                        }

                        if ((!existingUser.image || existingUser.image === "none") && token.picture) {
                            updateData.image = token.picture
                        }
                        if (!existingUser.name && token.name) {
                            updateData.name = token.name
                        }
                        if (!existingUser.emailVerified) {
                            updateData.emailVerified = new Date()
                        }

                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: updateData
                        })

                        token.id = existingUser.id
                        token.emailVerified = existingUser.emailVerified
                        token.role = existingUser.role.toLowerCase()
                    } else {
                        const newUser = await prisma.user.create({
                            data: {
                                email: token.email,
                                name: token.name,
                                image: token.picture,
                                providers: [account.provider],
                                role: Role.USER,
                                emailVerified: new Date(),
                            }
                        })

                        token.id = newUser.id
                        token.emailVerified = newUser.emailVerified
                        token.role = newUser.role.toLowerCase()
                    }
                } catch (error) {
                    devError(`JWT callback error for ${account.provider}:`, error)
                }
            }

            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = (token.id as string) || (token.sub as string)
                session.user.role = (token.role as string) || Role.USER
                session.user.emailVerified = token.emailVerified as Date || null
            }
            return session
        },

        async signIn({ user, account }) {
            if (account?.provider === "credentials") {
                return true
            }

            if (account?.provider && user.email) {
                return true
            }

            return true
        },
    },

    pages: {
        signIn: "/auth",
    },
})