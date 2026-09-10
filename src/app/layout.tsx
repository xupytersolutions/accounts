import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora, Bebas_Neue, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "OneAccount",
  title: {
    default: "Xupyter One Account — Accounts, organized",
    template: "%s | OneAccount",
  },
  description:
    "OneAccount by Xupyter — secure vault for all your logins. Organize personal, company & client accounts in spaces, with Google sign-in, encrypted passwords and instant search.",
  keywords: ["password manager", "account vault", "Xupyter", "OneAccount", "spaces", "secure vault", "google login"],
  authors: [{ name: "Xupyter", url: siteUrl }],
  creator: "Xupyter",
  publisher: "Xupyter",
  category: "productivity",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "OneAccount",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon.ico" }],
    other: [{ rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "OneAccount",
    title: "Xupyter One Account — Accounts, organized",
    description: "All your accounts, neatly organized in spaces. Secure vault with spaces for personal / company / clients.",
    images: [
      {
        url: "/favicons/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "OneAccount",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Xupyter One Account — Accounts, organized",
    description: "Secure vault for all your logins. Organize in spaces, sync everywhere.",
    images: ["/favicons/android-chrome-512x512.png"],
  },
  verification: {},
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f12" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${sora.variable} ${bebas.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
