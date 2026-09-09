"use client";

import Link from "next/link";
import { Button } from "@heroui/react";

// --- vector illustrations: flat, minimal, pastel cards + black silhouettes + purple accent (#6C52FF) ---

function IllustrationSpaces() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
      {/* cards */}
      <rect x="56" y="52" width="112" height="132" rx="14" fill="white" stroke="#111" strokeWidth="1.2" />
      <rect x="56" y="52" width="112" height="28" rx="14" fill="#006FEE" />
      <rect x="68" y="96" width="88" height="8" rx="4" fill="#E8E8F0" />
      <rect x="68" y="110" width="64" height="8" rx="4" fill="#E8E8F0" />
      <rect x="68" y="128" width="76" height="8" rx="4" fill="#E8E8F0" />
      <text x="112" y="70" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Personal</text>

      <rect x="184" y="72" width="112" height="132" rx="14" fill="white" stroke="#111" strokeWidth="1.2" />
      <rect x="184" y="72" width="112" height="28" rx="14" fill="#17C964" />
      <rect x="196" y="116" width="88" height="8" rx="4" fill="#E8E8F0" />
      <rect x="196" y="130" width="64" height="8" rx="4" fill="#E8E8F0" />
      <rect x="196" y="148" width="76" height="8" rx="4" fill="#E8E8F0" />
      <text x="240" y="90" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Company</text>

      <rect x="312" y="52" width="112" height="132" rx="14" fill="white" stroke="#111" strokeWidth="1.2" />
      <rect x="312" y="52" width="112" height="28" rx="14" fill="#F5A524" />
      <rect x="324" y="96" width="88" height="8" rx="4" fill="#E8E8F0" />
      <rect x="324" y="110" width="64" height="8" rx="4" fill="#E8E8F0" />
      <rect x="324" y="128" width="76" height="8" rx="4" fill="#E8E8F0" />
      <text x="368" y="70" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Clients</text>

      {/* person left */}
      <circle cx="42" cy="232" r="14" fill="#111" />
      <rect x="30" y="248" width="24" height="52" rx="6" fill="#111" />
      <rect x="20" y="252" width="10" height="28" rx="5" fill="#111" />
      <rect x="44" y="252" width="10" height="28" rx="5" fill="#111" />
      {/* person right */}
      <circle cx="438" cy="232" r="14" fill="#111" />
      <path d="M426 248 C426 248 422 260 430 270 L446 270 C454 260 450 248 450 248 Z" fill="white" stroke="#111" strokeWidth="1" />
      <rect x="426" y="268" width="24" height="32" rx="4" fill="#111" />
      {/* connection dots */}
      <circle cx="168" cy="122" r="6" fill="#6C52FF" stroke="white" strokeWidth="1.5" />
      <circle cx="312" cy="142" r="6" fill="#111" stroke="white" strokeWidth="1.5" />
      <path d="M168 122 H200 M280 142 H312" stroke="#6C52FF" strokeWidth="1.2" strokeDasharray="4 3" />
    </svg>
  );
}

function IllustrationEntries() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
      <rect x="120" y="36" width="240" height="208" rx="16" fill="white" stroke="#111" strokeWidth="1.2" />
      <rect x="120" y="36" width="240" height="36" rx="16" fill="#111" />
      <rect x="136" y="48" width="84" height="12" rx="6" fill="white" fillOpacity="0.9" />
      <circle cx="336" cy="54" r="6" fill="white" fillOpacity="0.2" />
      <circle cx="348" cy="54" r="6" fill="white" fillOpacity="0.2" />
      {/* rows */}
      <rect x="140" y="88" width="200" height="28" rx="10" fill="#F4F4F5" stroke="#E4E4E7" />
      <circle cx="158" cy="102" r="10" fill="#E8E6FF" />
      <text x="158" y="106" textAnchor="middle" fontSize="10">✉️</text>
      <rect x="176" y="96" width="88" height="6" rx="3" fill="#111" fillOpacity="0.8" />
      <rect x="176" y="106" width="56" height="6" rx="3" fill="#A1A1AA" />
      <circle cx="322" cy="102" r="10" fill="white" stroke="#E4E4E7" />
      <path d="M318 102 L322 106 L328 98" stroke="#6C52FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="140" y="124" width="200" height="28" rx="10" fill="white" stroke="#E4E4E7" />
      <circle cx="158" cy="138" r="10" fill="#E0F2FF" />
      <text x="158" y="142" textAnchor="middle" fontSize="10">🔑</text>
      <rect x="176" y="132" width="88" height="6" rx="3" fill="#111" fillOpacity="0.8" />
      <rect x="176" y="142" width="72" height="6" rx="3" fill="#A1A1AA" />
      <rect x="300" y="132" width="36" height="12" rx="6" fill="#6C52FF" />
      <text x="318" y="141" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">COPY</text>

      <rect x="140" y="160" width="200" height="28" rx="10" fill="#F4F4F5" stroke="#E4E4E7" />
      <circle cx="158" cy="174" r="10" fill="#FFF2D6" />
      <text x="158" y="178" textAnchor="middle" fontSize="10">📝</text>
      <rect x="176" y="168" width="72" height="6" rx="3" fill="#111" fillOpacity="0.2" />
      <rect x="176" y="178" width="88" height="6" rx="3" fill="#D4D4D8" />

      {/* person pointing */}
      <circle cx="80" cy="216" r="14" fill="#111" />
      <rect x="68" y="232" width="24" height="48" rx="6" fill="#111" />
      <rect x="84" y="238" width="28" height="8" rx="4" fill="#111" transform="rotate(-18 84 238)" />
      <circle cx="108" cy="238" r="5" fill="#FFC9A8" />
      {/* floating lock */}
      <rect x="368" y="160" width="52" height="52" rx="12" fill="#6C52FF" />
      <path d="M384 184 V178 A10 10 0 0 1 404 178 V184" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="384" y="184" width="20" height="14" rx="3" fill="white" />
      <circle cx="394" cy="191" r="2.2" fill="#6C52FF" />
    </svg>
  );
}

function IllustrationCategories() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
      <rect x="72" y="36" width="336" height="212" rx="16" fill="white" stroke="#111" strokeWidth="1.2" />
      <rect x="72" y="36" width="336" height="34" rx="16" fill="#F4F4F5" />
      <rect x="88" y="47" width="72" height="12" rx="6" fill="#111" />
      <rect x="320" y="47" width="72" height="12" rx="6" fill="#E4E4E7" />
      {/* category grid */}
      <rect x="96" y="88" width="92" height="72" rx="14" fill="#EFF6FF" stroke="#BFDBFE" />
      <circle cx="142" cy="112" r="16" fill="#006FEE" />
      <text x="142" y="118" textAnchor="middle" fontSize="14">✉️</text>
      <text x="142" y="144" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1E3A8A">Gmail</text>

      <rect x="200" y="88" width="92" height="72" rx="14" fill="#F0FDF4" stroke="#BBF7D0" />
      <circle cx="246" cy="112" r="16" fill="#17C964" />
      <text x="246" y="118" textAnchor="middle" fontSize="14">🏦</text>
      <text x="246" y="144" textAnchor="middle" fontSize="9" fontWeight="700" fill="#14532D">Banking</text>

      <rect x="304" y="88" width="92" height="72" rx="14" fill="#FFFBEB" stroke="#FDE68A" />
      <circle cx="350" cy="112" r="16" fill="#F5A524" />
      <text x="350" y="118" textAnchor="middle" fontSize="14">☁️</text>
      <text x="350" y="144" textAnchor="middle" fontSize="9" fontWeight="700" fill="#92400E">Hosting</text>

      <rect x="96" y="172" width="92" height="56" rx="14" fill="#FDF2F8" stroke="#FBCFE8" />
      <circle cx="142" cy="192" r="12" fill="#F31260" />
      <text x="142" y="196" textAnchor="middle" fontSize="11" fill="white">🎨</text>
      <text x="142" y="214" textAnchor="middle" fontSize="8" fontWeight="700" fill="#831843">Design</text>

      <rect x="200" y="172" width="92" height="56" rx="14" fill="#F5F3FF" stroke="#DDD6FE" />
      <circle cx="246" cy="192" r="12" fill="#7828C8" />
      <text x="246" y="196" textAnchor="middle" fontSize="11" fill="white">💼</text>
      <text x="246" y="214" textAnchor="middle" fontSize="8" fontWeight="700" fill="#4C1D95">Work</text>

      <rect x="304" y="172" width="92" height="56" rx="14" fill="#FFF1F1" stroke="#FECACA" />
      <circle cx="350" cy="192" r="12" fill="#111" />
      <text x="350" y="196" textAnchor="middle" fontSize="11">+</text>
      <text x="350" y="214" textAnchor="middle" fontSize="8" fontWeight="700">Add New</text>

      {/* color dots */}
      <circle cx="118" cy="262" r="10" fill="#006FEE" stroke="white" strokeWidth="2" />
      <circle cx="142" cy="262" r="10" fill="#17C964" stroke="white" strokeWidth="2" />
      <circle cx="166" cy="262" r="10" fill="#F5A524" stroke="white" strokeWidth="2" />
      <circle cx="190" cy="262" r="10" fill="#F31260" stroke="white" strokeWidth="2" />
      <circle cx="214" cy="262" r="10" fill="#7828C8" stroke="white" strokeWidth="2" />
      <rect x="236" y="254" width="56" height="16" rx="8" fill="#111" />
      <text x="264" y="265" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">PICK COLOR</text>

      {/* person */}
      <circle cx="420" cy="264" r="12" fill="#111" />
      <rect x="410" y="278" width="20" height="28" rx="6" fill="#111" />
    </svg>
  );
}

function IllustrationGenerator() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
      <rect x="88" y="28" width="304" height="224" rx="18" fill="white" stroke="#111" strokeWidth="1.3" />
      <rect x="88" y="28" width="304" height="42" rx="18" fill="#111" />
      <text x="104" y="54" fill="white" fontSize="10" fontWeight="700">Password Generator</text>
      <rect x="324" y="40" width="52" height="18" rx="9" fill="white" fillOpacity="0.15" />
      <text x="350" y="52" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">REGENERATE</text>

      {/* password field */}
      <rect x="108" y="88" width="264" height="40" rx="10" fill="#F4F4F5" stroke="#E4E4E7" />
      <text x="124" y="112" fontFamily="monospace" fontSize="13" fontWeight="700" fill="#111">Tr0ub4dor&amp;3_xK9!</text>
      <rect x="324" y="96" width="36" height="24" rx="7" fill="#6C52FF" />
      <text x="342" y="111" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">COPY</text>

      {/* strength */}
      <rect x="108" y="138" width="264" height="10" rx="5" fill="#E4E4E7" />
      <rect x="108" y="138" width="192" height="10" rx="5" fill="#17C964" />
      <text x="108" y="160" fontSize="8" fontWeight="700" fill="#17C964">STRONG • 84 bits of entropy</text>
      <text x="372" y="160" textAnchor="end" fontSize="8" fill="#71717A">Fort Knox</text>

      {/* slider */}
      <text x="108" y="184" fontSize="9" fontWeight="600" fill="#111">Length</text>
      <text x="372" y="184" textAnchor="end" fontSize="10" fontWeight="800" fill="#111">16</text>
      <rect x="108" y="192" width="264" height="6" rx="3" fill="#E4E4E7" />
      <rect x="108" y="192" width="160" height="6" rx="3" fill="#6C52FF" />
      <circle cx="268" cy="195" r="10" fill="white" stroke="#6C52FF" strokeWidth="2.5" />

      {/* toggles */}
      <rect x="108" y="214" width="120" height="18" rx="9" fill="#111" />
      <text x="126" y="226" fontSize="7" fontWeight="700" fill="white">● PASSWORD</text>
      <text x="220" y="226" fontSize="7" fontWeight="600" fill="#71717A">PIN</text>
      <text x="268" y="226" fontSize="7" fontWeight="600" fill="#71717A">PASSPHRASE</text>

      {/* person */}
      <circle cx="60" cy="240" r="13" fill="#111" />
      <rect x="48" y="255" width="24" height="36" rx="6" fill="#111" />
      <rect x="68" y="260" width="30" height="8" rx="4" fill="#111" transform="rotate(-22 68 260)" />
      <circle cx="96" cy="256" r="4" fill="#FFC9A8" />
    </svg>
  );
}

function IllustrationAuth() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
      <rect x="96" y="32" width="288" height="212" rx="18" fill="white" stroke="#111" strokeWidth="1.2" />
      <rect x="96" y="32" width="288" height="40" rx="18" fill="#F4F4F5" />
      <circle cx="118" cy="52" r="5" fill="#111" fillOpacity="0.12" />
      <circle cx="132" cy="52" r="5" fill="#111" fillOpacity="0.12" />
      <circle cx="146" cy="52" r="5" fill="#111" fillOpacity="0.12" />
      <rect x="276" y="44" width="84" height="16" rx="8" fill="white" stroke="#E4E4E7" />
      <text x="318" y="54" textAnchor="middle" fontSize="7" fontWeight="700" fill="#111">one-account</text>

      {/* shield */}
      <path d="M240 88 L272 104 V136 C272 152 260 164 240 172 C220 164 208 152 208 136 V104 Z" fill="#EEF2FF" stroke="#6C52FF" strokeWidth="1.4" />
      <path d="M240 108 L254 120 L234 144 L222 132 L230 124 L234 128 Z" fill="#6C52FF" />

      <rect x="128" y="186" width="216" height="38" rx="10" fill="#111" />
      <circle cx="148" cy="205" r="10" fill="white" />
      <text x="148" y="209" textAnchor="middle" fontSize="11" fontWeight="800" fill="#4285F4">G</text>
      <text x="192" y="209" fill="white" fontSize="10" fontWeight="700">Continue with Google</text>
      <text x="358" y="209" fill="white" fontSize="12">→</text>

      <text x="240" y="248" textAnchor="middle" fontSize="8" fill="#71717A">No passwords to remember • Encrypted at rest</text>

      {/* persons */}
      <circle cx="64" cy="232" r="13" fill="#111" />
      <rect x="52" y="247" width="24" height="40" rx="6" fill="#111" />
      <circle cx="416" cy="232" r="13" fill="#111" />
      <path d="M404 247 L428 247 L424 272 L408 272 Z" fill="white" stroke="#111" />
      <rect x="404" y="272" width="24" height="18" rx="4" fill="#111" />
    </svg>
  );
}

function IllustrationSearch() {
  return (
    <svg viewBox="0 0 480 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
      {/* header */}
      <rect x="64" y="28" width="352" height="228" rx="16" fill="white" stroke="#111" strokeWidth="1.2" />
      <rect x="64" y="28" width="352" height="44" rx="16" fill="#111" />
      <rect x="84" y="42" width="160" height="16" rx="8" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.2" />
      <text x="94" y="53" fontSize="8" fill="white" fillOpacity="0.9">🔍 Search accounts, emails, notes…</text>
      <rect x="324" y="42" width="72" height="16" rx="8" fill="white" />
      <text x="360" y="53" textAnchor="middle" fontSize="7" fontWeight="700" fill="#111">COMPACT</text>

      {/* filters */}
      <rect x="84" y="84" width="58" height="20" rx="10" fill="#111" />
      <text x="113" y="97" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">All</text>
      <rect x="148" y="84" width="58" height="20" rx="10" fill="white" stroke="#E4E4E7" />
      <text x="177" y="97" textAnchor="middle" fontSize="7" fontWeight="600" fill="#71717A">Personal</text>
      <rect x="212" y="84" width="58" height="20" rx="10" fill="white" stroke="#E4E4E7" />
      <text x="241" y="97" textAnchor="middle" fontSize="7" fontWeight="600" fill="#71717A">Clients</text>

      {/* rows */}
      <rect x="84" y="116" width="312" height="32" rx="10" fill="#F4F4F5" stroke="#E4E4E7" />
      <circle cx="102" cy="132" r="10" fill="#006FEE" />
      <text x="102" y="136" textAnchor="middle" fontSize="9" fill="white">G</text>
      <text x="124" y="130" fontSize="8" fontWeight="700" fill="#111">google.com</text>
      <text x="124" y="140" fontSize="7" fill="#71717A">alex@one-account.app</text>
      <rect x="324" y="122" width="52" height="20" rx="7" fill="white" stroke="#E4E4E7" />
      <text x="350" y="135" textAnchor="middle" fontSize="7" fontWeight="700" fill="#111">COPY</text>

      <rect x="84" y="156" width="312" height="32" rx="10" fill="white" stroke="#E4E4E7" />
      <circle cx="102" cy="172" r="10" fill="#F5A524" />
      <text x="102" y="176" textAnchor="middle" fontSize="9">☁️</text>
      <text x="124" y="170" fontSize="8" fontWeight="700" fill="#111">aws console</text>
      <text x="124" y="180" fontSize="7" fill="#71717A">devops@company.io</text>
      <rect x="324" y="162" width="52" height="20" rx="7" fill="#6C52FF" />
      <text x="350" y="175" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">COPY</text>

      <rect x="84" y="196" width="312" height="32" rx="10" fill="#F4F4F5" stroke="#E4E4E7" />
      <circle cx="102" cy="212" r="10" fill="#17C964" />
      <text x="102" y="216" textAnchor="middle" fontSize="9" fill="white">$</text>
      <text x="124" y="210" fontSize="8" fontWeight="700" fill="#111">stripe dashboard</text>
      <text x="124" y="220" fontSize="7" fill="#71717A">billing@one-account.app</text>
      <circle cx="350" cy="212" r="10" fill="white" stroke="#E4E4E7" />
      <text x="350" y="216" textAnchor="middle" fontSize="10">👁️</text>

      {/* person */}
      <circle cx="448" cy="240" r="11" fill="#111" />
      <rect x="438" y="253" width="20" height="30" rx="6" fill="#111" />
      <rect x="426" y="258" width="18" height="8" rx="4" fill="#111" transform="rotate(-26 426 258)" />
    </svg>
  );
}

type Feature = {
  kicker: string;
  title: string;
  desc: string;
  bg: string;
  illustration: React.ReactNode;
  cta?: { label: string; href: string };
};

const FEATURES: Feature[] = [
  {
    kicker: "Isolation by design",
    title: "Spaces that mirror\nreal life.",
    desc: "Personal, Company, Client — each space is its own vault with its own color and icon. No more mixing personal logins with client secrets. Create, rename, and cascade-delete with confidence.",
    bg: "bg-[#FFF1E6]",
    illustration: <IllustrationSpaces />,
  },
  {
    kicker: "Zero bloat",
    title: "Add accounts\nin seconds.",
    desc: "Title, email, password, URL and notes — nothing you don't need. One-click copy, show/hide, and instant validation keep the flow fast and the vault clean.",
    bg: "bg-[#EEF2FF]",
    illustration: <IllustrationEntries />,
  },
  {
    kicker: "Visual at a glance",
    title: "Categories with\ncolor & icons.",
    desc: "Group Gmail, banking, hosting — or create anything custom. Pick an icon, a color, even a logo. Filter the dashboard by category and spot what you need instantly.",
    bg: "bg-[#FFF8D6]",
    illustration: <IllustrationCategories />,
  },
  {
    kicker: "Built-in generator",
    title: "Passwords that\ndon't get cracked.",
    desc: "Password, PIN or passphrase — with length, charset and live Fort Knox strength meter. Generate, copy, and save straight into any space without leaving the page.",
    bg: "bg-[#F3EFFF]",
    illustration: <IllustrationGenerator />,
    cta: { label: "Try the generator", href: "/#generator" },
  },
  {
    kicker: "Google-only auth",
    title: "Sign in with Google.\nEverything else stays private.",
    desc: "No master password to remember, no credential to leak. Your vault is gated by NextAuth and Postgres — private routes stay private, public pages stay fast.",
    bg: "bg-[#E6FFF2]",
    illustration: <IllustrationAuth />,
  },
  {
    kicker: "Find fast, act faster",
    title: "Search. Filter.\nCopy. Move on.",
    desc: "Search titles, emails, URLs and notes. Filter by space type and category, toggle Compact / Comfortable, bulk import, export or transfer entries between spaces.",
    bg: "bg-[#FFF0F3]",
    illustration: <IllustrationSearch />,
  },
];

export function LandingFeatures() {
  return (
    <section className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
        {/* section header */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Why One Account</p>
          <h2 className="font-header text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            Everything for accounts.
            <br />
            <span className="text-muted-foreground">Nothing you don&apos;t need.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-7 text-muted-foreground">
            A vault that feels like a notebook — fast to add, effortless to find, and organized the way you actually work.
          </p>
        </div>

        <div className="flex flex-col gap-10 sm:gap-16 lg:gap-20">
          {FEATURES.map((f, i) => {
            const isReversed = i % 2 === 1;
            return (
              <div
                key={f.title}
                className="grid gap-6 lg:gap-12 lg:grid-cols-2 items-center"
              >
                {/* illustration card */}
                <div
                  className={[
                    "relative overflow-hidden rounded-2xl border border-border/60 shadow-sm",
                    "p-3 sm:p-4 lg:p-6",
                    f.bg,
                    isReversed ? "lg:order-2" : "lg:order-1",
                  ].join(" ")}
                >
                  <div className="aspect-[4/3] sm:aspect-[1.4/1] lg:aspect-[1.35/1] w-full flex items-center justify-center">
                    {f.illustration}
                  </div>
                </div>

                {/* text */}
                <div className={isReversed ? "lg:order-1 lg:pr-6" : "lg:order-2 lg:pl-6"}>
                  <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">{f.kicker}</p>
                  <h3 className="font-header text-2xl sm:text-3xl lg:text-[32px] font-bold leading-[1.05] tracking-tight text-foreground whitespace-pre-line">
                    {f.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-7 text-muted-foreground max-w-[52ch]">{f.desc}</p>
                  {f.cta && (
                    <div className="mt-6">
                      <Link href={f.cta.href}>
                        <Button variant="ghost" className="px-0 gap-2 text-primary hover:text-primary-hover font-semibold">
                          {f.cta.label} <span aria-hidden>→</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
