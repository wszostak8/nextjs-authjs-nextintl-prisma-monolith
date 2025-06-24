/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

'use client';

import React, { useState, useRef, useEffect } from "react";
import { useLocale } from "use-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { IoIosArrowDown } from "react-icons/io";

/**
 * PL: Komponent flagi Polski w formacie SVG
 * EN: Polish flag component in SVG format
 * @param className - PL: Opcjonalne klasy CSS | EN: Optional CSS classes
 * @returns PL: SVG Element flagi Polski | EN: SVG Element of Polish flag
 */
const PolishFlag = ({ className = "h-7 w-7" }: { className?: string }) => (
    <svg className={`${className} rounded-lg`} viewBox="0 0 24 16" fill="none">
        <rect width="24" height="8" fill="#FFFFFF" />
        <rect y="8" width="24" height="8" fill="#DC143C" />
        <rect width="24" height="16" fill="none" stroke="#ddd" strokeWidth="0.5" />
    </svg>
);

/**
 * PL: Komponent flagi USA w formacie SVG
 * EN: USA flag component in SVG format
 * @param className - PL: Opcjonalne klasy CSS | EN: Optional CSS classes
 * @returns PL: SVG Element flagi USA | EN: SVG Element of USA flag
 */
const USAFlag = ({ className = "h-7 w-7" }: { className?: string }) => (
    <svg className={`${className} rounded-lg`} viewBox="0 0 24 16" fill="none">
        <rect width="24" height="16" fill="#B22234" />
        <rect y="0" width="24" height="1.23" fill="#FFFFFF" />
        <rect y="2.46" width="24" height="1.23" fill="#FFFFFF" />
        <rect y="4.92" width="24" height="1.23" fill="#FFFFFF" />
        <rect y="7.38" width="24" height="1.23" fill="#FFFFFF" />
        <rect y="9.84" width="24" height="1.23" fill="#FFFFFF" />
        <rect y="12.3" width="24" height="1.23" fill="#FFFFFF" />
        <rect y="14.76" width="24" height="1.23" fill="#FFFFFF" />
        <rect width="9.6" height="8.61" fill="#3C3B6E" />
        <g fill="#FFFFFF">
            <circle cx="1.2" cy="1.23" r="0.3" />
            <circle cx="3.6" cy="1.23" r="0.3" />
            <circle cx="6" cy="1.23" r="0.3" />
            <circle cx="8.4" cy="1.23" r="0.3" />
            <circle cx="2.4" cy="2.46" r="0.3" />
            <circle cx="4.8" cy="2.46" r="0.3" />
            <circle cx="7.2" cy="2.46" r="0.3" />
            <circle cx="1.2" cy="3.69" r="0.3" />
            <circle cx="3.6" cy="3.69" r="0.3" />
            <circle cx="6" cy="3.69" r="0.3" />
            <circle cx="8.4" cy="3.69" r="0.3" />
        </g>
    </svg>
);

/**
 * PL: Konfiguracja dostępnych języków z kodami, etykietami i ikonami flag
 * EN: Configuration of available languages with codes, labels and flag icons
 */
const LANGUAGES = [
    {
        code: 'pl',
        label: 'PL',
        icon: PolishFlag,
    },
    {
        code: 'en',
        label: 'EN',
        icon: USAFlag,
    },
];

/**
 * PL: Komponent selektora języka z dropdown'em i animacjami hover
 * EN: Language selector component with dropdown and hover animations
 * @returns PL: JSX Element selektora języka | EN: JSX Element of language selector
 */
export function ChangeLanguage() {
    const locale = useLocale();
    const pathname = usePathname();

    /**
     * PL: Stan kontrolujący widoczność dropdown'a
     * EN: State controlling dropdown visibility
     */
    const [isOpen, setIsOpen] = useState(false);

    /**
     * PL: Referencja do kontenera dla obsługi kliknięć poza komponentem
     * EN: Container reference for handling clicks outside component
     */
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * PL: Usunięcie prefixu języka z ścieżki URL dla prawidłowego routingu
     * EN: Remove language prefix from URL path for proper routing
     */
    const pathWithoutLocale = pathname.replace(/^\/(en|pl)/, "") || "/";

    /**
     * PL: Znalezienie aktualnie wybranego języka
     * EN: Find currently selected language
     */
    const currentLang = LANGUAGES.find(lang => lang.code === locale);

    /**
     * PL: Handler otwarcia dropdown'a przy hover
     * EN: Handler for opening dropdown on hover
     */
    const handleMouseEnter = () => {
        setIsOpen(true);
    };

    /**
     * PL: Handler zamknięcia dropdown'a przy opuszczeniu hover
     * EN: Handler for closing dropdown on mouse leave
     */
    const handleMouseLeave = () => {
        setIsOpen(false);
    };

    /**
     * PL: Efekt zamykający dropdown przy kliknięciu poza komponentem
     * EN: Effect for closing dropdown when clicking outside component
     */
    useEffect(() => {
        /**
         * PL: Handler kliknięcia poza komponentem
         * EN: Click outside handler
         * @param event - PL: Event myszy | EN: Mouse event
         */
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        /**
         * PL: Główny kontener z obsługą hover i referencją
         * EN: Main container with hover handling and reference
         */
        <div
            ref={containerRef}
            className="relative inline-block hover:cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/**
             * PL: Szerszy niewidzialny kontener dla lepszej obsługi hover
             * EN: Wider invisible container for better hover handling
             */}
            <div className="absolute -inset-4 z-0" />

            {/**
             * PL: Przycisk selektora języka z flagą i strzałką
             * EN: Language selector button with flag and arrow
             */}
            <button
                aria-label="Zmień język"
                className="flex items-center justify-center gap-1 z-10"
                onClick={() => setIsOpen(!isOpen)}
            >
                {currentLang && <currentLang.icon className="h-7 w-7" />}
                <IoIosArrowDown className="text-2xl" />
            </button>

            {/**
             * PL: Dropdown z listą dostępnych języków
             * EN: Dropdown with list of available languages
             */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 z-20 min-w-[90px] rounded-xl border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                    {LANGUAGES.map(({ code, label, icon: Icon }) => (
                        /**
                         * PL: Link zmiany języka z flagą i etykietą
                         * EN: Language change link with flag and label
                         */
                        <Link
                            key={code}
                            href={pathWithoutLocale}
                            locale={code}
                            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                            onClick={() => setIsOpen(false)}
                        >
                            {/**
                             * PL: Mniejsza ikona flagi w dropdown
                             * EN: Smaller flag icon in dropdown
                             */}
                            <Icon className="h-6 w-6" />
                            <span>{label}</span>
                            {/**
                             * PL: Wskaźnik aktualnie wybranego języka
                             * EN: Indicator for currently selected language
                             */}
                            {code === locale && (
                                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}