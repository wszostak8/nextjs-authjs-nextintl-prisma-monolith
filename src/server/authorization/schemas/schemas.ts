import { z } from 'zod'

/**
 * PL: Schematy walidacji dla funkcji uwierzytelniających
 * EN: Validation schemas for authentication functions
 */
export const registerSchema = z.object({
    name: z.string().min(2).trim(),
    email: z.string().trim(),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export  const loginSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z.string().min(1, "Password is required"),
})

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
})

export const newPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    token: z.string().min(1, "Token is required"),
})
