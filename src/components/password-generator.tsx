"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Slider, Label, Alert } from "@heroui/react";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~";

// ~80 word list for passphrase (diceware-inspired, short & memorable)
const WORDS = [
  "apple", "brave", "candle", "dragon", "eagle", "forest", "galaxy", "harbor",
  "island", "jungle", "kitten", "lantern", "meadow", "narwhal", "ocean", "pepper",
  "quartz", "rocket", "sunset", "thunder", "umbrella", "velvet", "walnut", "xenon",
  "yellow", "zebra", "anchor", "bridge", "castle", "diamond", "engine", "falcon",
  "garden", "horizon", "ivory", "jacket", "kernel", "laptop", "magnet", "needle",
  "orbit", "puzzle", "quilt", "ripple", "summit", "travel", "unique", "voyage",
  "wizard", "yacht", "zephyr", "blossom", "crystal", "dolphin", "ember", "flower",
  "glacier", "hazel", "iris", "jasper", "kayak", "lagoon", "marble", "nimbus",
  "opal", "prairie", "river", "silver", "tulip", "valley", "willow", "autumn",
  "breeze", "cobalt", "desert", "elm", "flame", "grove", "harvest", "indigo",
];

type Mode = "password" | "pin" | "passphrase";

type Opts = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

type PassphraseOpts = {
  numWords: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
};

type SpaceOpt = { id: string; name: string; type: string; color?: string | null; icon?: string | null };

function secureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const arr = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let r: number;
  do {
    crypto.getRandomValues(arr);
    r = arr[0];
  } while (r >= limit);
  return r % max;
}

function shuffleCrypto<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePassword(opts: Opts): string {
  const pools: string[] = [];
  const required: string[] = [];

  if (opts.uppercase) {
    pools.push(UPPER);
    required.push(UPPER[secureRandomInt(UPPER.length)]);
  }
  if (opts.lowercase) {
    pools.push(LOWER);
    required.push(LOWER[secureRandomInt(LOWER.length)]);
  }
  if (opts.numbers) {
    pools.push(NUMS);
    required.push(NUMS[secureRandomInt(NUMS.length)]);
  }
  if (opts.symbols) {
    pools.push(SYMBOLS);
    required.push(SYMBOLS[secureRandomInt(SYMBOLS.length)]);
  }

  if (pools.length === 0) {
    pools.push(LOWER);
    required.push(LOWER[secureRandomInt(LOWER.length)]);
  }

  const all = pools.join("");
  const remaining = opts.length - required.length;
  const chars = [...required];
  for (let i = 0; i < remaining; i++) {
    chars.push(all[secureRandomInt(all.length)]);
  }
  return shuffleCrypto(chars).join("");
}

function generatePin(length: number): string {
  let pin = "";
  for (let i = 0; i < length; i++) pin += NUMS[secureRandomInt(NUMS.length)];
  return pin;
}

function generatePassphrase(opts: PassphraseOpts): string {
  const words: string[] = [];
  for (let i = 0; i < opts.numWords; i++) {
    let w = WORDS[secureRandomInt(WORDS.length)];
    if (opts.capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
    words.push(w);
  }
  if (opts.includeNumber) {
    const idx = secureRandomInt(words.length);
    const num = String(secureRandomInt(90) + 10); // 10-99
    words[idx] = `${words[idx]}${num}`;
  }
  return words.join(opts.separator);
}

function evaluateStrength(password: string, mode: Mode, opts: Opts, ppOpts: PassphraseOpts, pinLength: number) {
  // PIN — 10 digits, lower thresholds since entropy per digit is small (3.32 bits)
  if (mode === "pin") {
    const entropy = pinLength * Math.log2(10);
    if (entropy < 13) return { label: "Weak", text: "Too short — add more digits.", color: "text-danger" };
    if (entropy < 20) return { label: "Moderate", text: "Okay for a PIN — longer is safer.", color: "text-warning" };
    if (entropy < 28) return { label: "Strong", text: "Strong PIN — good for devices.", color: "text-success" };
    return { label: "Fort Knox", text: "Unbreakable PIN!", color: "text-success" };
  }

  // Passphrase — score as if drawn from full diceware list (7776 words ≈ 12.9 bits/word)
  // so 4 words already shows as Strong, not Weak. Bonuses for capitalize / number.
  if (mode === "passphrase") {
    const perWord = Math.log2(7776);
    let entropy = ppOpts.numWords * perWord;
    if (ppOpts.capitalize) entropy += 2;
    if (ppOpts.includeNumber) entropy += Math.log2(100);
    if (ppOpts.separator !== " " && ppOpts.separator !== "-") entropy += 1;

    if (entropy < 38) return { label: "Weak", text: "Add more words for strength.", color: "text-danger" };
    if (entropy < 50) return { label: "Moderate", text: "Decent — 4+ words recommended.", color: "text-warning" };
    if (entropy < 70) return { label: "Strong", text: "Strong passphrase — great job!", color: "text-success" };
    return { label: "Fort Knox", text: "Unbreakable — excellent!", color: "text-success" };
  }

  const poolSize =
    (opts.uppercase ? UPPER.length : 0) +
    (opts.lowercase ? LOWER.length : 0) +
    (opts.numbers ? NUMS.length : 0) +
    (opts.symbols ? SYMBOLS.length : 0) || LOWER.length;
  const entropy = password.length * Math.log2(poolSize);

  if (entropy < 28) return { label: "Weak", text: "Too guessable — make it longer.", color: "text-danger" };
  if (entropy < 45) return { label: "Moderate", text: "Not bad, but not Fort Knox either.", color: "text-warning" };
  if (entropy < 65) return { label: "Strong", text: "Solid protection for most accounts.", color: "text-success" };
  return { label: "Fort Knox", text: "Unbreakable — great job!", color: "text-success" };
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-1 cursor-pointer">
      <span className="text-sm text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${checked ? "bg-primary border-primary" : "bg-muted border-border"}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
    </label>
  );
}

function ModePill({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium leading-none transition-colors border ${
        active
          ? "bg-card border-border text-foreground shadow-sm"
          : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

type PasswordGeneratorProps = {
  onChoose?: (pwd: string) => void;
  hideAddToSpace?: boolean;
};

export function PasswordGenerator({ onChoose, hideAddToSpace }: PasswordGeneratorProps = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [opts, setOpts] = useState<Opts>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [pinLength, setPinLength] = useState(6);
  const [ppOpts, setPpOpts] = useState<PassphraseOpts>({
    numWords: 4,
    separator: "-",
    capitalize: false,
    includeNumber: false,
  });
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
    if (mode === "pin") setPassword(generatePin(pinLength));
    else if (mode === "passphrase") setPassword(generatePassphrase(ppOpts));
    else setPassword(generatePassword(opts));
  }, [mode, opts, pinLength, ppOpts]);

  const strength = evaluateStrength(password, mode, opts, ppOpts, pinLength);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleAddToSpace = async () => {
    if (!session?.user) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 4000);
      return;
    }
    setShowSpaceModal(true);
    if (spaces.length === 0 && !spacesLoading) {
      setSpacesLoading(true);
      setSpacesError(null);
      try {
        const res = await fetch("/api/spaces");
        if (!res.ok) throw new Error("Failed to load spaces");
        const data = await res.json();
        setSpaces(data.spaces ?? []);
      } catch (e) {
        setSpacesError(e instanceof Error ? e.message : "Failed to load spaces");
      } finally {
        setSpacesLoading(false);
      }
    }
  };

  const handleSelectSpace = (spaceId: string) => {
    try {
      sessionStorage.setItem("vaulta:genPassword", password);
    } catch {}
    setShowSpaceModal(false);
    const params = new URLSearchParams({ create: "1", gen: "1", password });
    router.push(`/spaces/${spaceId}?${params.toString()}`);
  };

  return (
    <>
      <Card className="overflow-hidden shadow-none">
        <Card.Content className="gap-0 p-0">
          {/* password display */}
          <div className="rounded-lg bg-muted/40 flex flex-col gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-3">
              <span className="flex-1 min-w-0 break-all font-mono text-sm sm:text-base font-medium text-foreground select-all leading-tight">
                {password || "••••••••••••"}
              </span>
              <div className="relative shrink-0 flex items-center gap-1.5">
                {copied && (
                  <span className="absolute -top-8 right-0 z-10 text-xs font-medium bg-foreground text-background px-2 py-1 rounded-md shadow-sm pointer-events-none whitespace-nowrap animate-in fade-in">
                    Copied
                  </span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  isIconOnly
                  aria-label={copied ? "Copied" : "Copy password"}
                  onPress={copy}
                  className={`h-8 w-8 shrink-0 border ${copied ? "bg-success/10 border-success/20 text-success" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  isIconOnly
                  aria-label="Regenerate"
                  onPress={regenerate}
                  className="h-8 w-8 shrink-0 border border-border bg-card hover:bg-muted"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* strength bar — responsive: stacks on mobile, row on sm+ */}
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1.5 sm:gap-2 bg-muted py-2 sm:py-1.5 px-2">
              {/* mode switcher — wraps on small screens */}
              <div className="flex items-center justify-center gap-0.5 shrink-0 flex-wrap">
                <ModePill active={mode === "password"} onClick={() => setMode("password")}>
                  Password
                </ModePill>
                <ModePill active={mode === "pin"} onClick={() => setMode("pin")}>
                  PIN
                </ModePill>
                <ModePill active={mode === "passphrase"} onClick={() => setMode("passphrase")}>
                  Passphrase
                </ModePill>
              </div>
              {/* strength — full width on mobile, auto on desktop */}
              <span className={`text-center text-[11px] font-medium leading-tight w-full sm:w-auto sm:truncate ${strength.color}`}>
                <span className="hidden sm:inline">
                  {strength.label}: {strength.text}
                </span>
                <span className="sm:hidden">
                  {strength.label}
                  <span className="opacity-70"> · </span>
                  {strength.label === "Fort Knox" ? "Unbreakable" : strength.label === "Weak" ? "Too guessable" : strength.text}
                </span>
              </span>
            </div>
          </div>

          {/* controls — vary by mode */}
          <div className="pt-5 flex flex-col gap-5">
            {mode === "password" && (
              <>
                <Slider
                  value={opts.length}
                  minValue={6}
                  maxValue={32}
                  step={1}
                  onChange={(v) => setOpts((o) => ({ ...o, length: typeof v === "number" ? v : Number((v as number[])[0]) }))}
                  className="w-full gap-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <Label className="text-sm text-foreground">Password length</Label>
                    <Slider.Output className="text-sm font-semibold text-foreground" />
                  </div>
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
                <div className="flex justify-between text-sm text-muted-foreground -mt-3">
                  <span>6</span>
                  <span>32</span>
                </div>

                <div className="flex flex-col gap-1">
                  <Toggle checked={opts.uppercase} onChange={(v) => setOpts((o) => ({ ...o, uppercase: v }))} label="Include Uppercase Letters" />
                  <Toggle checked={opts.lowercase} onChange={(v) => setOpts((o) => ({ ...o, lowercase: v }))} label="Include Lowercase Letters" />
                  <Toggle checked={opts.numbers} onChange={(v) => setOpts((o) => ({ ...o, numbers: v }))} label="Include Numbers" />
                  <Toggle checked={opts.symbols} onChange={(v) => setOpts((o) => ({ ...o, symbols: v }))} label="Include Symbols" />
                </div>
              </>
            )}

            {mode === "pin" && (
              <div className="flex flex-col gap-2">
                <Slider
                  value={pinLength}
                  minValue={3}
                  maxValue={12}
                  step={1}
                  onChange={(v) => setPinLength(typeof v === "number" ? v : Number((v as number[])[0]))}
                  className="w-full gap-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <Label className="text-sm text-foreground">PIN length</Label>
                    <Slider.Output className="text-sm font-semibold text-foreground" />
                  </div>
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
                <div className="flex justify-between text-[10px] text-muted-foreground -mt-1">
                  <span>3</span>
                  <span>12</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">Digits only — great for device PINs.</p>
              </div>
            )}

            {mode === "passphrase" && (
              <>
                <Slider
                  value={ppOpts.numWords}
                  minValue={3}
                  maxValue={7}
                  step={1}
                  onChange={(v) => setPpOpts((o) => ({ ...o, numWords: typeof v === "number" ? v : Number((v as number[])[0]) }))}
                  className="w-full gap-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <Label className="text-sm text-foreground">Number of words</Label>
                    <Slider.Output className="text-sm font-semibold text-foreground" />
                  </div>
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
                <div className="flex justify-between text-[10px] text-muted-foreground -mt-1">
                  <span>3</span>
                  <span>7</span>
                </div>

                <div className="flex items-center justify-between gap-4 py-1">
                  <span className="text-sm text-foreground">Word separator</span>
                  <div className="flex gap-1">
                    {["-", "_", ".", " "].map((s) => (
                      <button
                        key={s === " " ? "space" : s}
                        type="button"
                        onClick={() => setPpOpts((o) => ({ ...o, separator: s }))}
                        className={`h-7 min-w-7 px-2 rounded-md border text-sm font-mono transition-colors ${
                          ppOpts.separator === s ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border hover:bg-muted"
                        }`}
                        aria-label={s === " " ? "space" : s}
                      >
                        {s === " " ? "␣" : s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Toggle checked={ppOpts.capitalize} onChange={(v) => setPpOpts((o) => ({ ...o, capitalize: v }))} label="Capitalize Words" />
                  <Toggle checked={ppOpts.includeNumber} onChange={(v) => setPpOpts((o) => ({ ...o, includeNumber: v }))} label="Include Number" />
                </div>
              </>
            )}
          </div>

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
                <Alert status="accent">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Login to save your password</Alert.Title>
                    <Alert.Description>
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
        </Card.Content>
      </Card>

      {/* space picker modal */}
      {showSpaceModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 backdrop-blur-[2px]"
          onClick={() => setShowSpaceModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-card rounded-t-2xl sm:rounded-2xl border-t sm:border border-border shadow-sm w-full sm:max-w-md max-h-[80dvh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border shrink-0">
              <div>
                <h3 className="text-base font-semibold text-foreground">Save to space</h3>
                <p className="text-xs text-muted-foreground">Select a space — we&apos;ll open the account form with your password ready.</p>
              </div>
              <Button variant="ghost" isIconOnly size="sm" onPress={() => setShowSpaceModal(false)} aria-label="Close" className="shrink-0 -mr-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
              {spacesLoading ? (
                <p className="text-sm text-muted-foreground p-4 text-center">Loading spaces…</p>
              ) : spacesError ? (
                <p className="text-sm text-destructive p-4 text-center">{spacesError}</p>
              ) : spaces.length === 0 ? (
                <div className="p-4 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">No spaces yet. Create one from your dashboard.</p>
                  <Link href="/dashboard">
                    <Button variant="primary" className="w-full">
                      Go to dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                spaces.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSpace(s.id)}
                    className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted border border-transparent hover:border-border transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: s.color || "#006FEE" }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{s.type}</p>
                    </div>
                    <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))
              )}
            </div>
            <div className="p-3 border-t border-border bg-card shrink-0">
              <p className="text-xs text-muted-foreground truncate font-mono">Password: {password}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
