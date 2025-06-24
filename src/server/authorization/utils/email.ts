/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import nodemailer from 'nodemailer'
import { getTranslations, getLocale } from 'next-intl/server'
import { devLog, devError } from '@/server/helpers/logger'

/**
 * PL: Typy emaili obsługiwane przez system
 * EN: Email types supported by the system
 */
export type EmailType = 'verification' | 'password-reset' | '2fa'

/**
 * PL: Konfiguracja transportu email używając nodemailer
 * EN: Email transport configuration using nodemailer
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
})

/**
 * PL: Generuje bazowy template HTML dla emaili z automatyczną lokalizacją
 * EN: Generates base HTML template for emails with automatic localization
 * @param type - PL: Typ emaila | EN: Email type
 * @param content - PL: Zawartość emaila | EN: Email content
 * @param userName - PL: Opcjonalna nazwa użytkownika | EN: Optional user name
 * @returns PL: String z HTML template | EN: String with HTML template
 */
async function generateBaseEmailTemplate(
    type: EmailType,
    content: string,
    userName?: string
): Promise<string> {
    const locale = await getLocale()
    const t = await getTranslations('email')
    const greeting = userName ? t('common.greetingWithName', { name: userName }) : t('common.greeting')
    const currentYear = new Date().getFullYear()

    /**
     * PL: Mapowanie typów emaili na klucze tłumaczeń
     * EN: Mapping email types to translation keys
     */
    const typeMap = {
        'verification': 'verification',
        'password-reset': 'passwordReset',
        '2fa': 'twoFactor'
    }
    const translationKey = typeMap[type]

    return `
    <!DOCTYPE html>
    <html lang="${locale}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t(`${translationKey}.title`)}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 0; padding: 0; background-color: #f5f5f5; line-height: 1.6; color: #191919;
            }
            .container { 
                max-width: 600px; margin: 40px auto; background: white; 
                border-radius: 12px; overflow: hidden; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #006BA8 0%, #1E4F5B 100%); 
                color: white; padding: 40px 30px; text-align: center; 
            }
            .content { padding: 40px 30px; }
            .button { 
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #191919; 
                color: #F7F7F7 !important; 
                padding: 16px 40px; 
                text-decoration: none; 
                border-radius: 20px; 
                font-weight: 400; 
                font-size: 16px;
                margin: 20px 0;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .button:hover {
                cursor: pointer;
                opacity: 0.9;
                transform: translateY(-1px);
            }
            .footer { 
                background: #f8f9fa; padding: 20px 30px; text-align: center; 
                font-size: 12px; color: #666; 
            }
            .link-box { 
                background: #f3f4f6; 
                border-radius: 12px; 
                padding: 15px; 
                margin: 20px 0; 
                word-break: break-all; 
                font-family: 'Inter', monospace;
                font-size: 14px;
                color: #191919;
            }
            .info-box { 
                background: #f3f4f6; 
                border-radius: 12px; 
                padding: 15px; 
                margin: 20px 0; 
                color: #191919; 
            }
            .code-box { 
                background: #f3f4f6; 
                border: 2px dashed #006BA8; 
                border-radius: 12px; 
                padding: 20px; 
                text-align: center; 
                margin: 30px 0; 
            }
            .code { 
                font-size: 32px; 
                font-weight: bold; 
                color: #006BA8; 
                letter-spacing: 8px; 
                font-family: 'Inter', 'Courier New', monospace; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${t(`${translationKey}.title`)}</h1>
            </div>
            
            <div class="content">
                <h2 style="color: #191919; font-size: 20px; margin-bottom: 16px; font-weight: 600;">${greeting}</h2>
                ${content}
            </div>
            
            <div class="footer">
                <p style="color: #666; margin: 8px 0;">${t('common.footer.automated')}</p>
                <p style="color: #666; margin: 8px 0;">&copy; ${currentYear} <strong>AuthSystem</strong> by <strong>wszostak8</strong>. ${t('common.footer.rights')}</p>
            </div>
        </div>
    </body>
    </html>
    `
}

/**
 * PL: Generuje bazowy template tekstowy dla emaili z automatyczną lokalizacją
 * EN: Generates base text template for emails with automatic localization
 * @param type - PL: Typ emaila | EN: Email type
 * @param content - PL: Zawartość emaila | EN: Email content
 * @param userName - PL: Opcjonalna nazwa użytkownika | EN: Optional user name
 * @returns PL: String z tekstowym template | EN: String with text template
 */
async function generateBaseEmailText(
    type: EmailType,
    content: string,
    userName?: string
): Promise<string> {
    const t = await getTranslations('email')
    const greeting = userName ? t('common.greetingWithName', { name: userName }) : t('common.greeting')
    const currentYear = new Date().getFullYear()

    return `
${greeting}

${content}

---
${t('common.footer.automated')}
© ${currentYear} AuthSystem by wszostak8. ${t('common.footer.rights')}
    `.trim()
}

/**
 * PL: Wysyła email weryfikacyjny do użytkownika
 * EN: Sends verification email to user
 * @param email - PL: Adres email odbiorcy | EN: Recipient email address
 * @param token - PL: Token weryfikacyjny | EN: Verification token
 * @param userName - PL: Opcjonalna nazwa użytkownika | EN: Optional user name
 * @returns PL: True jeśli email został wysłany pomyślnie | EN: True if email was sent successfully
 */
export async function sendVerificationEmail(
    email: string,
    token: string,
    userName?: string
): Promise<boolean> {
    try {
        const locale = await getLocale()
        const t = await getTranslations('email')
        const verificationUrl = `${process.env.NEXTAUTH_URL}/${locale}/auth/verify-email?token=${token}`
        const translationKey = 'verification'

        const htmlContent = `
            <p style="color: #191919; margin: 16px 0;">${t(`${translationKey}.description`)}</p>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">${t(`${translationKey}.buttonText`)}</a>
            </div>
            
            <p style="color: #191919; margin: 16px 0;">${t(`${translationKey}.fallbackText`)}</p>
            <div class="link-box">${verificationUrl}</div>
            
            <div class="info-box">
                <p style="margin: 0; font-weight: 600; color: #191919;">${t(`${translationKey}.importantInfo.title`)}</p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #191919;">
                    <li>${t(`${translationKey}.importantInfo.expiry`)}</li>
                    <li>${t(`${translationKey}.importantInfo.oneTime`)}</li>
                    <li>${t(`${translationKey}.importantInfo.ignore`)}</li>
                </ul>
            </div>
            
            <p style="color: #191919; margin: 16px 0;">${t(`${translationKey}.securityNote`)}</p>
            
            <p style="color: #191919; margin: 16px 0;">${t('common.signature')}<br><strong>${t('common.teamName')}</strong></p>
        `

        const textContent = `
${t(`${translationKey}.description`)}

${t(`${translationKey}.linkText`)}: ${verificationUrl}

${t(`${translationKey}.importantInfo.title`)}:
- ${t(`${translationKey}.importantInfo.expiry`)}
- ${t(`${translationKey}.importantInfo.oneTime`)}
- ${t(`${translationKey}.importantInfo.ignore`)}

${t('common.signature')},
${t('common.teamName')}
        `.trim()

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: t(`${translationKey}.subject`),
            html: await generateBaseEmailTemplate('verification', htmlContent, userName),
            text: await generateBaseEmailText('verification', textContent, userName),
        }

        await transporter.sendMail(mailOptions)
        devLog(`✅ Verification email sent to: ${email} (locale: ${locale})`)
        return true

    } catch (error) {
        devError('❌ Failed to send verification email:', error)
        return false
    }
}

/**
 * PL: Wysyła email z linkiem resetowania hasła
 * EN: Sends password reset email
 * @param email - PL: Adres email odbiorcy | EN: Recipient email address
 * @param token - PL: Token resetowania hasła | EN: Password reset token
 * @param userName - PL: Opcjonalna nazwa użytkownika | EN: Optional user name
 * @returns PL: True jeśli email został wysłany pomyślnie | EN: True if email was sent successfully
 */
export async function sendPasswordResetEmail(
    email: string,
    token: string,
    userName?: string
): Promise<boolean> {
    try {
        const locale = await getLocale()
        const t = await getTranslations('email')
        const resetUrl = `${process.env.NEXTAUTH_URL}/${locale}/auth/reset?token=${token}`
        const translationKey = 'passwordReset'

        const htmlContent = `
            <p style="color: #191919; margin: 16px 0;">${t(`${translationKey}.description`)}</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">${t(`${translationKey}.buttonText`)}</a>
            </div>
            
            <p style="color: #191919; margin: 16px 0;">${t(`${translationKey}.fallbackText`)}</p>
            <div class="link-box">${resetUrl}</div>
            
            <div class="info-box">
                <p style="margin: 0; font-weight: 600; color: #191919;">${t(`${translationKey}.securityInfo.title`)}</p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #191919;">
                    <li>${t(`${translationKey}.securityInfo.expiry`)}</li>
                    <li>${t(`${translationKey}.securityInfo.oneTime`)}</li>
                    <li>${t(`${translationKey}.securityInfo.ignore`)}</li>
                    <li>${t(`${translationKey}.securityInfo.dontShare`)}</li>
                </ul>
            </div>
            
            <p style="color: #191919; margin: 16px 0;">${t(`${translationKey}.securityNote`)}</p>
            
            <p style="color: #191919; margin: 16px 0;">${t('common.signature')}<br><strong>${t('common.teamName')}</strong></p>
        `

        const textContent = `
${t(`${translationKey}.description`)}

${t(`${translationKey}.linkText`)}: ${resetUrl}

${t(`${translationKey}.securityInfo.title`)}:
- ${t(`${translationKey}.securityInfo.expiry`)}
- ${t(`${translationKey}.securityInfo.oneTime`)}
- ${t(`${translationKey}.securityInfo.ignore`)}
- ${t(`${translationKey}.securityInfo.dontShare`)}

${t('common.signature')},
${t('common.teamName')}
        `.trim()

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: t(`${translationKey}.subject`),
            html: await generateBaseEmailTemplate('password-reset', htmlContent, userName),
            text: await generateBaseEmailText('password-reset', textContent, userName),
        }

        await transporter.sendMail(mailOptions)
        devLog(`✅ Password reset email sent to: ${email} (locale: ${locale})`)
        return true

    } catch (error) {
        devError('❌ Failed to send password reset email:', error)
        return false
    }
}

/**
 * PL: Wysyła email z kodem 2FA
 * EN: Sends 2FA code email
 * @param email - PL: Adres email odbiorcy | EN: Recipient email address
 * @param code - PL: Kod 2FA | EN: 2FA code
 * @param userName - PL: Opcjonalna nazwa użytkownika | EN: Optional user name
 * @returns PL: True jeśli email został wysłany pomyślnie | EN: True if email was sent successfully
 */
export async function send2FAEmail(
    email: string,
    code: string,
    userName?: string
): Promise<boolean> {
    try {
        const locale = await getLocale()
        const t = await getTranslations('email')
        const translationKey = 'twoFactor'

        const htmlContent = `
            <p style="color: #191919; margin: 16px 0;">${t(`${translationKey}.description`)}</p>
            
            <div class="code-box">
                <div class="code">${code}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">${t(`${translationKey}.enterCode`)}</p>
            </div>
            
            <div class="info-box">
                <p style="margin: 0; font-weight: 600; color: #191919;">${t(`${translationKey}.importantInfo.title`)}</p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #191919;">
                    <li>${t(`${translationKey}.importantInfo.expiry`)}</li>
                    <li>${t(`${translationKey}.importantInfo.onlyYou`)}</li>
                    <li>${t(`${translationKey}.importantInfo.dontShare`)}</li>
                </ul>
            </div>
            
            <p style="color: #191919; margin: 16px 0;">${t(`${translationKey}.securityNote`)}</p>
        `

        const textContent = `
${t(`${translationKey}.description`)}

${t(`${translationKey}.codeLabel`)}: ${code}

${t(`${translationKey}.importantInfo.title`)}:
- ${t(`${translationKey}.importantInfo.expiry`)}
- ${t(`${translationKey}.importantInfo.onlyYou`)}
- ${t(`${translationKey}.importantInfo.dontShare`)}

${t(`${translationKey}.securityNote`)}
        `.trim()

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: t(`${translationKey}.subject`),
            html: await generateBaseEmailTemplate('2fa', htmlContent, userName),
            text: await generateBaseEmailText('2fa', textContent, userName),
        }

        await transporter.sendMail(mailOptions)
        devLog(`✅ 2FA code sent to ${email} (locale: ${locale})`)
        return true

    } catch (error) {
        devError('❌ Error sending 2FA email:', error)
        return false
    }
}


/**
 * PL: Wysyła niestandardowy email z własną zawartością
 * EN: Sends custom email with custom content
 * @param to - PL: Adres email odbiorcy | EN: Recipient email address
 * @param subject - PL: Temat emaila | EN: Email subject
 * @param htmlContent - PL: Zawartość HTML | EN: HTML content
 * @param textContent - PL: Opcjonalna zawartość tekstowa | EN: Optional text content
 * @returns PL: True jeśli email został wysłany pomyślnie | EN: True if email was sent successfully
 */
export async function sendCustomEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
): Promise<boolean> {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html: htmlContent,
            text: textContent || htmlContent.replace(/<[^>]*>/g, ''),
        }

        await transporter.sendMail(mailOptions)
        devLog(`✅ Custom email sent to: ${to}`)
        return true

    } catch (error) {
        devError('❌ Failed to send custom email:', error)
        return false
    }
}