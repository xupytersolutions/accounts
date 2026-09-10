import { OfflineActions } from "./offline-actions";

export const metadata = {
  title: "Offline — OneAccount",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <span className="text-2xl">📡</span>
      </div>
      <h1 className="mt-4 text-xl font-semibold">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Check your internet connection and try again. Your vault data requires an online connection.
      </p>
      <OfflineActions />
    </div>
  );
}
