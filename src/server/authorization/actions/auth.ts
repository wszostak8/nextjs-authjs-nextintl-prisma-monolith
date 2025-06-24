/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

"use server"

import { prisma } from "@/server/authorization/database/connection"
import { signIn, signOut } from "@/auth"
import { z } from "zod"
import { redirect } from "next/navigation"
import { ActionResult } from "@/server/NotificationPush"
import { getLocale, getTranslations } from "next-intl/server"
import {
    generateToken,
    verifyTokenInDatabase,
    deleteToken,
    TokenType
} from "@/server/authorization/utils/tokens"
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    send2FAEmail
} from "@/server/authorization/utils/email"
import { devError } from "@/server/helpers/logger";
import { createLocalizedSuccessUrl, createSuccessUrl } from "@/server/helpers/notifications-helper";
import {
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    newPasswordSchema
} from "@/server/authorization/schemas/schemas";
import { hashPassword, verifyPassword } from "@/server/authorization/utils/hashing";


/**
 * PL: Funkcja wylogowania użytkownika
 * EN: User logout function
 * @returns PL: Wynik akcji z komunikatem | EN: Action result with message
 */
export async function logoutAction() {
    const locale = await getLocale();

    // Utwórz URL z powiadomieniem uwzględniając locale
    const redirectUrl = createLocalizedSuccessUrl("/auth", "logout_success", locale);

    await signOut({ redirectTo: redirectUrl })
}

/**
 * PL: Typ providerów OAuth
 * EN: OAuth providers type
 */
type OAuthProvider = "google" | "github" | "facebook" | "apple" | "linkedin";

/**
 * PL: Uniwersalna funkcja do logowania przez dostawców OAuth
 * EN: Universal function for OAuth provider login
 * @param provider - PL: Dostawca OAuth (google, github, facebook, apple, linkedin) | EN: OAuth provider (google, github, facebook, apple, linkedin)
 */
export async function signInByProvider(provider: OAuthProvider): Promise<void> {
    const locale = await getLocale();

    const redirectUrl = createLocalizedSuccessUrl(
        "/dashboard",
        'oauth_login_success',
        locale,
        { provider }
    );
    await signIn(provider, { redirectTo: redirectUrl });
}

/**
 * PL: Funkcja rejestracji nowego użytkownika
 * EN: New user registration function
 * @param formData - PL: Dane formularza rejestracji | EN: Registration form data
 * @returns PL: Wynik akcji z komunikatem lub błędem | EN: Action result with message or error
 */
export async function registerUser(formData: FormData): Promise<ActionResult> {
    const t = await getTranslations('notifications.auth.messages')

    try {
        const rawData = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        }

        const validatedData = registerSchema.parse(rawData)

        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        })

        if (existingUser) {
            const providersList = existingUser.providers.join(", ")

            if (existingUser.providers.includes("credentials")) {
                return {
                    success: false,
                    error: t('account_exists_credentials')
                }
            } else {
                return {
                    success: false,
                    error: t('account_exists_oauth', { providers: providersList })
                }
            }
        }

        const hashedPassword = hashPassword(validatedData.password)

        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
                providers: ["credentials"],
                role: "USER",
                emailVerified: null,
            }
        })

        const verificationToken = await generateToken(
            TokenType.VERIFICATION,
            user.id,
            validatedData.email
        )

        /**
         * PL: Wysłanie emaila weryfikacyjnego
         * EN: Send verification email
         */
        const emailSent = await sendVerificationEmail(
            validatedData.email,
            verificationToken,
            validatedData.name
        )

        if (!emailSent) {
            await prisma.user.delete({
                where: { id: user.id }
            })
            return {
                success: false,
                error: t('email_send_failed')
            }
        }

        /**
         * PL: Przekierowanie na stronę z informacją o wysłaniu emaila
         * EN: Redirect to page with email sent information
         */
        redirect(`/auth/verify-email?sent=true`)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }

        /**
         * PL: Przepuść błędy przekierowania
         * EN: Pass through redirect errors
         */
        if (error && typeof error === 'object' && 'digest' in error) {
            throw error
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : t('registration_failed')
        }
    }
}

/**
 * ⚡ ZOPTYMALIZOWANA funkcja logowania użytkownika
 * EN: OPTIMIZED User login function
 * @param formData - PL: Dane formularza logowania | EN: Login form data
 * @returns PL: Wynik akcji z komunikatem lub błędem | EN: Action result with message or error
 */
export async function loginUser(formData: FormData): Promise<ActionResult> {
    const t = await getTranslations('notifications.auth.messages')

    const rawData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    let validatedData
    try {
        validatedData = loginSchema.parse(rawData)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        return { success: false, error: t('invalid_data') }
    }

    try {
        // ⚡ OPTYMALIZACJA: Pobierz tylko potrzebne pola
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                providers: true,
                emailVerified: true,
                twoFactorEnabled: true
            }
        })

        if (!user) {
            return { success: false, error: t('invalid_email_password') }
        }

        if (!user.providers.includes("credentials")) {
            const providersList = user.providers.join(", ")
            return {
                success: false,
                error: t('account_registered_via', { providers: providersList })
            }
        }

        if (!user.emailVerified) {
            redirect(`/auth/verify-email?email=${encodeURIComponent(validatedData.email)}`)
        }

        if (!user.password) {
            return { success: false, error: t('invalid_email_password') }
        }

        const isPasswordValid = verifyPassword(validatedData.password, user.password)
        if (!isPasswordValid) {
            return { success: false, error: t('invalid_email_password') }
        }

        if (user.twoFactorEnabled) {
            const twoFactorCode = await generateToken(TokenType.TWO_FA, user.id, validatedData.email)

            await send2FAEmail(validatedData.email, twoFactorCode, user.name ?? undefined)

            redirect(`/auth/verify-2fa?email=${encodeURIComponent(validatedData.email)}`)
        }

        const redirectUrl = createSuccessUrl("/dashboard", "login_successful")

        await signIn("credentials", {
            email: validatedData.email,
            password: validatedData.password,
            redirect: true,
            redirectTo: redirectUrl
        })

        return { success: true }

    } catch (error) {
        if (error && typeof error === 'object' && 'digest' in error) {
            throw error
        }

        devError("❌ Login error:", error)
        return { success: false, error: t('login_failed') }
    }
}

/**
 * PL: Weryfikacja tokenu emaila
 * EN: Email token verification
 * @param token - PL: Token weryfikacyjny | EN: Verification token
 * @returns PL: Wynik akcji z komunikatem | EN: Action result with message
 */
export async function verifyEmailToken(token: string): Promise<ActionResult> {
    const t = await getTranslations('notifications.auth.messages')

    try {
        const result = await verifyTokenInDatabase(token, TokenType.VERIFICATION)

        if (!result.valid) {
            return { success: false, error: t('invalid_expired_token') }
        }

        const user = result.user

        // ⚡ Równoległe wykonanie
        await Promise.all([
            // Zaktualizuj użytkownika
            prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: new Date(),
                }
            }),
            // Usuń token
            deleteToken(token)
        ])

        return { success: true, message: t('email_verified_success') }

    } catch (error) {
        devError("❌ Email verification error:", error)
        return { success: false, error: t('verification_failed') }
    }
}

/**
 * PL: Ponowne wysłanie emaila weryfikacyjnego
 * EN: Resend verification email
 * @param email - PL: Adres email użytkownika | EN: User email address
 * @returns PL: Wynik akcji z komunikatem | EN: Action result with message
 */
export async function resendVerificationEmail(email: string): Promise<ActionResult> {
    const t = await getTranslations('notifications.auth.messages')

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                emailVerified: true,
                providers: true
            }
        })

        if (!user) {
            return { success: false, error: t('user_not_found') }
        }

        if (user.emailVerified) {
            return { success: false, error: t('email_already_verified') }
        }

        if (!user.providers.includes("credentials")) {
            return { success: false, error: t('account_no_verification_needed') }
        }

        const verificationToken = await generateToken(TokenType.VERIFICATION, user.id, email)

        /**
         * PL: Wysłanie emaila weryfikacyjnego
         * EN: Send verification email
         */
        const emailSent = await sendVerificationEmail(email, verificationToken, user.name ?? undefined)

        if (!emailSent) {
            return { success: false, error: t('verification_email_failed') }
        }

        /**
         * PL: Przekierowanie z informacją o wysłaniu
         * EN: Redirect with sent information
         */
        redirect(`/auth/verify-email?sent=true`)

    } catch (error) {
        /**
         * PL: Przepuść błędy przekierowania
         * EN: Pass through redirect errors
         */
        if (error && typeof error === 'object' && 'digest' in error) {
            throw error
        }

        devError("❌ Resend verification error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : t('verification_email_failed')
        }
    }
}

/**
 * PL: Żądanie resetowania hasła
 * EN: Password reset request
 * @param email - PL: Adres email użytkownika | EN: User email address
 * @returns PL: Wynik akcji z komunikatem | EN: Action result with message
 */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
    const t = await getTranslations('notifications.auth.messages')

    try {
        const validatedData = resetPasswordSchema.parse({ email })

        /**
         * PL: Znajdź tylko użytkowników z credentials provider
         * EN: Find only users with credentials provider
         */
        const user = await prisma.user.findFirst({
            where: {
                email: validatedData.email,
                providers: {
                    has: "credentials"
                }
            },
            select: {
                id: true,
                name: true
            }
        })

        if (!user) {
            redirect('/auth')
            // /**
            //  * PL: Ze względów bezpieczeństwa zawsze zwracaj sukces
            //  * EN: For security reasons always return success
            //  */
            // return {
            //     success: true,
            //     message: t('reset_email_success')
            // }
        }

        const resetToken = await generateToken(TokenType.RESET, user.id, validatedData.email)

        /**
         * PL: Wysłanie emaila z linkiem resetowania
         * EN: Send password reset email
         */
        const emailSent = await sendPasswordResetEmail(
            validatedData.email,
            resetToken,
            user.name ?? undefined
        )

        if (!emailSent) {
            await deleteToken(resetToken)

            return {
                success: false,
                error: t('reset_email_failed')
            }
        }

        /**
         * PL: Przekierowanie z informacją o wysłaniu
         * EN: Redirect with sent information
         */
        redirect(`/auth/reset?sent=true`)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }

        /**
         * PL: Przepuść błędy przekierowania
         * EN: Pass through redirect errors
         */
        if (error && typeof error === 'object' && 'digest' in error) {
            throw error
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : t('reset_link_failed')
        }
    }
}

/**
 * PL: Resetowanie hasła z tokenem
 * EN: Reset password with token
 * @param token - PL: Token resetowania | EN: Reset token
 * @param newPassword - PL: Nowe hasło | EN: New password
 * @returns PL: Wynik akcji z komunikatem | EN: Action result with message
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<ActionResult> {
    const t = await getTranslations('notifications.auth.messages')

    try {
        const validatedData = newPasswordSchema.parse({ token, password: newPassword })

        /**
         * PL: Znajdź użytkownika z ważnym tokenem
         * EN: Find user with valid token
         */
        const result = await verifyTokenInDatabase(validatedData.token, TokenType.RESET)

        if (!result.valid) {
            return {
                success: false,
                error: t('invalid_expired_reset')
            }
        }

        const user = result.user

        /**
         * PL: Sprawdź czy user ma credentials provider
         * EN: Check if user has credentials provider
         */
        if (!user.providers.includes("credentials")) {
            return {
                success: false,
                error: t('account_cannot_reset')
            }
        }

        /**
         * PL: Zahashuj nowe hasło
         * EN: Hash new password
         */
        const hashedPassword = hashPassword(validatedData.password)

        await Promise.all([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    emailVerified: user.emailVerified || new Date()
                }
            }),
            deleteToken(validatedData.token)
        ])

        return {
            success: true,
            message: t('password_reset_success')
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }

        devError("❌ Password reset error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : t('password_reset_failed')
        }
    }
}

/**
 * PL: Walidacja tokenu resetowania hasła
 * EN: Password reset token validation
 * @param token - PL: Token do sprawdzenia | EN: Token to validate
 * @returns PL: Wynik walidacji | EN: Validation result
 */
export async function validateResetToken(token: string): Promise<ActionResult> {
    const t = await getTranslations('notifications.auth.messages')

    try {
        const result = await verifyTokenInDatabase(token, TokenType.RESET)

        if (!result.valid) {
            return {
                success: false,
                error: result.error || t('invalid_expired_reset')
            }
        }

        if (!result.user.providers.includes("credentials")) {
            return {
                success: false,
                error: t('account_cannot_reset')
            }
        }

        return { success: true, message: t('token_valid') }

    } catch (error) {
        devError("❌ Token validation error:", error)
        return {
            success: false,
            error: t('token_validation_error')
        }
    }
}

/**
 * PL: Funkcja wysłania kodu 2FA
 * EN: Send 2FA code
 * @param email - PL: Adres email użytkownika | EN: User email address
 * @returns PL: Wynik akcji z komunikatem | EN: Action result with message
 */
export async function send2FACode(email: string): Promise<ActionResult> {
    const t = await getTranslations('notifications.auth.messages')

    try {
        const user = await prisma.user.findFirst({
            where: {
                email,
                providers: {
                    has: "credentials"
                }
            },
            select: {
                id: true,
                name: true,
                twoFactorEnabled: true
            }
        })

        if (!user) {
            return { success: false, error: t('user_not_found') }
        }

        if (!user.twoFactorEnabled) {
            return { success: false, error: t('twofa_not_enabled') }
        }

        const twoFactorCode = await generateToken(TokenType.TWO_FA, user.id, email);

        /**
         * PL: Wysłanie emaila z kodem 2FA
         * EN: Send 2FA code email
         */
        const emailSent = await send2FAEmail(email, twoFactorCode, user.name ?? undefined)

        if (!emailSent) {
            return { success: false, error: t('twofa_code_failed') }
        }

        return { success: true, message: t('twofa_code_sent') }

    } catch (error) {
        devError("❌ Send 2FA code error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : t('twofa_code_failed')
        }
    }
}

/**
 * PL: Weryfikacja kodu 2FA
 * EN: 2FA code verification
 * @param email - PL: Adres email użytkownika | EN: User email address
 * @param code - PL: Kod 2FA do weryfikacji | EN: 2FA code to verify
 * @returns PL: Wynik weryfikacji | EN: Verification result
 */
export async function verify2FACode(email: string, code: string): Promise<ActionResult> {
    const t = await getTranslations('notifications.auth.messages')

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                twoFactorEnabled: true
            }
        })

        if (!user) {
            return {
                success: false,
                error: t('user_not_found')
            }
        }

        if (!user.twoFactorEnabled) {
            return {
                success: false,
                error: t('twofa_not_enabled')
            }
        }

        /**
         * PL: Sprawdź czy kod istnieje i nie wygasł
         * EN: Check if code exists and hasn't expired
         */
        const result = await verifyTokenInDatabase(code, TokenType.TWO_FA)

        if (!result.valid) {
            return {
                success: false,
                error: t('twofa_code_invalid')
            }
        }

        if (result.user.id !== user.id) {
            return {
                success: false,
                error: t('twofa_code_invalid')
            }
        }

        /**
         * PL: Usuń kod 2FA po udanej weryfikacji
         * EN: Delete 2FA code after successful verification
         */
        await deleteToken(code)

        /**
         * PL: Zaloguj użytkownika używając specjalnego parametru 2FA
         * EN: Log in user using special 2FA parameter
         */
        const loginResult = await signIn("credentials", {
            email,
            password: "2FA_VERIFIED", /** PL: Specjalny token dla 2FA | EN: Special token for 2FA */
            verified2FA: "true", /** PL: Flaga dla auth.ts | EN: Flag for auth.ts */
            redirect: false,
        })

        if (loginResult?.error) {
            return {
                success: false,
                error: t('twofa_login_error')
            }
        }

        return {
            success: true,
            message: t('twofa_verified_success')
        }

    } catch (error) {
        devError("❌ Verify 2FA code error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : t('twofa_verification_failed')
        }
    }
}