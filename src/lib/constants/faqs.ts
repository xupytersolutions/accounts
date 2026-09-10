export type FaqItem = { q: string; a: string };

export const FAQS: FaqItem[] = [
  { q: "What is One Account?", a: "One Account is a secure vault for account credentials — every login lives in a space. Create spaces for Personal, Company or Client work, add entries with email, password, URL and notes, and keep personal and client secrets strictly isolated. Google-only login means no master password to forget." },
  { q: "How does pricing work?", a: "One Account is free to get started. Create unlimited spaces and entries, generate passwords, and use import/export at no cost while in early access. Paid team features and advanced encryption options will be optional — your vault always remains yours." },
  { q: "Are my passwords encrypted and safe?", a: "Your vault is private by default and gated by NextAuth + Postgres. Only the owner of a space can view its entries, deleting a space cascade-deletes its entries, and the app never stores your Google credential — only the account passwords you choose to save." },
  { q: "How do spaces and categories work?", a: "Spaces have a type — personal, company or client — plus a custom color and icon. Inside each space, categories group entries (e.g. Gmail, Banking, Hosting) with their own icon, color and logo. Filter the dashboard by type or category and switch between Comfortable and Compact views." },
  { q: "Can I import, export or move accounts in bulk?", a: "Yes. Import from CSV / TXT, export any space to CSV, and bulk-transfer or bulk-delete across spaces. One Account also keeps the generator one click away — generate a Password, PIN or passphrase and save it straight into any space." },
  { q: "Can I use One Account in my country?", a: "Yes — One Account works anywhere you have a Google account. Data is stored in Postgres, the public site and generator are available without sign-in, and your private vault is accessible on any device after Google sign-in." },
];
