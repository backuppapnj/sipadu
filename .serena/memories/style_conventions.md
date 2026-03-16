# Code Style & Conventions

## PHP
- PHP 8 constructor property promotion
- Explicit return type declarations and type hints
- PHPDoc blocks preferred over inline comments
- Curly braces for all control structures
- Enum keys: TitleCase
- Run `vendor/bin/pint --dirty --format agent` after PHP changes
- Use `php artisan make:*` commands to create files
- Form Request classes for validation (not inline)
- `Model::query()` over `DB::`
- Environment vars only in config files, use `config()` elsewhere

## TypeScript/React
- ESLint + Prettier for formatting
- Inertia.js pages in `resources/js/pages/`
- Wayfinder for route imports (`@/actions/`, `@/routes/`)
- Radix UI + CVA + Tailwind for components (Shadcn pattern)
- React 19 with React Compiler (babel-plugin-react-compiler)

## Testing
- Pest 4 for all tests
- Feature tests by default, `--unit` for unit tests
- Use model factories in tests
- Every change must be tested
