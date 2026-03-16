# Task Completion Checklist

After completing any task, run these steps:

1. **PHP formatting**: `vendor/bin/pint --dirty --format agent`
2. **JS/TS lint**: `npm run lint:check`
3. **Prettier**: `npm run format:check`
4. **TypeScript**: `npm run types:check`
5. **Tests**: `php artisan test --compact` (or filtered)
6. **Wayfinder**: If routes changed, Wayfinder auto-generates on build/dev
