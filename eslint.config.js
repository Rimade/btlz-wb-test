import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    js.configs.recommended,
    {
        files: ["src/**/*.ts", "src/**/*.js"],
        languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaVersion: "latest", sourceType: "module" },
            globals: { console: "readonly", process: "readonly", Buffer: "readonly" },
        },
        plugins: { "@typescript-eslint": tseslint },
        rules: {
            ...tseslint.configs.recommended.rules,
        },
    },
    eslintConfigPrettier,
    { ignores: ["dist/**", "node_modules/**", "**/*.test.ts", "**/*.spec.ts"] },
];
