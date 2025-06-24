/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import { argon2id } from '@noble/hashes/argon2'
import { randomBytes } from '@noble/hashes/utils'

export function hashPassword(password: string): string {
    const salt = randomBytes(16)
    const hash = argon2id(password, salt, { t: 3, m: 65536, p: 4, dkLen: 32 })
    return `${Buffer.from(salt).toString('hex')}:${Buffer.from(hash).toString('hex')}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
    try {
        const [saltHex, hashHex] = storedHash.split(':')
        if (!saltHex || !hashHex) return false

        const salt = Buffer.from(saltHex, 'hex')
        const hash = argon2id(password, salt, { t: 3, m: 65536, p: 4, dkLen: 32 })
        const storedHashBuffer = Buffer.from(hashHex, 'hex')

        return Buffer.compare(hash, storedHashBuffer) === 0
    } catch {
        return false
    }
}