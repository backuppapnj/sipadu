# SIPADU - Project Overview

## Purpose
SIPADU is a Laravel 12 web application (likely "Sistem Informasi Paduan" or similar). Currently based on the Laravel React starter kit with authentication features.

## Tech Stack
- **Backend**: PHP 8.4, Laravel 12, Fortify (auth)
- **Frontend**: React 19, TypeScript, Inertia.js v2, Tailwind CSS v4, Radix UI, Shadcn-style components
- **Routing**: Laravel Wayfinder (TypeScript route generation)
- **Build**: Vite 7, laravel-vite-plugin
- **Testing**: Pest 4, PHPUnit 12
- **Linting**: Laravel Pint (PHP), ESLint + Prettier (TS/JS)

## Project Structure
```
app/
  Actions/Fortify/     - Auth actions (create user, reset password)
  Concerns/            - Shared traits (validation rules)
  Http/Controllers/    - Controllers (Settings: Profile, Security)
  Http/Middleware/      - HandleAppearance, HandleInertiaRequests
  Http/Requests/       - Form requests (Settings validation)
  Models/              - User model
  Providers/           - AppServiceProvider, FortifyServiceProvider
resources/js/
  pages/               - Inertia pages (auth/*, settings/*, dashboard, welcome)
  components/          - UI components (Shadcn/Radix based)
  layouts/             - Page layouts
  hooks/               - React hooks
  lib/                 - Utilities
  actions/, routes/    - Wayfinder generated files
  types/               - TypeScript types
```

## Current Features
- Authentication (login, register, forgot/reset password, email verification, 2FA)
- Settings (profile, security, appearance)
- Dashboard (placeholder)
