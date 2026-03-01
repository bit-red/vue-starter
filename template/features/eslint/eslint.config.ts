import pluginVue from "eslint-plugin-vue";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import vueParser from "vue-eslint-parser";

export default [
  {
    files: ["**/*.{ts,tsx,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      vue: pluginVue,
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...pluginVue.configs["flat/essential"].rules,
      ...tseslint.configs.recommended?.rules,
    },
  },
  prettier,
  {
    ignores: ["dist/", "node_modules/"],
  },
];
