"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@heroui/react";

function CtaIllustration() {
  return (
    <svg
      viewBox="0 0 340 340"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden
    >
      {/* globe shadow */}
      <ellipse cx="170" cy="302" rx="82" ry="12" fill="#1E1B4B" opacity="0.08" />
      {/* main globe */}
      <circle cx="170" cy="150" r="108" fill="#6C52FF" opacity="0.08" />
      <circle cx="170" cy="150" r="96" fill="#A8D8EA" stroke="#1E1B4B" strokeWidth="1.2" />
      <circle cx="170" cy="150" r="96" fill="url(#globeGrad)" opacity="0.9" />
      <defs>
        <radialGradient id="globeGrad" cx="0.35" cy="0.3" r="1">
          <stop offset="0%" stopColor="#E8F0FF" />
          <stop offset="55%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </radialGradient>
      </defs>
      {/* continents - simple abstract shapes */}
      <path
        d="M118 132 C128 118 148 110 170 116 C186 120 200 138 196 156 C192 172 176 186 158 188 C138 189 120 174 118 150 Z"
        fill="#86EFAC"
        stroke="#166534"
        strokeWidth="0.8"
        opacity="0.95"
      />
      <path
        d="M192 108 C208 102 228 108 236 126 C242 142 238 164 218 172 C204 178 188 170 184 150 C180 130 176 114 192 108 Z"
        fill="#86EFAC"
        stroke="#166534"
        strokeWidth="0.8"
        opacity="0.95"
      />
      <path d="M138 188 C150 200 172 206 190 198 C188 212 174 222 156 220 C140 218 128 202 138 188 Z" fill="#86EFAC" stroke="#166534" strokeWidth="0.8" opacity="0.85" />
      {/* grid lines */}
      <ellipse cx="170" cy="150" rx="96" ry="38" stroke="white" strokeOpacity="0.35" strokeWidth="1" />
      <ellipse cx="170" cy="150" rx="96" ry="66" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
      <ellipse cx="170" cy="150" rx="42" ry="96" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
      <ellipse cx="170" cy="150" rx="68" ry="96" stroke="white" strokeOpacity="0.22" strokeWidth="1" />
      <line x1="74" y1="150" x2="266" y2="150" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
      {/* people around globe - 8 diverse figures */}
      {/* top */}
      <g transform="translate(170 30)">
        <circle cx="0" cy="8" r="11" fill="#1E1B4B" />
        <circle cx="0" cy="7" r="7" fill="#FDBA74" />
        <path d="M-10 22 C-10 18 -5 16 0 16 C5 16 10 18 10 22 L8 32 L-8 32 Z" fill="#F97316" />
        <circle cx="0" cy="7" r="7" fill="#FDBA74" />
        <path d="M-4 10 C-4 10 -2 12 0 12 C2 12 4 10 4 10" stroke="#1E1B4B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </g>
      {/* top-right */}
      <g transform="translate(248 62) rotate(32)">
        <circle cx="0" cy="8" r="11" fill="#1E1B4B" />
        <circle cx="0" cy="7" r="7" fill="#F9A8D4" />
        <path d="M-10 22 C-10 17 -4 15 0 15 C4 15 10 17 10 22 L8 32 L-8 32 Z" fill="#0EA5E9" />
      </g>
      {/* right */}
      <g transform="translate(286 132) rotate(72)">
        <circle cx="0" cy="8" r="11" fill="#1E1B4B" />
        <circle cx="0" cy="7" r="7" fill="#FDBA74" />
        <path d="M-9 22 L9 22 L7 32 L-7 32 Z" fill="#EAB308" />
      </g>
      {/* bottom-right */}
      <g transform="translate(250 230) rotate(128)">
        <circle cx="0" cy="8" r="11" fill="#1E1B4B" />
        <circle cx="0" cy="7" r="7" fill="#7DD3FC" />
        <path d="M-10 22 C-10 16 -3 15 0 15 C3 15 10 16 10 22 L8 32 L-8 32 Z" fill="#1E1B4B" />
      </g>
      {/* bottom */}
      <g transform="translate(170 266) rotate(180)">
        <circle cx="0" cy="8" r="11" fill="#1E1B4B" />
        <circle cx="0" cy="7" r="7" fill="#FDBA74" />
        <path d="M-10 22 C-10 17 -4 15 0 15 C4 15 10 17 10 22 L8 32 L-8 32 Z" fill="#6C52FF" />
      </g>
      {/* bottom-left */}
      <g transform="translate(86 230) rotate(-128)">
        <circle cx="0" cy="8" r="11" fill="#1E1B4B" />
        <circle cx="0" cy="7" r="7" fill="#FDBA74" />
        <path d="M-10 22 C-10 16 -3 15 0 15 C3 15 10 16 10 22 L8 32 L-8 32 Z" fill="#F43F5E" />
      </g>
      {/* left */}
      <g transform="translate(54 132) rotate(-72)">
        <circle cx="0" cy="8" r="11" fill="#1E1B4B" />
        <circle cx="0" cy="7" r="7" fill="#F9A8D4" />
        <path d="M-10 22 C-10 17 -4 15 0 15 C4 15 10 17 10 22 L8 32 L-8 32 Z" fill="#14B8A6" />
      </g>
      {/* top-left */}
      <g transform="translate(90 62) rotate(-32)">
        <circle cx="0" cy="8" r="11" fill="#1E1B4B" />
        <circle cx="0" cy="7" r="7" fill="#FDBA74" />
        <path d="M-10 22 C-10 17 -4 15 0 15 C4 15 10 17 10 22 L8 32 L-8 32 Z" fill="#8B5CF6" />
      </g>
      {/* small satellite dots */}
      <circle cx="48" cy="88" r="3" fill="#6C52FF" opacity="0.5" />
      <circle cx="292" cy="88" r="2.5" fill="#6C52FF" opacity="0.4" />
      <circle cx="294" cy="208" r="3" fill="#6C52FF" opacity="0.45" />
    </svg>
  );
}

type FaqItem = {
  q: string;
  a: string;
};

const FAQS: FaqItem[] = [
  {
    q: "What is One Account?",
    a: "One Account is a secure vault for account credentials — every login lives in a space. Create spaces for Personal, Company or Client work, add entries with email, password, URL and notes, and keep personal and client secrets strictly isolated. Google-only login means no master password to forget.",
  },
  {
    q: "How does pricing work?",
    a: "One Account is free to get started. Create unlimited spaces and entries, generate passwords, and use import/export at no cost while in early access. Paid team features and advanced encryption options will be optional — your vault always remains yours.",
  },
  {
    q: "Are my passwords encrypted and safe?",
    a: "Your vault is private by default and gated by NextAuth + Postgres. Only the owner of a space can view its entries, deleting a space cascade-deletes its entries, and the app never stores your Google credential — only the account passwords you choose to save.",
  },
  {
    q: "How do spaces and categories work?",
    a: "Spaces have a type — personal, company or client — plus a custom color and icon. Inside each space, categories group entries (e.g. Gmail, Banking, Hosting) with their own icon, color and logo. Filter the dashboard by type or category and switch between Comfortable and Compact views.",
  },
  {
    q: "Can I import, export or move accounts in bulk?",
    a: "Yes. Import from CSV / TXT, export any space to CSV, and bulk-transfer or bulk-delete across spaces. One Account also keeps the generator one click away — generate a Password, PIN or passphrase and save it straight into any space.",
  },
  {
    q: "Can I use One Account in my country?",
    a: "Yes — One Account works anywhere you have a Google account. Data is stored in Postgres, the public site and generator are available without sign-in, and your private vault is accessible on any device after Google sign-in.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {FAQS.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={item.q} className={idx !== FAQS.length - 1 ? "border-b border-border" : ""}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : idx)}
              className="flex w-full items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left transition-colors hover:bg-muted/40"
              aria-expanded={isOpen}
            >
              <span className="text-[13px] sm:text-sm font-semibold text-foreground pr-2">{item.q}</span>
              <span
                className={[
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isOpen
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-muted border-border text-muted-foreground",
                ].join(" ")}
                aria-hidden
              >
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div
              className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-[13px] sm:text-sm leading-6 text-muted-foreground">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LandingCtaFaq({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <>
      {/* CTA */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20 lg:py-24">
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="flex flex-col gap-4 sm:gap-5 max-w-xl">
              <span className="inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-[11px] font-bold tracking-wide text-primary-foreground">
                Ready to get started?
              </span>
              <h2 className="font-header text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-foreground text-balance">
                Join thousands organizing
                <br />
                accounts with One Account
              </h2>
              <p className="text-sm sm:text-[15px] leading-6 text-muted-foreground max-w-[52ch]">
                Start storing securely today and keep every account — personal, company or client — in one trusted vault.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                  <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6">
                    {isLoggedIn ? "Go to Dashboard" : "Create an Account"}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              {/* subtle background blur */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-60">
                <div className="h-64 w-64 sm:h-72 sm:w-72 rounded-full bg-primary/10 blur-2xl" />
              </div>
              <div className="w-full max-w-[360px] sm:max-w-[420px] aspect-square">
                <CtaIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-10">
            <h2 className="font-header text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Everything you need to know about your vault.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <FaqAccordion />
          </div>
        </div>
      </section>
    </>
  );
}
