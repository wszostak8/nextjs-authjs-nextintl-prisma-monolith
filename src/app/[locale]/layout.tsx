import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import React from "react";
import {IntlProps} from "@/types/nextintl";
import "@/styles/globals.css";
import {inter} from "@/components/fonts";
import {Toaster} from "@/components/ui/sonner";
import {NotificationPush} from "@/server/NotificationPush";

export default async function LocaleLayout({ children, params }: IntlProps) {
    const {locale} = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale} suppressHydrationWarning={true}>
            <body className={`${inter.className} bg-[#F1F1F1]`}>
            <NextIntlClientProvider>
                <NotificationPush>
                    <Toaster theme="light" richColors={true} duration={5000} />
                    <main>
                        {children}
                    </main>
                </NotificationPush>
            </NextIntlClientProvider>
            </body>
        </html>
    );
}