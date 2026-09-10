import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Xupyter One Account",
    short_name: "OneAccount",
    description:
      "Secure personal & team vault for account emails, passwords and notes. Google login, spaces for personal / company / clients.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "browser"],
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    categories: ["productivity", "utilities"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Go to your vault dashboard",
        url: "/dashboard",
        icons: [{ src: "/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Spaces",
        short_name: "Spaces",
        description: "Browse your spaces",
        url: "/dashboard",
        icons: [{ src: "/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    screenshots: [],
  };
}
