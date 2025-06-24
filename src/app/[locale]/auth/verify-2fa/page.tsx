/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChangeLanguage } from "@/components/general/Language";
import { Link } from "@/i18n/navigation";
import { redirect, useSearchParams } from "next/navigation";
import { verify2FACode, send2FACode } from "@/server/authorization/actions/auth";
import {isValidTokenFormat, TokenType} from "@/server/authorization/utils/tokens";
import { useActionHandler } from "@/server/NotificationPush";
import { useTransition } from "react";
import {useTranslations} from "next-intl";
import LoadingSpinner from "@/components/ui/loadingspinner";
import {authUIsettings} from "@/components/sections/auth/authUIsettings";
/**
 * PL: Komponent strony weryfikacji dwuskładnikowego uwierzytelniania (2FA)
 * EN: Two-factor authentication (2FA) verification page component
 * @returns PL: JSX Element strony weryfikacji 2FA | EN: JSX Element of 2FA verification page
 */
export default function Verify2FAPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [isPending, startTransition] = useTransition();
    const handleAction = useActionHandler();

    /**
     * PL: Stan przechowujący wprowadzony kod 2FA
     * EN: State storing entered 2FA code
     */
    const [code, setCode] = useState("");

    /**
     * PL: Stan licznika odliczania do ponownego wysłania kodu
     * EN: State for countdown timer until code can be resent
     */
    const [countdown, setCountdown] = useState(60);

    const t = useTranslations("authorization");

    /**
     * PL: Efekt obsługujący odliczanie czasu do ponownego wysłania kodu
     * EN: Effect handling countdown timer for code resend
     */
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    /**
     * PL: Przekieruj do strony logowania jeśli brak emaila w parametrach
     * EN: Redirect to login page if email is missing from parameters
     */
    if (!email) {
        redirect("/auth");
    }

    /**
     * PL: Handler submitowania formularza weryfikacji kodu 2FA
     * EN: Handler for 2FA code verification form submission
     * @param e - PL: Event formularza | EN: Form event
     */
    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        /**
         * PL: Walidacja formatu kodu 2FA (6 cyfr)
         * EN: 2FA code format validation (6 digits)
         */
        if (!isValidTokenFormat(code, TokenType.TWO_FA)) {
            handleAction(async () => ({ success: false, error: "Kod musi składać się z 6 cyfr" }));
            return;
        }

        startTransition(async () => {
            const result = await handleAction(() => verify2FACode(email, code));
            if (result.success) {
                /**
                 * PL: Przekieruj do dashboardu po udanej weryfikacji
                 * EN: Redirect to dashboard after successful verification
                 */
                window.location.href = "/dashboard";
            }
        });
    };

    /**
     * PL: Handler ponownego wysłania kodu 2FA
     * EN: Handler for resending 2FA code
     */
    const handleResendCode = () => {
        /**
         * PL: Sprawdź czy można już ponownie wysłać kod (countdown = 0)
         * EN: Check if code can be resent (countdown = 0)
         */
        if (countdown > 0) return;

        startTransition(async () => {
            const result = await handleAction(() => send2FACode(email));
            if (result.success) {
                /**
                 * PL: Zresetuj licznik odliczania po udanym wysłaniu
                 * EN: Reset countdown timer after successful send
                 */
                setCountdown(60);
            }
        });
    };

    return (
        <div className="flex items-center justify-center h-screen m-0">
            <div className="relative flex flex-col w-full h-[53rem] xl:w-[80%] lg:h-[38rem] rounded-[50px] bg-white shadow-sm max-w-[700px] lg:max-w-[1000px]">

                {/**
                 * PL: Główna zawartość formularza weryfikacji 2FA
                 * EN: Main 2FA verification form content
                 */}
                <div className="w-full rounded-[50px] lg:w-1/2 mt-40 lg:mt-0 p-6 flex flex-col justify-center items-center absolute left-0 top-0 h-full">
                    <h2 className="text-[1.35rem] font-bold mb-3 text-center">
                        {t('2FA.title')}
                    </h2>

                    <div className="space-y-6 w-full px-4">
                        {/**
                         * PL: Wyświetlenie adresu email dla potwierdzenia
                         * EN: Display email address for confirmation
                         */}
                        <div className="bg-gray-100 p-4 rounded-xl w-full">
                            <p className="text-sm font-medium text-gray-900 text-center break-all">
                                {email}
                            </p>
                        </div>

                        {/**
                         * PL: Formularz wprowadzania kodu 2FA
                         * EN: 2FA code input form
                         */}
                        <form onSubmit={handleCodeSubmit} className="space-y-4">
                            <div>
                                <label>
                                    <p className="text-sm text-gray-500 mb-2">
                                        {t('2FA.form.label')}
                                    </p>
                                </label>
                                {/**
                                 * PL: Input kodu z automatycznym formatowaniem (tylko cyfry, max 6 znaków)
                                 * EN: Code input with automatic formatting (digits only, max 6 chars)
                                 */}
                                <Input
                                    variant="default"
                                    type="text"
                                    value={code}
                                    onChange={(e) => {
                                        /**
                                         * PL: Filtruj tylko cyfry i ogranicz do 6 znaków
                                         * EN: Filter only digits and limit to 6 characters
                                         */
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setCode(value);
                                    }}
                                    placeholder="000000"
                                    required
                                    maxLength={6}
                                    disabled={isPending}
                                    className="text-center text-2xl tracking-widest font-mono"
                                    autoComplete="one-time-code"
                                />
                            </div>

                            {/**
                             * PL: Przycisk weryfikacji - aktywny tylko gdy kod ma 6 cyfr
                             * EN: Verification button - active only when code has 6 digits
                             */}
                            <Button
                                type="submit"
                                variant="default"
                                className="w-full"
                                disabled={isPending || code.length !== 6}
                            >
                                {isPending && <LoadingSpinner className="h-4 w-4" />}
                                {isPending ? `${t("2FA.form.verifyingButton")}` : `${t("2FA.form.verifyButton")}`}
                            </Button>
                        </form>

                        {/**
                         * PL: Sekcja ponownego wysłania kodu z timerem
                         * EN: Code resend section with timer
                         */}
                        <div className="text-center">
                            <p className="text-md font-bold mb-3">
                                {t('2FA.notReceived')}
                            </p>
                            {/**
                             * PL: Przycisk ponownego wysłania z timerem cooldown
                             * EN: Resend button with cooldown timer
                             */}
                            <Button
                                variant="white"
                                onClick={handleResendCode}
                                disabled={countdown > 0 || isPending}
                                className="w-full border-gray-900"
                            >
                                {countdown > 0
                                    ? `${t("2FA.form.cooldownButton")} (${countdown} s)`
                                    : `${t("2FA.form.sendAgainButton")}`
                                }
                            </Button>
                            {/**
                             * PL: Informacja o czasie wygaśnięcia kodu
                             * EN: Code expiration time information
                             */}
                            <p className="text-sm text-cyan-700 font-bold mt-2">
                                {t('2FA.expiryInfo')}
                            </p>
                        </div>
                    </div>
                </div>

                {/**
                 * PL: Nakładka boczna z informacjami pomocniczymi
                 * EN: Side overlay with helpful information
                 */}
                <div className={
                    `absolute w-full h-[40%] lg:left-1/2 lg:w-1/2 lg:h-full rounded-[45px] p-12 ${authUIsettings.backgroundGradientDirection} ${authUIsettings.backgroundGradientFrom} ${authUIsettings.backgroundGradientTo} ` +
                    'text-white flex flex-col justify-center items-center ' +
                    'transition-transform duration-700 ease-in-out ' +
                    'overflow-hidden'}>
                    <div className="absolute top-10 right-10 z-10">
                        <ChangeLanguage/>
                    </div>

                    <h2 className="text-xl text-center lg:text-[1.35rem] font-bold">
                        {t("2FA.rightOverlay.title")}
                    </h2>

                    <p className="text-center text-base mb-3">
                        {t("2FA.rightOverlay.description")}
                    </p>

                    <div className="space-y-2">
                        {/**
                         * PL: Przycisk powrotu do logowania
                         * EN: Back to login button
                         */}
                        <Link href="/auth">
                            <Button variant="white" className="w-full">
                                {t("2FA.rightOverlay.button")}
                            </Button>
                        </Link>
                        {/**
                         * PL: Link do kontaktu w przypadku problemów
                         * EN: Contact link for troubleshooting
                         */}
                        <p className="text-sm text-center text-white/70 mt-4">
                            {t("2FA.rightOverlay.info.part1")} <Link href="/contact" className="text-white hover:underline">{t("2FA.rightOverlay.info.part2")}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}