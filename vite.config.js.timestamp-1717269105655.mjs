// vite.config.js
import { defineConfig } from "file:///home/remmel/workspace/findinvoice-chrome-extension/node_modules/vite/dist/node/index.js";
import { crx } from "file:///home/remmel/workspace/findinvoice-chrome-extension/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "Invoice Downloader - crxjs",
  version: "1.0",
  description: "Downloads invoices automatically from Orange, FreeMobile, OpenAI...",
  permissions: [
    "activeTab",
    "scripting",
    "storage",
    "downloads",
    "tabs",
    "webNavigation",
    "webRequest",
    "debugger"
  ],
  action: { default_popup: "index.html" },
  options_page: "index.html",
  content_scripts: [
    {
      js: ["src/content.ts"],
      matches: ["https://www.google.com/*"]
    }
  ]
};

// vite.config.js
var vite_config_default = defineConfig({
  plugins: [crx({ manifest: manifest_default })]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9yZW1tZWwvd29ya3NwYWNlL2ZpbmRpbnZvaWNlLWNocm9tZS1leHRlbnNpb25cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3JlbW1lbC93b3Jrc3BhY2UvZmluZGludm9pY2UtY2hyb21lLWV4dGVuc2lvbi92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9yZW1tZWwvd29ya3NwYWNlL2ZpbmRpbnZvaWNlLWNocm9tZS1leHRlbnNpb24vdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgY3J4IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJ1xuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4vbWFuaWZlc3QuanNvbidcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbY3J4KHsgbWFuaWZlc3QgfSldLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlUsU0FBUyxvQkFBb0I7QUFDeFcsU0FBUyxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdwQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTLENBQUMsSUFBSSxFQUFFLDJCQUFTLENBQUMsQ0FBQztBQUMvQixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
