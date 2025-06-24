/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChangeLanguage } from "@/components/general/Language";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { requestPasswordReset, resetPasswordWithToken, validateResetToken } from "@/server/authorization/actions/auth";
import { isValidTokenFormat } from "@/server/authorization/utils/tokens";
import { useActionHandler } from "@/server/NotificationPush";
import { useTransition } from "react";
import { useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/components/ui/loadingspinner";
import {authUIsettings} from "@/components/sections/auth/authUIsettings";

/**
 * PL: Typ określający aktualny scenariusz strony resetowania hasła
 * EN: Type defining current password reset page scenario
 */
type ScenarioType = 'form' | 'sent' | 'token' | 'invalid-token' | 'validating-token' | 'password-changed';

/**
 * PL: Interfejs definiujący zawartość scenariusza resetowania hasła
 * EN: Interface defining password reset scenario content
 */
interface ScenarioContent {
    type: ScenarioType;
    icon: 'email' | 'success' | 'check' | 'error' | 'loading' | 'check-circle';
    iconColor: string;
    title: string;
    description: string;
    content?: React.ReactNode;
}

/**
 * PL: Główny komponent strony resetowania hasła z obsługą różnych scenariuszy
 * EN: Main password reset page component with multiple scenario handling
 * @returns PL: JSX Element strony resetowania hasła | EN: JSX Element of password reset page
 */
export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const sent = searchParams.get("sent");

    const t = useTranslations("authorization");
    const [isPending, startTransition] = useTransition();
    const handleAction = useActionHandler();

    /**
     * PL: Stany dla formularzy resetowania hasła
     * EN: States for password reset forms
     */
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordChanged, setPasswordChanged] = useState(false);

    /**
     * PL: Stany dla toggle visibility haseł
     * EN: States for password visibility toggle
     */
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /**
     * PL: Stan dla sprawdzania ważności tokenu
     * EN: State for token validation
     */
    const [tokenValidation, setTokenValidation] = useState<{
        isValidating: boolean;
        isValid: boolean | null;
    }>({ isValidating: false, isValid: null });

    /**
     * PL: Efekt sprawdzający token w bazie danych przy ładowaniu komponentu
     * EN: Effect checking token in database when component loads
     */
    useEffect(() => {
        if (token && isValidTokenFormat(token)) {
            setTokenValidation({ isValidating: true, isValid: null });

            validateResetToken(token).then((result) => {
                setTokenValidation({
                    isValidating: false,
                    isValid: result.success
                });
            });
        }
    }, [token]);

    /**
     * PL: Funkcja przełączająca widoczność głównego hasła
     * EN: Function toggling main password visibility
     */
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    /**
     * PL: Funkcja przełączająca widoczność potwierdzenia hasła
     * EN: Function toggling confirm password visibility
     */
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prev => !prev);
    };

    /**
     * PL: Funkcja określająca zawartość scenariusza na podstawie aktualnego stanu
     * EN: Function determining scenario content based on current state
     * @returns PL: Obiekt zawartości scenariusza | EN: Scenario content object
     */
    const getScenarioContent = (): ScenarioContent => {
        /**
         * PL: Scenariusz 0 - Hasło zostało pomyślnie zmienione
         * EN: Scenario 0 - Password successfully changed
         */
        if (passwordChanged) {
            return {
                type: 'password-changed',
                icon: 'check-circle',
                iconColor: 'bg-green-100 text-green-600',
                title: `${t("ResetPassword.token.success.title")}`,
                description: `${t("ResetPassword.token.success.description")}`,
                content: (
                    <Link href="/auth" className="w-full">
                        <Button className="w-full">
                            {t("ResetPassword.token.success.button")}
                        </Button>
                    </Link>
                )
            };
        }

        /**
         * PL: Scenariusz 1 - Resetowanie hasła z tokenem (z linku w emailu)
         * EN: Scenario 1 - Password reset with token (from email link)
         */
        if (token) {
            /**
             * PL: Sprawdzenie formatu tokenu
             * EN: Token format validation
             */
            if (!isValidTokenFormat(token)) {
                return {
                    type: 'invalid-token',
                    icon: 'error',
                    iconColor: 'bg-red-100 text-red-600',
                    title: `${t("ResetPassword.token.invalid.title")}`,
                    description: `${t("ResetPassword.token.invalid.description")}`,
                    content: (
                        <div className="space-y-4 w-full px-4">
                            <div className="bg-red-50 p-4 rounded-xl w-full">
                                <p className="text-sm text-red-700 text-center mb-2">
                                    {t("ResetPassword.token.invalid.info.part1")}
                                </p>
                                <p className="text-xs text-red-600 font-semibold text-center">
                                    {t("ResetPassword.token.invalid.info.part2")}
                                </p>
                            </div>
                            <Link href="/auth/reset">
                                <Button variant="default" className="w-full">
                                    {t("ResetPassword.token.invalid.button")}
                                </Button>
                            </Link>
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
                    title: `${t("ResetPassword.token.validating.title")}`,
                    description: `${t("ResetPassword.token.validating.description")}`,
                    content: null
                };
            }

            /**
             * PL: Token zweryfikowany - nieprawidłowy lub wygasły
             * EN: Token verified - invalid or expired
             */
            if (tokenValidation.isValid === false) {
                return {
                    type: 'invalid-token',
                    icon: 'error',
                    iconColor: 'bg-red-100 text-red-600',
                    title: `${t("ResetPassword.token.expired.title")}`,
                    description: `${t("ResetPassword.token.expired.description")}`,
                    content: (
                        <div className="space-y-4 w-full px-4">
                            <div className="bg-red-50 p-4 rounded-xl w-full">
                                <p className="text-sm text-red-700 text-center mb-2">
                                    {t("ResetPassword.token.expired.info.part1")}
                                </p>
                                <p className="text-xs text-red-600 font-semibold text-center">
                                    {t("ResetPassword.token.expired.info.part2")}
                                </p>
                            </div>
                            <Link href="/auth/reset">
                                <Button variant="default" className="w-full">
                                    {t("ResetPassword.token.expired.button")}
                                </Button>
                            </Link>
                        </div>
                    )
                };
            }

            /**
             * PL: Token prawidłowy - formularz resetowania hasła
             * EN: Token valid - password reset form
             */
            if (tokenValidation.isValid === true) {
                /**
                 * PL: Handler submitowania formularza resetowania hasła
                 * EN: Password reset form submit handler
                 * @param e - PL: Event formularza | EN: Form event
                 */
                const handleResetSubmit = (e: React.FormEvent) => {
                    e.preventDefault();

                    /**
                     * PL: Walidacja zgodności haseł
                     * EN: Password match validation
                     */
                    if (password !== confirmPassword) {
                        handleAction(async () => ({ success: false, error: "Hasła nie są identyczne" }));
                        return;
                    }

                    /**
                     * PL: Walidacja długości hasła
                     * EN: Password length validation
                     */
                    if (password.length < 6) {
                        handleAction(async () => ({ success: false, error: "Hasło musi mieć co najmniej 6 znaków" }));
                        return;
                    }

                    startTransition(async () => {
                        const result = await handleAction(() => resetPasswordWithToken(token, password));
                        if (result.success) {
                            /**
                             * PL: Pokaż scenariusz sukcesu zamiast przekierowania
                             * EN: Show success scenario instead of redirect
                             */
                            setPasswordChanged(true);
                        }
                    });
                };

                return {
                    type: 'token',
                    icon: 'success',
                    iconColor: 'bg-green-100 text-green-600',
                    title: `${t("ResetPassword.token.valid.title")}`,
                    description: `${t("ResetPassword.token.valid.description")}`,
                    content: (
                        <form onSubmit={handleResetSubmit} className="space-y-4 w-full px-4">
                            {/**
                             * PL: Input hasła z toggle visibility
                             * EN: Password input with visibility toggle
                             */}
                            <div className="relative">
                                <Input
                                    variant="default"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("ResetPassword.token.valid.form.input1")}
                                    required
                                    minLength={6}
                                    disabled={isPending}
                                    className="pr-12" /** PL: Padding right dla ikony | EN: Padding right for icon */
                                />

                                {/**
                                 * PL: Przycisk toggle dla widoczności hasła
                                 * EN: Toggle button for password visibility
                                 */}
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                                    disabled={isPending}
                                    tabIndex={-1} /** PL: Usuń z tab navigation | EN: Remove from tab navigation */
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            {/**
                             * PL: Input potwierdzenia hasła z toggle visibility
                             * EN: Confirm password input with visibility toggle
                             */}
                            <div className="relative">
                                <Input
                                    variant="default"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t("ResetPassword.token.valid.form.input2")}
                                    required
                                    disabled={isPending}
                                    className="pr-12" /** PL: Padding right dla ikony | EN: Padding right for icon */
                                />

                                {/**
                                 * PL: Przycisk toggle dla widoczności potwierdzenia hasła
                                 * EN: Toggle button for confirm password visibility
                                 */}
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                                    disabled={isPending}
                                    tabIndex={-1} /** PL: Usuń z tab navigation | EN: Remove from tab navigation */
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            <Button
                                type="submit"
                                variant="default"
                                className="w-full"
                                disabled={isPending}
                            >
                                {isPending && <LoadingSpinner className="h-4 w-4" />}
                                {isPending ? `${t("ResetPassword.token.valid.buttonSetting")}` : `${t("ResetPassword.token.valid.button")}`}
                            </Button>
                        </form>
                    )
                };
            }

            /**
             * PL: Fallback dla tokenu
             * EN: Token fallback
             */
            return {
                type: 'validating-token',
                icon: 'loading',
                iconColor: 'bg-gray-100 text-gray-600',
                title: `${t("ResetPassword.token.validating.title")}`,
                description: `${t("ResetPassword.token.validating.description")}`,
                content: null
            };
        }

        /**
         * PL: Scenariusz 2 - Email został wysłany (sent=true)
         * EN: Scenario 2 - Email sent (sent=true)
         */
        if (sent === 'true') {
            return {
                type: 'sent',
                icon: 'check',
                iconColor: 'bg-green-200 text-green-600',
                title: `${t("ResetPassword.sent.title")}`,
                description: `${t("ResetPassword.sent.description")}`,
                content: (
                    <div className="space-y-4 w-full px-4">
                        <div className="bg-gray-100 p-4 rounded-xl w-full">
                            <p className="text-sm text-gray-900 text-center mb-2">
                                {t("ResetPassword.sent.info.part1")}
                            </p>
                            <p className="text-sm text-gray-900 font-semibold text-center">
                                {t("ResetPassword.sent.info.part2")}
                            </p>
                        </div>
                        <Link href="/auth/reset">
                            <Button variant="default" className="w-full">
                                {t("ResetPassword.sent.button")}
                            </Button>
                        </Link>
                    </div>
                )
            };
        }

        /**
         * PL: Scenariusz 3 - Formularz żądania resetowania hasła (domyślny)
         * EN: Scenario 3 - Password reset request form (default)
         */
        const handleEmailSubmit = (e: React.FormEvent) => {
            e.preventDefault();

            startTransition(async () => {
                await handleAction(() => requestPasswordReset(email));
                /**
                 * PL: Funkcja sama przekieruje na /auth/reset?sent=true
                 * EN: Function will redirect to /auth/reset?sent=true
                 */
            });
        };

        return {
            type: 'form',
            icon: 'email',
            iconColor: `${authUIsettings.backgroundGradientDirection} ${authUIsettings.backgroundGradientFrom} ${authUIsettings.backgroundGradientTo} text-white`,
            title: t('ResetPassword.form.title'),
            description: t('ResetPassword.form.description'),
            content: (
                <form onSubmit={handleEmailSubmit} className="space-y-4 w-full px-4">
                    <div>
                        <Input
                            variant="default"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('Form.emailAddress')}
                            required
                            disabled={isPending}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="default"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending && <LoadingSpinner className="h-4 w-4" />}
                        {isPending ? t('ResetPassword.form.sendingButton') : t('ResetPassword.form.button')}
                    </Button>
                </form>
            )
        };
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
            case 'email':
                return (
                    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'success':
                return (
                    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'check':
                return (
                    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'check-circle':
                return (
                    <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'loading':
                return (
                    <svg className={`${iconClasses} animate-spin`} fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="60 20"
                        />
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
                    <div className={`w-16 h-16 mx-auto mb-4 ${scenario.iconColor} rounded-full flex items-center justify-center`}>
                        {renderIcon(scenario.icon, scenario.iconColor)}
                    </div>

                    <h2 className="text-[1.35rem] font-bold mb-3 text-center">
                        {scenario.title}
                    </h2>

                    <p className="text-gray-600 mb-6 text-center">
                        {scenario.description}
                    </p>

                    {scenario.content}
                </div>

                {/**
                 * PL: Wspólna nakładka dla wszystkich scenariuszy
                 * EN: Common overlay for all scenarios
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

                    <Link href="/auth">
                        <Button variant="white">
                            {t('ForgotPasswordOverlayContent.backToLoginButton')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}