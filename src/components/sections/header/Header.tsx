/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    ArrowRightToLine,
    Menu,
    X
} from "lucide-react";
import {ChangeLanguage} from "@/components/general/Language";
import {useTranslations} from "next-intl";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const t = useTranslations("navigation");

    const navItems = [
        {
            title: t('Dashboard'),
            href: '/auth',
        },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="relative text-[#191919] z-50">
            <div className="px-4 lg:max-w-[1440px] xl:px-10 py-7 mx-auto">
                <div className={`flex items-center justify-between transition-all duration-100 ease-in ${isMenuOpen ? 'rounded-t-[40px] md:rounded-t-[40px]' : 'rounded-[40px] md:rounded-[40px]'}`}>

                    <div className="flex items-center gap-4">
                        <ChangeLanguage/>
                    </div>

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex gap-5 items-center">
                        {navItems.map((item) => (
                            item.href === '/auth' ? (
                                <li key={item.title}>
                                    <Link href={item.href}>
                                        <Button size="default">
                                            <ArrowRightToLine size={28}/>
                                            {item.title}
                                        </Button>
                                    </Link>
                                </li>
                            ) : (
                                <li className="text-[17px] border-transparent rounded-b-lg border-b-4 p-1 hover:border-[#191919] mt-1.5"
                                    key={item.title}>
                                    <Link href={item.href}>
                                        {item.title}
                                    </Link>
                                </li>
                            )
                        ))}
                    </ul>

                    {/* Mobile Burger Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="lg:hidden focus:outline-none transition-transform duration-100 ease-in"
                        aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
                    >
                        {isMenuOpen ? (
                            <X size={32} className="transition-transform duration-300" />
                        ) : (
                            <Menu size={32} className="transition-transform duration-300" />
                        )}
                    </button>
                </div>

                {/* Animowane menu mobilne */}
                <div className={`lg:hidden bg-[#F1F1F1] rounded-b-[40px] md:rounded-b-[40px] shadow-lg absolute left-3 right-3 z-50 transform transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 -translate-y-2'}`}>
                    <div className="pt-5 pb-5 px-5">
                        <ul className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <li key={item.title} className="text-center">
                                    {item.href === '/auth' ? (
                                        <Link href={item.href} onClick={toggleMenu}>
                                            <Button size="default">
                                                <ArrowRightToLine size={28}/>
                                                {item.title}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            onClick={toggleMenu}
                                            className="text-[17px] block py-2 hover:bg-gray-200 rounded"
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}