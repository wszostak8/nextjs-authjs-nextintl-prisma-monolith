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
import {LoginForm} from "@/components/sections/auth/LoginForm";
import {RegisterForm} from "@/components/sections/auth/RegisterForm";
import {ChangeLanguage} from "@/components/general/Language";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {authUIsettings} from "@/components/sections/auth/authUIsettings";

/**
 * PL: Typ określający aktualny widok w komponencie uwierzytelniania
 * EN: Type defining current view in authentication component
 */
type ViewType = "login" | "register";

/**
 * PL: Komponent overlay'a uwierzytelniania z animowanym przełączaniem między logowaniem a rejestracją
 * EN: Authentication overlay component with animated switching between login and registration
 * @returns PL: JSX Element overlay'a uwierzytelniania | EN: JSX Element of authentication overlay
 */
export const AuthOverlay: React.FC = () => {
    /**
     * PL: Stan określający aktualnie wyświetlany widok (login/register)
     * EN: State defining currently displayed view (login/register)
     */
    const [currentView, setCurrentView] = useState<ViewType>("login");

    /**
     * PL: Helper do sprawdzania czy aktualnie wyświetlany jest widok logowania
     * EN: Helper to check if login view is currently displayed
     */
    const isLoginView = currentView === "login";

    const t = useTranslations("authorization")

    return (
        <div className="flex items-center justify-center h-screen m-0">
            <div className="relative flex flex-col w-full h-[53rem] xl:w-[80%] lg:h-[38rem] rounded-[50px] bg-white shadow-sm max-w-[700px] lg:max-w-[1000px]">

                {/**
                 * PL: Kontener formularza logowania z animacją opacity
                 * EN: Login form container with opacity animation
                 */}
                <div
                    className={`w-full rounded-[50px] lg:w-1/2 mt-40 lg:mt-0 p-6 flex flex-col justify-center items-center absolute left-0 top-0 h-full
                        transition-opacity duration-700 ease-in-out
                        ${isLoginView ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                    <h2 className="text-[1.35rem] font-bold mb-3">
                        {t('Form.loginHeader')}
                    </h2>
                    {/**
                     * PL: Komponent formularza logowania
                     * EN: Login form component
                     */}
                    <LoginForm />
                    {/**
                     * PL: Link do resetowania hasła
                     * EN: Password reset link
                     */}
                    <Link href="/auth/reset" className="text-red-900 font-semibold hover:underline">{t('ResetPassword.form.title')}</Link>
                </div>

                {/**
                 * PL: Kontener formularza rejestracji z animacją opacity
                 * EN: Registration form container with opacity animation
                 */}
                <div
                    className={`w-full rounded-[50px] lg:w-1/2 pt-84 lg:pt-0 p-6 flex flex-col justify-center items-center bg-white absolute right-0 top-0 h-full
                        transition-opacity duration-700 ease-in-out
                        ${!isLoginView ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                    <h2 className="text-[1.35rem] font-bold mb-3">
                        {t('Form.registerHeader')}
                    </h2>
                    {/**
                     * PL: Komponent formularza rejestracji
                     * EN: Registration form component
                     */}
                    <RegisterForm />
                </div>

                {/**
                 * PL: Animowana nakładka z przyciskami przełączania widoków
                 * Przesuwa się poziomo i zmienia zawartość w zależności od aktualnego widoku
                 * EN: Animated overlay with view switching buttons
                 * Slides horizontally and changes content based on current view
                 */}
                <div
                    className={
                        `absolute w-full h-[40%] lg:left-1/2 lg:w-1/2 lg:h-full rounded-[45px] p-12 ${authUIsettings.backgroundGradientDirection} ${authUIsettings.backgroundGradientFrom} ${authUIsettings.backgroundGradientTo} ` +
                        'text-white flex flex-col justify-center items-center ' +
                        'transition-transform duration-700 ease-in-out ' +
                        'overflow-hidden ' +
                        (isLoginView ? "translate-x-0 lg:translate-x-0" : "translate-x-0 lg:-translate-x-full")
                    }
                >
                    {/**
                     * PL: Zawartość nakładki dla widoku logowania
                     * EN: Overlay content for login view
                     */}
                    {isLoginView ? (
                        <>
                            {/**
                             * PL: Selektor języka w prawym górnym rogu
                             * EN: Language selector in top right corner
                             */}
                            <div className="absolute top-10 right-10 z-10">
                                <ChangeLanguage/>
                            </div>
                            <h2 className="text-xl lg:text-[1.35rem] font-bold mb-1">
                                {t('RightOverlayContent.dontHaveAccount')}
                            </h2>
                            <p className="text-center text-base mb-3">
                                {t('RightOverlayContent.clickButtonToRegisters')}
                            </p>
                            {/**
                             * PL: Przycisk przełączający na widok rejestracji
                             * EN: Button switching to registration view
                             */}
                            <Button
                                variant="white"
                                onClick={() => setCurrentView("register")}
                            >
                                {t('Form.registerButton')}
                            </Button>
                        </>
                    ) : (
                        /**
                         * PL: Zawartość nakładki dla widoku rejestracji
                         * EN: Overlay content for registration view
                         */
                        <>
                            {/**
                             * PL: Selektor języka w lewym górnym rogu
                             * EN: Language selector in top left corner
                             */}
                            <div className="absolute top-10 left-10 z-10">
                                <ChangeLanguage/>
                            </div>
                            <h2 className="text-xl lg:text-[1.35rem] font-bold mb-1">
                                {t('LeftOverlayContent.alreadyHaveAccount')}
                            </h2>
                            <p className="text-center text-base mb-3">
                                {t('LeftOverlayContent.clickButtonToLogIn')}
                            </p>
                            {/**
                             * PL: Przycisk przełączający na widok logowania
                             * EN: Button switching to login view
                             */}
                            <Button
                                variant="white"
                                onClick={() => setCurrentView("login")}
                            >
                                {t('Form.loginButton')}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};