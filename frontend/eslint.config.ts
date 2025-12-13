import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";
import eslintConfigPrettier from "eslint-config-prettier";
import { includeIgnoreFile } from "@eslint/compat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default defineConfig([
  // Include ignore from .gitignore
  includeIgnoreFile(gitignorePath),

  // JS/TS files
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },

  // TypeScript recommended
  ...tseslint.configs.recommended,

  // React configs
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],

  // JSX Accessibility
  jsxA11y.flatConfigs.recommended,

  // TanStack plugins
  ...pluginRouter.configs["flat/recommended"],
  ...pluginQuery.configs["flat/recommended"],

  // Prettier
  eslintConfigPrettier,

  // Custom rules & settings
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/no-unknown-property": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "jsx-a11y/alt-text": [
        "warn",
        {
          elements: ["img"],
          img: ["Image"],
        },
      ],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      "react/jsx-no-target-blank": "off",
      "react/no-children-prop": [
        "error",
        {
          allowFunctions: true,
        },
      ],
    },
  },
]);
