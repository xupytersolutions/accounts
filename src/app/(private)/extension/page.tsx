import { auth } from "@/auth";
import { ExtensionTokenClient } from "./client";

export default async function ExtensionPage() {
  const session = await auth();
  if (!session) return null;
  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl font-semibold">Extension</h1>
      <p className="text-sm text-muted-foreground mt-1">Generate a token for the browser extension. Tokens expire in 14 days and can be revoked. Copy once — it will not be shown again.</p>
      <div className="mt-6">
        <ExtensionTokenClient />
      </div>
    </div>
  );
}
