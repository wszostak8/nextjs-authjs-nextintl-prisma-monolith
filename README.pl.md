# 🔐 Next.js 15+, React 19+, Auth.js, Prisma, Next-intl – System autoryzacji (wersja monolith)

Support NodeJS Edge Runtime

> System autoryzacji oparty na Next.js 15+, React 19+ i Auth.js v5
> MongoDB z użyciem Prisma ORM. Pełne wsparcie wielojęzyczności dzięki next-intl.
> Scenariusze użycia dostępne w katalogu `/diagrams/usecases`.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?style=for-the-badge\&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge\&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge\&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-3982CE?style=for-the-badge\&logo=prisma)
![Auth.js](https://img.shields.io/badge/Auth.js-5.0-purple?style=for-the-badge)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black?style=for-the-badge)

[**🇺🇸 English README**](README.md) • [**📋 Zobacz diagramy UML**](#-diagramy-uml)

</div>

## 📖 Opis

Kompletny system uwierzytelniania oferujący bezpieczną rejestrację, logowanie i zarządzanie kontem. Obsługuje pełną internacjonalizację (PL/EN), 2FA oraz logowanie przez popularnych dostawców OAuth. Dane przechowywane w MongoDB z użyciem Prisma. Hasła szyfrowane algorytmem Argon2id.

## ✨ Kluczowe funkcje

### 🔐 Uwierzytelnianie

* Rejestracja i logowanie za pomocą emaila i hasła (z walidacją Zod)
* Szyfrowanie haseł z użyciem Argon2id
* Sesje JWT z automatycznym odświeżaniem (24h)
* Walidacja formularzy w czasie rzeczywistym
* Przełącznik widoczności hasła

### 🌐 Integracja z OAuth

* Google, GitHub, Facebook, LinkedIn, Apple
* Automatyczne łączenie i tworzenie kont
* Bezpieczna obsługa callbacków

### 🔒 Uwierzytelnianie dwuskładnikowe (2FA)

* 6-cyfrowe kody wysyłane e-mailem
* Ważność kodu: 10 minut
* Timer odliczający czas ponownej wysyłki (60 sekund)
* Domyślnie włączone dla wszystkich kont
* Bezpieczna obsługa (ukryte pola)

### 📧 Zarządzanie hasłem

* Reset hasła przez email z tokenem (ważny 60 minut)
* Automatyczna weryfikacja linku
* Walidacja formatu tokena

### ✉️ System e-mailowy

* Szablony HTML i tekstowe w wersji PL/EN
* Weryfikacja e-maila (token ważny 24h)
* Responsywne, stylizowane wiadomości
* Integracja z Nodemailer

### 🌍 Internacjonalizacja

* Pełne wsparcie dla języka polskiego i angielskiego
* Dynamiczna zmiana języka
* Przetłumaczone powiadomienia i błędy
* Lokalizacja przez ścieżki URL

## 🛠️ Stos technologiczny

| **Frontend** | **Backend**   | **Baza danych** | **Uwierzytelnianie** |
| ------------ | ------------- | --------------- | -------------------- |
| Next.js 15   | API Next.js   | MongoDB         | Auth.js v5           |
| React 19     | Prisma ORM    | MongoDB Atlas   | JWT                  |
| TypeScript 5 | Walidacja Zod | —               | OAuth 2.0            |
| Tailwind CSS | Nodemailer    | —               | Argon2id             |
| shadcn/ui    | next-intl     | —               | —                    |
| Sonner       | —             | —               | —                    |

## 🚀 Instalacja

### Wymagania

* Node.js 18+
* MongoDB (lokalnie lub przez Atlas)
* SMTP (np. Gmail lub Mailtrap)

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith.git
cd nextjs-authjs-nextintl-prisma-monolith
```

### 2. Instalacja zależności

```bash
npm install
# lub
yarn install
```

### 3. Konfiguracja środowiska

```bash
cp .env.example .env.local
```

### 4. Zmienne środowiskowe

```env
# Baza danych
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dbname"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# SMTP
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# OAuth dostawcy
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
...
```

### 5. Konfiguracja Prisma

```bash
npx prisma generate
npx prisma db push
```

### 6. Uruchomienie aplikacji

```bash
npm run dev
# lub
yarn dev
```

Dostępne pod `http://localhost:3000`

## 📊 Diagramy UML

Dostępne w katalogu `/diagrams/usecases/`:

* `auth_system_overview.png`
* `registration_login_flow.png`
* `password_management_flow.png`
* `2fa_authentication_flow.png`
* `oauth_flow_diagram.png`

## 🔧 Główne komponenty

### Akcje serwera

* `registerUser()` — rejestracja z walidacją i szyfrowaniem hasła
* `loginUser()` — logowanie z obsługą 2FA
* `requestPasswordReset()` — rozpoczęcie resetu hasła
* `resetPasswordWithToken()` — reset hasła przez token
* `verify2FACode()` — walidacja kodu 2FA
* `signInByProvider()` — logowanie przez OAuth

### Komponenty UI

* `AuthOverlay`, `LoginForm`, `RegisterForm`, `LoginByProvider`, `Toaster`

### Strony

* `/auth` — logowanie i rejestracja
* `/auth/reset` — reset hasła
* `/auth/verify-email` — weryfikacja e-maila
* `/auth/verify-2fa` — kod 2FA
* `/dashboard` — strefa chroniona

### Modele bazy danych (Prisma)

* `User` — zawiera e-mail, hasło, tokeny, dane 2FA
* Przechowywanie tokenów resetujących, weryfikacyjnych i 2FA

## 🛡️ Zabezpieczenia

* Hashowanie haseł: **Argon2id**
* Sesje JWT
* CSRF zabezpieczenia (Auth.js)
* HTTP-only cookies
* Walidacja danych (Zod)
* Wygasające tokeny i kody

## 🎯 Kluczowe przepływy

### Rejestracja

1. Formularz + walidacja Zod
2. Hashowanie hasła (Argon2id)
3. Zapis użytkownika przez Prisma
4. Wysłanie maila weryfikacyjnego
5. Przekierowanie na ekran weryfikacji

### Logowanie

1. Dane logowania
2. Weryfikacja emaila i hasła
3. Jeśli 2FA → kod weryfikacyjny
4. Utworzenie sesji

### 2FA

1. Generowanie kodu
2. Wysyłka na e-mail
3. Weryfikacja kodu
4. Utworzenie sesji

### OAuth

1. Wybór dostawcy
2. Przekierowanie do dostawcy
3. Logowanie
4. Połączenie / utworzenie konta
5. Sesja

## 🔄 System tokenów

* **Tokeny resetu**: 60 min, format hex
* **Tokeny weryfikacji**: 24h, format hex
* **Kody 2FA**: 6 cyfr, 10 minut
* Automatyczne usuwanie przeterminowanych tokenów

## 📧 Szablony e-maili

* Przetłumaczone (PL/EN)
* Weryfikacja, reset, 2FA
* Responsywne HTML + tekstowe wersje
* Profesjonalny wygląd

## 🌍 Internacjonalizacja

* Obsługa PL (domyślny) i EN
* Routing przez ścieżki (`/pl/auth`, `/en/auth`)
* Przełączanie języka w czasie rzeczywistym
* Tłumaczenia komunikatów + e-maili

## 📝 Licencja

Projekt na licencji [MIT](LICENSE)

## 🤝 Współpraca

1. Forkuj repo
2. Utwórz branch
3. Wprowadź zmiany
4. Otwórz Pull Request

## 📞 Wsparcie

Zgłoś problem: [GitHub Issues](https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith/issues)

---

<div align="center">
<p>Stworzone z ❤️ przez <b>@wszostak8</b></p>

[![GitHub stars](https://img.shields.io/github/stars/wszostak8/nextjs-authjs-nextintl-prisma-monolith?style=social)](https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith)

</div>

---