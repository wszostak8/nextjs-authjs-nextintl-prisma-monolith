/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import { NotificationType } from "@/server/NotificationPush";
import { routing } from "@/i18n/routing";

/**
 * PL: Tworzy URL z powiadomieniem, obsługując lokalizację i parametry
 * EN: Creates notification URL with localization and parameters support
 *
 * @param baseUrl - PL: Bazowy URL strony | EN: Base page URL
 * @param type - PL: Typ powiadomienia | EN: Notification type
 * @param locale - PL: Kod języka (opcjonalny) | EN: Language code (optional)
 * @param messageKey - PL: Klucz wiadomości do tłumaczenia | EN: Message key for translation
 * @param customMessage - PL: Niestandardowa wiadomość | EN: Custom message
 * @param params - PL: Dodatkowe parametry URL | EN: Additional URL parameters
 * @returns PL: Kompletny URL z powiadomieniem | EN: Complete notification URL
 */
export function createNotificationUrl(
    baseUrl: string,
    type: NotificationType,
    locale?: string,
    messageKey?: string,
    customMessage?: string,
    params?: Record<string, string>
): string {
    // PL: Dodaj locale do baseUrl jeśli jest różne od domyślnego
    // EN: Add locale to baseUrl if different from default
    let finalBaseUrl = baseUrl;
    if (locale && locale !== routing.defaultLocale) {
        // PL: Usuń początkowy slash z baseUrl jeśli istnieje
        // EN: Remove leading slash from baseUrl if exists
        const cleanBaseUrl = baseUrl.startsWith('/') ? baseUrl.slice(1) : baseUrl;
        finalBaseUrl = `/${locale}/${cleanBaseUrl}`;
    }

    const url = new URL(finalBaseUrl, process.env.NEXTAUTH_URL || 'http://localhost:3000');

    url.searchParams.set('notification_type', type);

    if (messageKey) {
        url.searchParams.set('notification_key', messageKey);
    }

    if (customMessage) {
        url.searchParams.set('notification_message', customMessage);
    }

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }

    return url.toString();
}

/**
 * PL: Funkcje pomocnicze z automatycznym typem powiadomienia
 * EN: Helper functions with automatic notification type
 */

/**
 * PL: Tworzy URL z powiadomieniem sukcesu
 * EN: Creates success notification URL
 *
 * @param baseUrl - PL: Bazowy URL strony | EN: Base page URL
 * @param messageKey - PL: Klucz wiadomości sukcesu | EN: Success message key
 * @param locale - PL: Kod języka (opcjonalny) | EN: Language code (optional)
 * @param params - PL: Dodatkowe parametry | EN: Additional parameters
 * @returns PL: URL z powiadomieniem sukcesu | EN: Success notification URL
 */
export function createSuccessUrl(
    baseUrl: string,
    messageKey: string,
    locale?: string,
    params?: Record<string, string>
): string {
    return createNotificationUrl(baseUrl, 'success', locale, messageKey, undefined, params);
}

/**
 * PL: Tworzy URL z powiadomieniem błędu
 * EN: Creates error notification URL
 *
 * @param baseUrl - PL: Bazowy URL strony | EN: Base page URL
 * @param messageKey - PL: Klucz wiadomości błędu | EN: Error message key
 * @param locale - PL: Kod języka (opcjonalny) | EN: Language code (optional)
 * @param params - PL: Dodatkowe parametry | EN: Additional parameters
 * @returns PL: URL z powiadomieniem błędu | EN: Error notification URL
 */
export function createErrorUrl(
    baseUrl: string,
    messageKey: string,
    locale?: string,
    params?: Record<string, string>
): string {
    return createNotificationUrl(baseUrl, 'error', locale, messageKey, undefined, params);
}

/**
 * PL: Tworzy URL z powiadomieniem ostrzeżenia
 * EN: Creates warning notification URL
 *
 * @param baseUrl - PL: Bazowy URL strony | EN: Base page URL
 * @param messageKey - PL: Klucz wiadomości ostrzeżenia | EN: Warning message key
 * @param locale - PL: Kod języka (opcjonalny) | EN: Language code (optional)
 * @param params - PL: Dodatkowe parametry | EN: Additional parameters
 * @returns PL: URL z powiadomieniem ostrzeżenia | EN: Warning notification URL
 */
export function createWarningUrl(
    baseUrl: string,
    messageKey: string,
    locale?: string,
    params?: Record<string, string>
): string {
    return createNotificationUrl(baseUrl, 'warning', locale, messageKey, undefined, params);
}

/**
 * PL: Tworzy URL z powiadomieniem informacyjnym
 * EN: Creates info notification URL
 *
 * @param baseUrl - PL: Bazowy URL strony | EN: Base page URL
 * @param messageKey - PL: Klucz wiadomości informacyjnej | EN: Info message key
 * @param locale - PL: Kod języka (opcjonalny) | EN: Language code (optional)
 * @param params - PL: Dodatkowe parametry | EN: Additional parameters
 * @returns PL: URL z powiadomieniem informacyjnym | EN: Info notification URL
 */
export function createInfoUrl(
    baseUrl: string,
    messageKey: string,
    locale?: string,
    params?: Record<string, string>
): string {
    return createNotificationUrl(baseUrl, 'info', locale, messageKey, undefined, params);
}

/**
 * PL: Funkcje wrapper dla server actions z wymaganym parametrem locale
 * EN: Wrapper functions for server actions with required locale parameter
 */

/**
 * PL: Tworzy zlokalizowany URL z powiadomieniem sukcesu (do server actions)
 * EN: Creates localized success notification URL (for server actions)
 *
 * @param baseUrl - PL: Bazowy URL strony | EN: Base page URL
 * @param messageKey - PL: Klucz wiadomości sukcesu | EN: Success message key
 * @param locale - PL: Kod języka (wymagany) | EN: Language code (required)
 * @param params - PL: Dodatkowe parametry | EN: Additional parameters
 * @returns PL: Zlokalizowany URL z powiadomieniem sukcesu | EN: Localized success notification URL
 */
export function createLocalizedSuccessUrl(
    baseUrl: string,
    messageKey: string,
    locale: string,
    params?: Record<string, string>
): string {
    return createSuccessUrl(baseUrl, messageKey, locale, params);
}

/**
 * PL: Tworzy zlokalizowany URL z powiadomieniem błędu (do server actions)
 * EN: Creates localized error notification URL (for server actions)
 *
 * @param baseUrl - PL: Bazowy URL strony | EN: Base page URL
 * @param messageKey - PL: Klucz wiadomości błędu | EN: Error message key
 * @param locale - PL: Kod języka (wymagany) | EN: Language code (required)
 * @param params - PL: Dodatkowe parametry | EN: Additional parameters
 * @returns PL: Zlokalizowany URL z powiadomieniem błędu | EN: Localized error notification URL
 */
export function createLocalizedErrorUrl(
    baseUrl: string,
    messageKey: string,
    locale: string,
    params?: Record<string, string>
): string {
    return createErrorUrl(baseUrl, messageKey, locale, params);
}

/**
 * PL: Tworzy zlokalizowany URL z powiadomieniem ostrzeżenia (do server actions)
 * EN: Creates localized warning notification URL (for server actions)
 *
 * @param baseUrl - PL: Bazowy URL strony | EN: Base page URL
 * @param messageKey - PL: Klucz wiadomości ostrzeżenia | EN: Warning message key
 * @param locale - PL: Kod języka (wymagany) | EN: Language code (required)
 * @param params - PL: Dodatkowe parametry | EN: Additional parameters
 * @returns PL: Zlokalizowany URL z powiadomieniem ostrzeżenia | EN: Localized warning notification URL
 */
export function createLocalizedWarningUrl(
    baseUrl: string,
    messageKey: string,
    locale: string,
    params?: Record<string, string>
): string {
    return createWarningUrl(baseUrl, messageKey, locale, params);
}

/**
 * PL: Tworzy zlokalizowany URL z powiadomieniem informacyjnym (do server actions)
 * EN: Creates localized info notification URL (for server actions)
 *
 * @param baseUrl - PL: Bazowy URL strony | EN: Base page URL
 * @param messageKey - PL: Klucz wiadomości informacyjnej | EN: Info message key
 * @param locale - PL: Kod języka (wymagany) | EN: Language code (required)
 * @param params - PL: Dodatkowe parametry | EN: Additional parameters
 * @returns PL: Zlokalizowany URL z powiadomieniem informacyjnym | EN: Localized info notification URL
 */
export function createLocalizedInfoUrl(
    baseUrl: string,
    messageKey: string,
    locale: string,
    params?: Record<string, string>
): string {
    return createInfoUrl(baseUrl, messageKey, locale, params);
}