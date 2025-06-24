/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import React, { useState } from "react";
import { loginUser } from "@/server/authorization/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoginByProvider from "@/components/sections/auth/LoginByProvider";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useActionHandler } from "@/server/NotificationPush";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/components/ui/loadingspinner";

/**
 * PL: Komponent formularza logowania z obsługą OAuth i credentials
 * EN: Login form component with OAuth and credentials support
 * @returns PL: JSX Element formularza logowania | EN: JSX Element of login form
 */
export const LoginForm: React.FC = () => {
    const t = useTranslations("authorization")
    const [isPending, startTransition] = useTransition()
    const handleAction = useActionHandler()

    /**
     * PL: Stan kontrolujący widoczność hasła
     * EN: State controlling password visibility
     */
    const [showPassword, setShowPassword] = useState(false)

    /**
     * PL: Handler submitowania formularza logowania
     * EN: Login form submission handler
     * @param formData - PL: Dane formularza z polami email i password | EN: Form data with email and password fields
     */
    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            await handleAction(() => loginUser(formData))
        })
    }

    /**
     * PL: Funkcja przełączająca widoczność hasła
     * EN: Function toggling password visibility
     */
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev)
    }

    return (
        <>
            <div className="flex items-center m-0 gap-3">
                <LoginByProvider provider="google" />
                <LoginByProvider provider="facebook" />
                <LoginByProvider provider="linkedin" />
                <LoginByProvider provider="github" />
                <LoginByProvider provider="apple" />
            </div>

            <div className="relative mt-4 mb-2">
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">{t("Form.or")}</span>
                </div>
            </div>

            {/**
             * PL: Formularz logowania email/hasło
             * EN: Email/password login form
             */}
            <form action={handleSubmit} className="space-y-4 mb-6 w-full px-4">
                <div>
                    <Input
                        variant="default"
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder={t('Form.emailAddress')}
                        disabled={isPending}
                    />
                </div>

                <div className="relative">
                    <Input
                        variant="default"
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder={t("Form.password")}
                        disabled={isPending}
                        className="pr-12"
                    />

                    {/**
                     * PL: Przycisk toggle do pokazywania/ukrywania hasła
                     * EN: Toggle button for showing/hiding password
                     */}
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                        disabled={isPending}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/**
                 * PL: Przycisk submitowania formularza z loading state
                 * EN: Form submit button with loading state
                 */}
                <Button
                    type="submit"
                    variant="default"
                    className="w-full"
                    disabled={isPending}
                >
                    {isPending && <LoadingSpinner className="h-4 w-4" />}
                    {isPending ? `${t('Form.loggingButton')}` : t('Form.loginButton')}
                </Button>
            </form>
        </>
    );
};