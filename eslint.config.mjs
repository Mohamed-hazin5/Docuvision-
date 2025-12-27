// ESLint flat config
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.js", // Ignore JS files if they are causing issues
    ],
  },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
