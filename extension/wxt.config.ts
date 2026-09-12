import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: ".",
  manifest: {
    name: "OneAccount Vault",
    description: "Search your OneAccount vault, copy credentials, matching current site.",
    version: "0.1.0",
    permissions: ["storage", "activeTab", "clipboardWrite"],
    host_permissions: ["http://localhost:3000/*", "https://*.xupyter.com/*", "https://one-account.*/*"],
    action: {},
  },
  modules: ["@wxt-dev/module-react"],
});
