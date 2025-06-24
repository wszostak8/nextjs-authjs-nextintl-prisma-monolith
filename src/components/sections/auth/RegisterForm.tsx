/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import React, {useState, useTransition} from "react";
import {registerUser} from "@/server/authorization/actions/auth";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import LoginByProvider from "@/components/sections/auth/LoginByProvider";
import {useTranslations} from "next-intl";
import {useActionHandler} from "@/server/NotificationPush";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "@/components/ui/loadingspinner";

/**
 * PL: Komponent formularza rejestracji z walidacją haseł i obsługą OAuth
 * EN: Registration form component with password validation and OAuth support
 * @returns PL: JSX Element formularza rejestracji | EN: JSX Element of registration form
 */
export const RegisterForm: React.FC = () => {
    const t = useTranslations("authorization")

    const [isPending, startTransition] = useTransition()
    const handleAction = useActionHandler()

    /**
     * PL: Stany kontrolujące widoczność haseł
     * EN: States controlling password visibility
     */
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    /**
     * PL: Stany dla walidacji i synchronizacji haseł
     * EN: States for password validation and synchronization
     */
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordsMatch, setPasswordsMatch] = useState(true)

    /**
     * PL: Handler submitowania formularza z walidacją haseł
     * EN: Form submission handler with password validation
     * @param formData - PL: Dane formularza rejestracji | EN: Registration form data
     */
    const handleSubmit = (formData: FormData) => {
        /**
         * PL: Sprawdzenie zgodności haseł przed wysłaniem formularza
         * EN: Check password match before form submission
         */
        if (password !== confirmPassword) {
            setPasswordsMatch(false)
            return
        }

        startTransition(async () => {
            await handleAction(() => registerUser(formData))
        })
    }

    /**
     * PL: Handler zmiany głównego hasła z walidacją w czasie rzeczywistym
     * EN: Main password change handler with real-time validation
     * @param e - PL: Event inputu hasła | EN: Password input event
     */
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value
        setPassword(newPassword)

        /**
         * PL: Sprawdzenie zgodności haseł podczas wpisywania
         * EN: Check password match while typing
         */
        if (confirmPassword && newPassword !== confirmPassword) {
            setPasswordsMatch(false)
        } else {
            setPasswordsMatch(true)
        }
    }

    /**
     * PL: Handler zmiany potwierdzenia hasła z walidacją w czasie rzeczywistym
     * EN: Confirm password change handler with real-time validation
     * @param e - PL: Event inputu potwierdzenia hasła | EN: Confirm password input event
     */
    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newConfirmPassword = e.target.value
        setConfirmPassword(newConfirmPassword)

        /**
         * PL: Sprawdzenie zgodności haseł podczas wpisywania
         * EN: Check password match while typing
         */
        if (password && password !== newConfirmPassword) {
            setPasswordsMatch(false)
        } else {
            setPasswordsMatch(true)
        }
    }

    /**
     * PL: Funkcja przełączająca widoczność głównego hasła
     * EN: Function toggling main password visibility
     */
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev)
    }

    /**
     * PL: Funkcja przełączająca widoczność potwierdzenia hasła
     * EN: Function toggling confirm password visibility
     */
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prev => !prev)
    }

    /**
     * PL: Walidacja możliwości wysłania formularza
     * EN: Form submission validation check
     */
    const canSubmit = password && confirmPassword && passwordsMatch

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
                    <span className="px-2 bg-white text-gray-500">{t('Form.or')}</span>
                </div>
            </div>

            {/**
             * PL: Formularz rejestracji z walidacją haseł
             * EN: Registration form with password validation
             */}
            <form action={handleSubmit} className="space-y-4 w-full px-4">
                <div>
                    <Input
                        variant="default"
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder={t('Form.nameAndLastName')}
                        disabled={isPending}
                    />
                </div>

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
                        minLength={5}
                        placeholder={t('Form.password')}
                        disabled={isPending}
                        className="pr-12"
                        value={password}
                        onChange={handlePasswordChange}
                    />

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

                <div className="relative">
                    <Input
                        variant="default"
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={5}
                        placeholder={t('Form.repeatPassword')}
                        disabled={isPending}
                        className={`pr-12 ${!passwordsMatch && confirmPassword ? 'border-red-500' : ''}`} /** PL: Czerwona ramka przy błędzie | EN: Red border on error */
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                    />

                    <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
                        disabled={isPending}
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/**
                 * PL: Przycisk submitowania z walidacją i loading state
                 * EN: Submit button with validation and loading state
                 */}
                <Button
                    type="submit"
                    variant="default"
                    className="w-full"
                    disabled={isPending || !canSubmit}
                >
                    {isPending && <LoadingSpinner className="h-4 w-4" />}
                    {isPending ? `${t('Form.registeringButton')}` : t('Form.registerButton')}
                </Button>
            </form>
        </>
    )
}