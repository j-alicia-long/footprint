import webConfig from "@j-alicia-long/web-config/eslint";

export default [
  { ignores: ["dist", "node_modules"] },
  ...webConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    // Node build scripts run outside the browser
    files: ["scripts/**/*.js"],
    languageOptions: { globals: { console: "readonly", process: "readonly" } },
  },
];
