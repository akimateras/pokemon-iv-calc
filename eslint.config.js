import eslintJs from "@eslint/js";
import typescriptEslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import commentsPlugin from "eslint-plugin-eslint-comments";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import stylisticEslintPlugin from "@stylistic/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";

const CONFIG_BASE = {
    files: [
        "**/*.ts",
        "**/*.tsx",
    ],
    ignores: [
        "dist/**",
        "**/node_modules",
        "vite.config.ts",
    ],
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parserOptions: {
            project: [
                "./tsconfig.json",
            ],
            tsconfigRootDir: import.meta.dirname,
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
    plugins: {
        "import-plugin": importPlugin,
        "unused-imports": unusedImportsPlugin,
        "eslint-comments": commentsPlugin,
        "@typescript-eslint": typescriptEslintPlugin,
        "@stylistic": stylisticEslintPlugin,
        "react-hooks": reactHooks,
        "react": react,
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};

// relax too strict rules by strict-type-checked and stylistic-type-checked
const RELAX_RULES = {
    // allow both of interface and type
    "@typescript-eslint/consistent-type-definitions": "off",

    // no forcing to use optional chaining
    "@typescript-eslint/prefer-optional-chain": "off",

    // allow implicit casting in template literals
    "@typescript-eslint/restrict-template-expressions": "off",

    // allow async functions without await; it is annoying when the interface requires promise as return value
    "@typescript-eslint/require-await": "off",

    // allow void promise
    "@typescript-eslint/no-misused-promises": [
        "error",
        {
            checksVoidReturn: false,
        },
    ],

    // allow empty class
    "@typescript-eslint/no-extraneous-class": "off",

    // allow dynamic delete on object
    "@typescript-eslint/no-dynamic-delete": "off",

    // these rules raise much false positive
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/no-unnecessary-type-parameters": "off",
    "@typescript-eslint/no-empty-function": "off",
}

const STYLE_RULES = {
    // coding styles: newlines
    "newline-per-chained-call": "off",
    "array-bracket-newline": ["error", "consistent"],
    "array-element-newline": ["error", "consistent"],
    "@stylistic/no-multiple-empty-lines": [
        "error",
        {
            max: 2,
            maxBOF: 0,
            maxEOF: 0,
        },
    ],

    // coding styles: indent and spacing
    "@stylistic/indent": ["error", 4],
    "@stylistic/indent-binary-ops": ["error", 4],
    "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
    "@stylistic/semi": ["error", "always"],

    // coding styles: quotes and delimiters
    "@stylistic/quotes": ["error", "double"],
    "@stylistic/member-delimiter-style": [
        "error",
        {
            multiline: {
                delimiter: "semi",
                requireLast: true,
            },
        },
    ],

    // coding styles: import
    "@typescript-eslint/consistent-type-imports": [
        "warn", { prefer: "type-imports" },
    ],
    "import-plugin/order": [
        "warn",
        {
            groups: [
                "index",
                "sibling",
                "parent",
                "internal",
                "external",
                "builtin",
                "object",
                "type",
            ],
            alphabetize: {
                order: "asc",
            },
        },
    ],
    "unused-imports/no-unused-imports": "error"
};

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
// CAUTION:
// DO NOT CHANGE THIS SECTION FOR THE PURPOSE OF SKIPPING TYPE SAFETY.
// `any`, `as`, `is` AND OTHER TYPE CRASHERS ARE BANNED INTENTIONALLY.
// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
const CODING_RULES = {
    // coding rules: unsafe types
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "no-restricted-syntax": [
        "error",
        {
            selector: "TSNonNullExpression",
            message: "Using non-null assertion is not allowed. Please ensure non-null on your code to enable transpiler to infer the type.",
        },
        {
            selector: "TSTypeAssertion",
            message: "Using type assertion is strictly banned.",
        },
        {
            selector: "TSAsExpression:not([typeAnnotation.type='TSTypeReference'][typeAnnotation.typeName.name='const'])",
            message: "Using `as` type assertion is strictly banned.",
        },
        {
            selector: "TSTypePredicate",
            message: "Using explicit type predicates is not allowed. Please consider using 'Inferred Type Predicates' (from TypeScript 5.5).",
        },
    ],
    "@typescript-eslint/ban-ts-comment": [
        "error",
        {
            'ts-expect-error': true,
            'ts-ignore': true,
            'ts-nocheck': true,
        },
    ],
    "eslint-comments/no-use": "error",

    // disallow null type
    "@typescript-eslint/no-restricted-types": ["error",
        {
            "types": {
                "null": {
                    "message": "Use `undefined` instead.",
                }
            }
        }
    ],

    // coding rules: variables
    "@typescript-eslint/no-unused-vars": [
        "warn",
        {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
        },
    ],

    // coding rules: others
    "@typescript-eslint/no-empty-object-type": "off",
};

const REACT_RULES = {
    ...reactHooks.configs.recommended.rules,
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
};

const CONFIG = {
    ...CONFIG_BASE,
    rules: {
        ...RELAX_RULES,
        ...CODING_RULES,
        ...STYLE_RULES,
        ...REACT_RULES,
    },
};

const CLIENT_DIRECTORY_CONFIG = {
    files: ["src/client/**/*"],
    rules: {
        // allow null; React loves null unfortunately
        "@typescript-eslint/no-restricted-types": "off"
    }
}

const UNSAFE_DIRECTORY_CONFIG = {
    // allow `is` and `as` keyword only in src/shared/unsafe directory
    files: ["src/shared/unsafe/**/*"],
    rules: {
        "no-restricted-syntax": [
            "error",
            {
                selector: "TSNonNullExpression",
                message: "Using non-null assertion is not allowed. Please ensure non-null on your code to enable transpiler to infer the type.",
            },
            {
                selector: "TSTypeAssertion",
                message: "Using type assertion is strictly banned.",
            },
            {
                selector: "TSAsExpression:not([typeAnnotation.type='TSTypeReference'][typeAnnotation.typeName.name='const'])",
                message: "Using `as` type assertion is strictly banned.",
            },
        ],
    },
};

const TEST_DIRECTORY_CONFIG = {
    // allow any unsafe codes in test cases
    files: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.react-test.ts", "src/**/*.react-test.tsx"],
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "no-restricted-syntax": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-restricted-types": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/unbound-method": "off",
        "import/no-restricted-paths": "off",
        "import-plugin/order": "off",
    },
}

export default typescriptEslint.config(
    {
        ignores: ["dist/**", "*.config.js", "*.config.ts"],
    },
    eslintJs.configs.recommended,
    ...typescriptEslint.configs.strictTypeChecked,
    ...typescriptEslint.configs.stylisticTypeChecked,
    CONFIG,
    CLIENT_DIRECTORY_CONFIG,
    UNSAFE_DIRECTORY_CONFIG,
    TEST_DIRECTORY_CONFIG,
);
