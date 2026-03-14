# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Pokemon IV (Individual Values) calculator app. It runs entirely in the user's browser with no backend. Built with TypeScript + React.

## Language Policy

- All code, comments, documentation, and commit messages must be written in **English**.
- Respond to the user in **Japanese**.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint (with --fix)
npx vitest run       # Run all tests
npx vitest run path/to/file.test.ts  # Run a single test file
```

## TypeScript Type Safety Rules (Strictly Enforced)

TypeScript is a structurally typed language. Code that cannot compile without bypassing the type checker is semantically wrong. Do not work around type errors with assertions or `any` — fix the design so the types align naturally.

The following are **banned as errors** by eslint.config.js. Do not attempt to circumvent them.

- `any` type (`no-explicit-any`, all `no-unsafe-*` rules)
- `as` type assertion (`as const` is the only exception)
- `!` non-null assertion (`TSNonNullExpression` banned)
- `<Type>value` style type assertion
- Explicit type predicates (`x is Type`) — use Inferred Type Predicates (TypeScript 5.5+)
- `@ts-expect-error`, `@ts-ignore`, `@ts-nocheck` comments
- ESLint suppression comments (`eslint-comments/no-use` is error)
- `null` type — use `undefined` instead

### Per-directory Exceptions

- **`src/client/**`**: `null` restriction lifted (React relies on null)
- **`src/shared/unsafe/**`**: `is` and `as` are allowed (centralized boundary for type-unsafe operations)
- **Test files** (`*.test.ts`, `*.test.tsx`, `*.react-test.ts`, `*.react-test.tsx`): Type safety rules are largely relaxed

## Linting

Always run `npm run lint` (which uses `--fix`) instead of plain `eslint .`. Auto-fixable issues like import ordering should be corrected by ESLint itself, not manually.

## Code Style

- Indent: 4 spaces
- Quotes: double quotes
- Semicolons: required
- Brace style: 1tbs (single-line allowed)
- Imports: prefer `type` imports (`consistent-type-imports`), ordered by group and alphabetized
