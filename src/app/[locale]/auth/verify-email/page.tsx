/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

"use client";

import React, { useState, useEffect, useTransition } from "react";
import { verifyEmailToken, resendVerificationEmail } from "@/server/authorization/actions/auth";
import { isValidTokenFormat } from "@/server/authorization/utils/tokens";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ChangeLanguage } from "@/components/general/Language";
import { useTranslations } from "next-intl";
import {redirect, useSearchParams} from "next/navigation";
import { useActionHandler } from "@/server/NotificationPush";
import LoadingSpinner from "@/components/ui/loadingspinner";
import {authUIsettings} from "@/components/sections/auth/authUIsettings";

/**
 * PL: Typ określający aktualny scenariusz strony weryfikacji emaila
 * EN: Type defining current email verification page scenario
 */
type ScenarioType = 'token_success' | 'token_error' | 'sent' | 'email' | 'error' | 'validating-token';

/**
 * PL: Interfejs definiujący zawartość scenariusza weryfikacji emaila
 * EN: Interface defining email verification scenario content
 */
interface ScenarioContent {
    type: ScenarioType;
    icon: 'success' | 'error' | 'email' | 'warning' | 'loading';
    iconColor: string;
    title: string;
    description: string;
    content?: React.ReactNode;
}

/**
 * PL: Główny komponent strony weryfikacji emaila z obsługą różnych scenariuszy
 * EN: Main email verification page component with multiple scenario handling
 * @returns PL: JSX Element strony weryfikacji emaila | EN: JSX Element of email verification page
 */
export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const sent = searchParams.get("sent");

    const t = useTranslations("authorization");
    const [isPending, startTransition] = useTransition();
    const handleAction = useActionHandler();

    /**
     * PL: Stan dla sprawdzania ważności tokenu weryfikacji emaila
     * EN: State for email verification token validation
     */
    const [tokenValidation, setTokenValidation] = useState<{
        isValidating: boolean;
        isValid: boolean | null;
        error?: string;
    }>({ isValidating: false, isValid: null });

    /**
     * PL: Efekt sprawdzający token w bazie danych przy ładowaniu komponentu
     * EN: Effect checking token in database when component loads
     */
    useEffect(() => {
        if (token && isValidTokenFormat(token)) {
            setTokenValidation({ isValidating: true, isValid: null });

            verifyEmailToken(token).then((result) => {
                setTokenValidation({
                    isValidating: false,
                    isValid: result.success,
                });
            });
        }
    }, [token]);

    /**
     * PL: Funkcja określająca zawartość scenariusza na podstawie parametrów URL i stanu
     * EN: Function determining scenario content based on URL parameters and state
     * @returns PL: Obiekt zawartości scenariusza | EN: Scenario content object
     */
    const getScenarioContent = (): ScenarioContent => {
        /**
         * PL: Scenariusz 1 - Weryfikacja tokenu (użytkownik kliknął link z emaila)
         * EN: Scenario 1 - Token verification (user clicked link from email)
         */
        if (token) {
            /**
             * PL: Sprawdzenie formatu tokenu przed wywołaniem akcji serwera
             * EN: Token format validation before server action call
             */
            if (!isValidTokenFormat(token)) {
                return {
                    type: 'token_error',
                    icon: 'error',
                    iconColor: 'bg-red-100 text-red-600',
                    title: `${t("VerifyAccount.token.invalid.title")}`,
                    description: `${t("VerifyAccount.token.invalid.description")}`,
                    content: (
                        <div className="space-y-3 w-full">
                            <div className="bg-red-50 p-4 rounded-xl w-full">
                                <p className="text-sm text-red-700 text-center mb-2">
                                    {t("VerifyAccount.token.invalid.info.part1")}
                                </p>
                                <p className="text-xs text-red-600 font-semibold text-center">
                                    {t("VerifyAccount.token.invalid.info.part2")}
                                </p>
                            </div>
                        </div>
                    )
                };
            }

            /**
             * PL: Token ma prawidłowy format - sprawdzenie w bazie danych
             * EN: Token has valid format - database verification
             */
            if (tokenValidation.isValidating) {
                return {
                    type: 'validating-token',
                    icon: 'loading',
                    iconColor: 'bg-gray-100 text-gray-600',
                    title: `${t("VerifyAccount.token.validating.title")}`,
                    description: `${t("VerifyAccount.token.validating.description")}`,
                    content: null
                };
            }

            /**
             * PL: Token zweryfikowany - prawidłowy i aktywny
             * EN: Token verified - valid and active
             */
            if (tokenValidation.isValid === true) {
                return {
                    type: 'token_success',
                    icon: 'success',
                    iconColor: 'bg-green-100 text-green-600',
                    title: `${t("VerifyAccount.token.success.title")}`,
                    description: `${t("VerifyAccount.token.success.description")}`,
                    content: (
                        <Link href="/auth">
                            <Button className="w-full">
                                {t("VerifyAccount.token.success.button")}
                            </Button>
                        </Link>
                    )
                };
            }

            /**
             * PL: Token zweryfikowany - nieprawidłowy lub wygasły
             * EN: Token verified - invalid or expired
             */
            if (tokenValidation.isValid === false) {
                return {
                    type: 'token_error',
                    icon: 'error',
                    iconColor: 'bg-red-100 text-red-600',
                    title: `${t("VerifyAccount.token.expired.title")}`,
                    description: `${t("VerifyAccount.token.expired.description")}`,
                    content: (
                        <div className="space-y-3 w-full">
                            <div className="bg-red-50 p-4 rounded-xl w-full">
                                <p className="text-sm text-red-700 text-center ">
                                    {t("VerifyAccount.token.expired.info.part1")}
                                </p>
                            </div>
                        </div>
                    )
                };
            }

            /**
             * PL: Fallback - nadal sprawdzamy token
             * EN: Fallback - still validating token
             */
            return {
                type: 'validating-token',
                icon: 'loading',
                iconColor: 'bg-gray-100 text-gray-600',
                title: `${t("VerifyAccount.token.validating.title")}`,
                description: `${t("VerifyAccount.token.validating.description")}`,
                content: null
            };
        }

        /**
         * PL: Scenariusz 2 - Email został wysłany (sent=true po rejestracji/resend)
         * EN: Scenario 2 - Email sent (sent=true after registration/resend)
         */
        if (sent === 'true') {
            return {
                type: 'sent',
                icon: 'email',
                iconColor: 'bg-gradient-wavedeep text-white',
                title: `${t("VerifyAccount.sent.title")}`,
                description: `${t("VerifyAccount.sent.description")}`,
                content: (
                    <>
                        {/**
                         * PL: Instrukcje krok po kroku dla użytkownika
                         * EN: Step-by-step instructions for user
                         */}
                        <div className="bg-gray-100 p-4 rounded-xl mb-6 w-full max-w-sm">
                            <h3 className="font-semibold text-gray-900 mb-2 text-center">
                                {t("VerifyAccount.sent.info.question")}
                            </h3>
                            <ol className="text-sm text-gray-900 space-y-1">
                                <li>1. {t("VerifyAccount.sent.info.1")}</li>
                                <li>2. {t("VerifyAccount.sent.info.2")} <b>noreply@wavesave.io</b></li>
                                <li>3. {t("VerifyAccount.sent.info.3")}</li>
                                <li>4. {t("VerifyAccount.sent.info.4")}</li>
                            </ol>
                        </div>
                        {/**
                         * PL: Informacje dodatkowe i wskazówki
                         * EN: Additional information and tips
                         */}
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">
                                {t("VerifyAccount.sent.info.footer.part1")}
                            </p>
                            <p className="text-xs text-gray-500">
                                {t("VerifyAccount.sent.info.footer.part2")}
                            </p>
                        </div>
                    </>
                )
            };
        }

        /**
         * PL: Scenariusz 3 - Wymagana weryfikacja (użytkownik próbuje się zalogować z niezweryfikowanym kontem)
         * EN: Scenario 3 - Verification required (user trying to login with unverified account)
         */
        if (email) {
            /**
             * PL: Handler ponownego wysłania emaila weryfikacyjnego
             * EN: Handler for resending verification email
             * @param e - PL: Event formularza | EN: Form event
             */
            const handleResendEmail = (e: React.FormEvent) => {
                e.preventDefault();

                startTransition(async () => {
                    await handleAction(() => resendVerificationEmail(email));
                    /**
                     * PL: Funkcja sama przekieruje na /auth/verify-email?sent=true
                     * EN: Function will redirect to /auth/verify-email?sent=true
                     */
                });
            };

            return {
                type: 'email',
                icon: 'warning',
                iconColor: 'bg-yellow-100 text-yellow-600',
                title: `${t("VerifyAccount.token.required.title")}`,
                description: `${t("VerifyAccount.token.required.description")}`,
                content: (
                    <>
                        {/**
                         * PL: Wyświetlenie adresu email dla potwierdzenia
                         * EN: Display email address for confirmation
                         */}
                        <div className="bg-gray-100 p-4 rounded-xl w-full">
                            <p className="text-sm font-medium text-gray-900 text-center break-all">
                                {email}
                            </p>
                        </div>
                        <div className="space-y-4 mt-4 w-full">
                            <p className="text-sm text-gray-500 text-center">
                                {t("VerifyAccount.token.required.info.part1")}
                                <br />
                                {t("VerifyAccount.token.required.info.part2")}
                            </p>
                            {/**
                             * PL: Formularz ponownego wysłania emaila
                             * EN: Resend email form
                             */}
                            <form onSubmit={handleResendEmail}>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isPending}
                                >
                                    {isPending && <LoadingSpinner className="h-4 w-4" />}
                                    {isPending
                                        ? `${t("VerifyAccount.token.required.buttonSent")}`
                                        : `${t("VerifyAccount.token.required.button")}`
                                    }
                                </Button>
                            </form>
                        </div>
                    </>
                )
            };
        }

        /**
         * PL: Scenariusz 4 - Brak parametrów - przekierowanie do logowania
         * EN: Scenario 4 - No parameters - redirect to login
         */
        return redirect("/auth")
    };

    const scenario = getScenarioContent();

    /**
     * PL: Funkcja renderująca ikony SVG na podstawie typu
     * EN: Function rendering SVG icons based on type
     * @param icon - PL: Typ ikony do renderowania | EN: Icon type to render
     * @param colorClass - PL: Klasy CSS dla kolorów | EN: CSS classes for colors
     * @returns PL: Element SVG lub null | EN: SVG element or null
     */
    const renderIcon = (icon: ScenarioContent['icon'], colorClass: string) => {
        const iconClasses = `w-8 h-8 ${colorClass.split(' ')[1]}`;

        switch (icon) {
            case 'success':
                return (
                    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'email':
                return (
                    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'loading':
                return (
                    <svg className={`${iconClasses} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center justify-center h-screen m-0">
            <div
                className="relative flex flex-col w-full h-[53rem] xl:w-[80%] lg:h-[38rem] rounded-[50px] bg-white shadow-sm max-w-[700px] lg:max-w-[1000px]">

                {/**
                 * PL: Główna zawartość - dynamiczna na podstawie scenariusza
                 * EN: Main content - dynamic based on scenario
                 */}
                <div
                    className="w-full rounded-[50px] lg:w-1/2 mt-40 lg:mt-0 p-6 flex flex-col justify-center items-center absolute left-0 top-0 h-full">
                    <div
                        className={`w-16 h-16 mx-auto mb-4 ${scenario.iconColor} rounded-full flex items-center justify-center`}>
                        {renderIcon(scenario.icon, scenario.iconColor)}
                    </div>

                    <h2 className="text-[1.35rem] font-bold mb-3 text-center">
                        {scenario.title}
                    </h2>

                    <p className="text-gray-600 mb-4 text-center">
                        {scenario.description}
                    </p>

                    {scenario.content}
                </div>

                {/**
                 * PL: Dynamiczna nakładka - różna zawartość na podstawie scenariusza
                 * EN: Dynamic overlay - different content based on scenario
                 */}
                <div className={
                        `absolute w-full h-[40%] lg:left-1/2 lg:w-1/2 lg:h-full rounded-[45px] p-12 ${authUIsettings.backgroundGradientDirection} ${authUIsettings.backgroundGradientFrom} ${authUIsettings.backgroundGradientTo} ` +
                        'text-white flex flex-col justify-center items-center ' +
                        'transition-transform duration-700 ease-in-out ' +
                        'overflow-hidden'}>
                    <div className="absolute top-10 right-10 z-10">
                        <ChangeLanguage/>
                    </div>

                    <h2 className="text-xl text-center lg:text-[1.35rem] font-bold mb-1">
                        {t('ForgotPasswordOverlayContent.hereByMistake')}
                    </h2>

                    <p className="text-center text-base mb-3">
                        {t('ForgotPasswordOverlayContent.description')}
                    </p>

                    <div className="space-y-2">
                        <Link href="/auth">
                            <Button variant="white">
                                {t('ForgotPasswordOverlayContent.backToLoginButton')}
                            </Button>
                        </Link>
                    </div>
                    {/**
                     * PL: Dodatkowy link kontaktowy dla scenariusza email
                     * EN: Additional contact link for email scenario
                     */}
                    {scenario.type === 'email' && (
                        <p className="text-sm text-center text-white/70 mt-4">
                            {t("VerifyAccount.haveProblem.part1")} <Link href="/contact"
                                                                         className="text-white hover:underline"> {t("VerifyAccount.haveProblem.part2")}</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}