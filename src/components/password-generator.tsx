"use client";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Alert } from "@heroui/react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { generatePassword, generatePin, generatePassphrase, evaluateStrength } from "@/lib/utils/password";
import type { Mode, Opts, PassphraseOpts } from "@/lib/utils/password";
import { PasswordDisplay } from "@/components/password/password-display";
import { PasswordControls } from "@/components/password/password-controls";
import { SpacePickerDialog } from "@/components/password/space-picker-dialog";
import type { PasswordGeneratorProps } from "@/lib/types";

type SpaceOpt = { id: string; name: string; type: string; color?: string | null };

function ModePill({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return <button type="button" onClick={onClick} className={`rounded-full px-2.5 py-1 text-[11px] font-medium leading-none transition-colors border ${active ? "bg-card border-border text-foreground shadow-sm" : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"}`}>{children}</button>;
}

export function PasswordGenerator({ onChoose, hideAddToSpace }: PasswordGeneratorProps = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [opts, setOpts] = useState<Opts>({ length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [pinLength, setPinLength] = useState(6);
  const [ppOpts, setPpOpts] = useState<PassphraseOpts>({ numWords: 4, separator: "-", capitalize: false, includeNumber: false });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [spaces, setSpaces] = useState<SpaceOpt[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(false);
  const [spacesError, setSpacesError] = useState<string | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const regenerate = useCallback(() => {
    if (mode === "pin") setPassword(generatePin(pinLength));
    else if (mode === "passphrase") setPassword(generatePassphrase(ppOpts));
    else setPassword(generatePassword(opts));
    setCopied(false);
  }, [mode, opts, pinLength, ppOpts]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mode === "pin") setPassword(generatePin(pinLength));
    else if (mode === "passphrase") setPassword(generatePassphrase(ppOpts));
    else setPassword(generatePassword(opts));
  }, [mode, opts, pinLength, ppOpts]);

  const strength = evaluateStrength(password, mode, opts, ppOpts, pinLength);
  const copy = async () => { if (!password) return; await navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  const handleAddToSpace = async () => {
<<<<<<< Updated upstream
    if (!session?.user) {
      setShowLoginAlert(true);
      setTimeout(() => redirect('/login'), 2000);
      return;
    }
=======
    if (!session?.user) { setShowLoginAlert(true); setTimeout(() => redirect('/login'), 2000); return; }
>>>>>>> Stashed changes
    setShowSpaceModal(true);
    if (spaces.length === 0 && !spacesLoading) {
      setSpacesLoading(true); setSpacesError(null);
      try { const res = await fetch("/api/spaces"); if (!res.ok) throw new Error("Failed to load spaces"); const data = await res.json(); setSpaces(data.spaces ?? []); } catch (e) { setSpacesError(e instanceof Error ? e.message : "Failed to load spaces"); } finally { setSpacesLoading(false); }
    }
  };

  const handleSelectSpace = (spaceId: string) => {
<<<<<<< Updated upstream
    try {
      sessionStorage.setItem("one-account:genPassword", password);
    } catch {}
=======
    try { sessionStorage.setItem("one-account:genPassword", password); } catch {}
>>>>>>> Stashed changes
    setShowSpaceModal(false);
    const params = new URLSearchParams({ create: "1", gen: "1", password });
    router.push(`/spaces/${spaceId}?${params.toString()}`);
  };

  return (
    <>
      <Card className="overflow-hidden shadow-none">
        <Card.Content className="gap-0 p-0">
          <div className="rounded-lg bg-muted/40 flex flex-col gap-2 overflow-hidden">
            <PasswordDisplay password={password} copied={copied} onCopy={copy} onRegenerate={regenerate} />
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1.5 sm:gap-2 bg-muted py-2 sm:py-1.5 px-2">
              <div className="flex items-center justify-center gap-0.5 shrink-0 flex-wrap">
                <ModePill active={mode === "password"} onClick={() => setMode("password")}>Password</ModePill>
                <ModePill active={mode === "pin"} onClick={() => setMode("pin")}>PIN</ModePill>
                <ModePill active={mode === "passphrase"} onClick={() => setMode("passphrase")}>Passphrase</ModePill>
              </div>
              <span className={`text-center text-[11px] font-medium leading-tight w-full sm:w-auto sm:truncate ${strength.color}`}>
                <span className="hidden sm:inline">{strength.label}: {strength.text}</span>
                <span className="sm:hidden">{strength.label}<span className="opacity-70"> · </span>{strength.label === "Fort Knox" ? "Unbreakable" : strength.label === "Weak" ? "Too guessable" : strength.text}</span>
              </span>
            </div>
          </div>
          <div className="pt-5 flex flex-col gap-5">
            <PasswordControls mode={mode} opts={opts} onOptsChange={setOpts} pinLength={pinLength} onPinLengthChange={setPinLength} ppOpts={ppOpts} onPpOptsChange={setPpOpts} />
          </div>
<<<<<<< Updated upstream

          {/* add to space / choose footer */}
          {onChoose ? (
            <div className="pt-4 flex flex-col gap-3">
              <Button onPress={() => onChoose(password)} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium">
                Choose this password
              </Button>
            </div>
          ) : !hideAddToSpace ? (
            <div className="pt-6 mt-2 border-t border-border flex flex-col gap-3">
              <Button onPress={handleAddToSpace} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium">
                Add to my space
              </Button>
              {showLoginAlert && (
                <Alert status="default">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Login to save your password</Alert.Title>
                    <Alert.Description className="text-foreground">
                      You need to be signed in to save generated passwords to a space.{" "}
                      <Link href="/login" className="underline font-medium">
                        Sign in with Google
                      </Link>
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              )}
            </div>
          ) : null}
=======
          {onChoose ? <div className="pt-4 flex flex-col gap-3"><Button onPress={() => onChoose(password)} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium">Choose this password</Button></div> : !hideAddToSpace ? <div className="pt-6 mt-2 border-t border-border flex flex-col gap-3"><Button onPress={handleAddToSpace} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium">Add to my space</Button>{showLoginAlert && <Alert status="default"><Alert.Indicator /><Alert.Content><Alert.Title>Login to save your password</Alert.Title><Alert.Description className="text-foreground">You need to be signed in to save generated passwords to a space. <Link href="/login" className="underline font-medium">Sign in with Google</Link></Alert.Description></Alert.Content></Alert>}</div> : null}
>>>>>>> Stashed changes
        </Card.Content>
      </Card>
      <SpacePickerDialog isOpen={showSpaceModal} onClose={() => setShowSpaceModal(false)} spaces={spaces} loading={spacesLoading} error={spacesError} password={password} onSelect={handleSelectSpace} />
    </>
  );
}
