# 🔐 Next.js 15+, React 19+, Auth.js, Prisma, Next-intl Authorization System – monolith version

Support NodeJS Edge Runtime

> Authorization system based on NextJS 15+, React 19+, and Auth.js v5
> MongoDB via Prisma ORM. Full multilingual support thanks to next-intl.
> Use case scenarios available in `/diagrams/usecases`.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?style=for-the-badge\&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge\&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge\&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-3982CE?style=for-the-badge\&logo=prisma)
![Auth.js](https://img.shields.io/badge/Auth.js-5.0-purple?style=for-the-badge)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black?style=for-the-badge)

[**🇵🇱 Polish README**](README.pl.md) • [**📋 View UML Diagrams**](#-uml-diagrams)

</div>

## 📖 Description

A comprehensive authentication system offering secure user registration, login, and account management. Includes full internationalization (Polish/English), 2FA, and support for popular OAuth providers. Uses Prisma with MongoDB for data storage and Argon2id for secure password hashing.

## ✨ Key Features

### 🔐 Authentication

* Email/password registration and login with Zod validation
* Secure password hashing with Argon2id
* JWT sessions with auto-refresh (24h)
* Real-time form validation
* Password visibility toggle

### 🌐 OAuth Integration

* Google, GitHub, Facebook, LinkedIn, Apple
* Automatic account linking and creation
* Secure callback handling

### 🔒 Two-Factor Authentication (2FA)

* 6-digit codes sent via email
* Expire after 10 minutes
* Cooldown timer (60 seconds)
* Enabled by default for all accounts
* Secure handling with hidden fields

### 📧 Password Management

* Reset via email with token (valid 60 minutes)
* Secure links and automatic email verification
* Token format validation

### ✉️ Email System

* Localized HTML and plaintext templates
* Email verification (token valid 24h)
* Styled messages with responsive layout
* Nodemailer integration

### 🌍 Internationalization

* Full Polish and English support
* Dynamic language switching
* Localized notifications and error messages
* URL-based locale routing

## 🛠️ Tech Stack

| **Frontend** | **Backend**    | **Database**  | **Auth**     |
| ------------ | -------------- | ------------- | ------------ |
| Next.js 15   | Next.js API    | MongoDB       | Auth.js v5   |
| React 19     | Prisma ORM     | MongoDB Atlas | JWT Sessions |
| TypeScript 5 | Zod Validation | —             | OAuth 2.0    |
| Tailwind CSS | Nodemailer     | —             | Argon2id     |
| shadcn/ui    | next-intl      | —             | —            |
| Sonner       | —              | —             | —            |

## 🚀 Installation

### Requirements

* Node.js 18+
* MongoDB (local or Atlas)
* SMTP server for emails

### 1. Clone Repository

```bash
git clone https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith.git
cd nextjs-authjs-nextintl-prisma-monolith
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

```bash
cp .env.example .env.local
```

### 4. Environment Variables

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dbname"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
...
```

### 5. Prisma Setup

```bash
npx prisma generate
npx prisma db push
```

### 6. Run Development Server

```bash
npm run dev
# or
yarn dev
```

App will be available at `http://localhost:3000`

## 📊 UML Diagrams

Available in `/diagrams/usecases/`:

* `auth_system_overview.png`
* `registration_login_flow.png`
* `password_management_flow.png`
* `2fa_authentication_flow.png`
* `oauth_flow_diagram.png`

## 🔧 Main Components

### Server Actions

* `registerUser()` — user registration with validation and password hashing
* `loginUser()` — login with email + password and optional 2FA
* `requestPasswordReset()` — triggers password reset flow
* `resetPasswordWithToken()` — resets user password
* `verify2FACode()` — validates user-entered 2FA code
* `signInByProvider()` — OAuth login logic

### UI Components

* `AuthOverlay`, `LoginForm`, `RegisterForm`, `LoginByProvider`, `Toaster`

### Pages

* `/auth` — login and registration
* `/auth/reset` — reset password
* `/auth/verify-email` — verify email address
* `/auth/verify-2fa` — enter 2FA code
* `/dashboard` — protected user area

### Database Models (via Prisma)

* `User` — includes email, password hash, tokens, and 2FA fields
* Token storage for password reset, verification, and 2FA codes

## 🛡️ Security Features

* Password hashing: **Argon2id**
* JWT session management
* CSRF protection via Auth.js
* Secure HTTP-only cookies
* Zod-based validation
* Expiring tokens and code cooldown

## 🎯 Key Flows

### Registration

1. Fill form → validate with Zod
2. Hash password (Argon2id)
3. Save user via Prisma to MongoDB
4. Send verification email
5. Redirect to verification screen

### Login

1. Submit credentials
2. Check email + password
3. If 2FA enabled → verify code
4. Create session

### 2FA

1. Generate code
2. Send via email
3. Validate on input
4. Start session on success

### OAuth

1. Select provider
2. Redirect to provider
3. Authenticate
4. Link or create account
5. Start session



## 🔄 Token System

* **Reset tokens**: 60 min, hex format
* **Verification tokens**: 24h, hex format
* **2FA codes**: 6-digit numeric, 10 min
* Automatic cleanup of expired tokens

## 📧 Email Templates

* Localized (PL/EN)
* Verification, password reset, 2FA
* Responsive HTML + plaintext
* Professional design

## 🌍 Internationalization

* Polish (default) and English support
* URL-based routing (`/pl/auth`, `/en/auth`)
* Runtime language switching
* Translated system messages + emails

## 📝 License

Licensed under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork repo
2. Create branch
3. Commit changes
4. Open PR

## 📞 Support

Open an issue here: [GitHub Issues](https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith/issues)

---

<div align="center">
<p>Made with ❤️ by <b>@wszostak8</b></p>

[![GitHub stars](https://img.shields.io/github/stars/wszostak8/nextjs-authjs-nextintl-prisma-monolith?style=social)](https://github.com/wszostak8/nextjs-authjs-mongoose-nextintl-monolith)

</div>

---