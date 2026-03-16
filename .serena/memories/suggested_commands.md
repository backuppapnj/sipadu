# Suggested Commands

## Development
- `composer run dev` - Start all dev servers (Laravel, queue, logs, Vite)
- `npm run dev` - Vite dev server only
- `npm run build` - Build frontend assets
- `php artisan serve` - Laravel dev server only

## Testing
- `php artisan test --compact` - Run all tests
- `php artisan test --compact --filter=testName` - Run specific test
- `php artisan make:test --pest {name}` - Create feature test
- `php artisan make:test --pest --unit {name}` - Create unit test

## Linting & Formatting
- `vendor/bin/pint --dirty --format agent` - Fix PHP style (changed files)
- `vendor/bin/pint --format agent` - Fix all PHP style
- `npm run lint` - Fix JS/TS lint issues
- `npm run lint:check` - Check JS/TS lint
- `npm run format` - Format with Prettier
- `npm run format:check` - Check Prettier formatting
- `npm run types:check` - TypeScript type checking

## CI Check
- `composer run ci:check` - Full CI (lint, format, types, tests)

## Artisan
- `php artisan make:model {name}` - Create model
- `php artisan make:controller {name}` - Create controller
- `php artisan make:migration {name}` - Create migration
- `php artisan migrate` - Run migrations
- `php artisan route:list` - List routes
- `php artisan tinker --execute "code"` - Execute PHP code

## Git (system)
- `git status`, `git diff`, `git log --oneline -10`
