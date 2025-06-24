/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

"use client"

import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {devError, devLog} from "@/server/helpers/logger";

export { createNotificationUrl, createSuccessUrl, createErrorUrl, createWarningUrl, createInfoUrl } from '@/server/helpers/notifications-helper'

/**
 * PL: Typ powiadomienia określający styl wyświetlania
 * EN: Notification type determining display style
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

/**
 * PL: Interfejs kontekstu powiadomień
 * EN: Notification context interface
 */
interface NotificationContextType {
    showNotification: (type: NotificationType, message: string) => void
    handleActionResult: (result: ActionResult) => void
}

/**
 * PL: Typ wynikowy dla akcji serwera
 * EN: Result type for server actions
 */
export type ActionResult =
    | { success: true; message?: string }
    | { success: false; error: string }

/**
 * PL: Kontekst React dla systemu powiadomień
 * EN: React context for notification system
 */
const NotificationContext = createContext<NotificationContextType | null>(null)

/**
 *  * PL: Provider komponent dla systemu powiadomień z automatyczną obsługą URL
 *  * EN: Provider component for notification system with automatic URL handling
 */
export function NotificationPush({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const t = useTranslations('notifications.auth.messages')

    /**
     * PL: Funkcja wyświetlająca powiadomienie toast
     * EN: Function displaying toast notification
     */
    const showNotification = useCallback((type: NotificationType, message: string) => {
        switch (type) {
            case 'success':
                toast.success(message)
                break
            case 'error':
                toast.error(message)
                break
            case 'warning':
                toast.warning(message)
                break
            case 'info':
                toast.info(message)
                break
            default:
                toast(message)
        }
    }, [])

    /**
     * PL: Funkcja obsługująca wynik akcji serwera
     * EN: Function handling server action result
     */
    const handleActionResult = useCallback((result: ActionResult) => {
        if (result.success) {
            if (result.message) {
                showNotification('success', result.message)
            }
        } else {
            showNotification('error', result.error)
        }
    }, [showNotification])

    /**
     * PL: Automatyczna obsługa powiadomień z URL parameters
     * EN: Automatic handling of notifications from URL parameters
     */
    useEffect(() => {
        let shouldClearUrl = false

        const notificationType = searchParams.get('notification_type')
        const notificationKey = searchParams.get('notification_key')
        const customMessage = searchParams.get('notification_message')

        if (notificationType && (notificationKey || customMessage)) {
            const type = notificationType as NotificationType

            let message = ''

            if (customMessage) {
                message = customMessage
            } else if (notificationKey) {
                try {
                    const translationParams: Record<string, string> = {}

                    const systemParams = ['notification_type', 'notification_key', 'notification_message', 'oauth_success']

                    for (const [key, value] of searchParams.entries()) {
                        if (!systemParams.includes(key) && value) {
                            translationParams[key] = value
                        }
                    }

                    if (Object.keys(translationParams).length > 0) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        message = t(notificationKey as any, translationParams)
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        message = t(notificationKey as any)
                    }
                } catch {
                    message = notificationKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                }
            }
            if (message) {
                showNotification(type, message)
                shouldClearUrl = true
            }
        }
        if (shouldClearUrl) {
            const newUrl = window.location.pathname
            window.history.replaceState({}, '', newUrl)
        }
    }, [searchParams, showNotification, t])

    return (
        <NotificationContext.Provider value={{ showNotification, handleActionResult }}>
            {children}
        </NotificationContext.Provider>
    )
}

/**
 * PL: Hook do używania systemu powiadomień
 * EN: Hook for using notification system
 */
export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within NotificationPush')
    }
    return context
}

/**
 * PL: Hook do obsługi akcji z automatycznym zarządzaniem błędami i przekierowaniami
 * EN: Hook for handling actions with automatic error and redirect management
 */
export function useActionHandler() {
    const { handleActionResult } = useNotifications()

    return useCallback(async (actionFn: () => Promise<ActionResult>) => {
        try {
            const result = await actionFn()
            handleActionResult(result)
            return result
        } catch (error) {
            devError("🐛 useActionHandler caught error:", error)

            if (isRedirectError(error)) {
                devLog("🐛 useActionHandler: Redirect detected - re-throwing")
                throw error
            }

            const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd"
            const actionResult = { success: false, error: errorMessage } as ActionResult

            handleActionResult(actionResult)
            return actionResult
        }
    }, [handleActionResult])
}