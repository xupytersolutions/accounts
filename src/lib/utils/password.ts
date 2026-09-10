export const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWER = "abcdefghijklmnopqrstuvwxyz";
export const NUMS = "0123456789";
export const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~";

export const WORDS = [
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

export type Mode = "password" | "pin" | "passphrase";
export type Opts = { length: number; uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean };
export type PassphraseOpts = { numWords: number; separator: string; capitalize: boolean; includeNumber: boolean };

function secureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const arr = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let r: number;
  do { crypto.getRandomValues(arr); r = arr[0]; } while (r >= limit);
  return r % max;
}

function shuffleCrypto<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = secureRandomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function generatePassword(opts: Opts): string {
  const pools: string[] = []; const required: string[] = [];
  if (opts.uppercase) { pools.push(UPPER); required.push(UPPER[secureRandomInt(UPPER.length)]); }
  if (opts.lowercase) { pools.push(LOWER); required.push(LOWER[secureRandomInt(LOWER.length)]); }
  if (opts.numbers) { pools.push(NUMS); required.push(NUMS[secureRandomInt(NUMS.length)]); }
  if (opts.symbols) { pools.push(SYMBOLS); required.push(SYMBOLS[secureRandomInt(SYMBOLS.length)]); }
  if (pools.length === 0) { pools.push(LOWER); required.push(LOWER[secureRandomInt(LOWER.length)]); }
  const all = pools.join(""); const remaining = opts.length - required.length; const chars = [...required];
  for (let i = 0; i < remaining; i++) chars.push(all[secureRandomInt(all.length)]);
  return shuffleCrypto(chars).join("");
}

export function generatePin(length: number): string {
  let pin = ""; for (let i = 0; i < length; i++) pin += NUMS[secureRandomInt(NUMS.length)]; return pin;
}

export function generatePassphrase(opts: PassphraseOpts): string {
  const words: string[] = [];
  for (let i = 0; i < opts.numWords; i++) { let w = WORDS[secureRandomInt(WORDS.length)]; if (opts.capitalize) w = w.charAt(0).toUpperCase() + w.slice(1); words.push(w); }
  if (opts.includeNumber) { const idx = secureRandomInt(words.length); const num = String(secureRandomInt(90) + 10); words[idx] = `${words[idx]}${num}`; }
  return words.join(opts.separator);
}

export function evaluateStrength(password: string, mode: Mode, opts: Opts, ppOpts: PassphraseOpts, pinLength: number) {
  if (mode === "pin") {
    const entropy = pinLength * Math.log2(10);
    if (entropy < 13) return { label: "Weak", text: "Too short — add more digits.", color: "text-danger" };
    if (entropy < 20) return { label: "Moderate", text: "Okay for a PIN — longer is safer.", color: "text-warning" };
    if (entropy < 28) return { label: "Strong", text: "Strong PIN — good for devices.", color: "text-success" };
    return { label: "Fort Knox", text: "Unbreakable PIN!", color: "text-success" };
  }
  if (mode === "passphrase") {
    const perWord = Math.log2(7776); let entropy = ppOpts.numWords * perWord;
    if (ppOpts.capitalize) entropy += 2; if (ppOpts.includeNumber) entropy += Math.log2(100); if (ppOpts.separator !== " " && ppOpts.separator !== "-") entropy += 1;
    if (entropy < 38) return { label: "Weak", text: "Add more words for strength.", color: "text-danger" };
    if (entropy < 50) return { label: "Moderate", text: "Decent — 4+ words recommended.", color: "text-warning" };
    if (entropy < 70) return { label: "Strong", text: "Strong passphrase — great job!", color: "text-success" };
    return { label: "Fort Knox", text: "Unbreakable — excellent!", color: "text-success" };
  }
  const poolSize = (opts.uppercase ? UPPER.length : 0) + (opts.lowercase ? LOWER.length : 0) + (opts.numbers ? NUMS.length : 0) + (opts.symbols ? SYMBOLS.length : 0) || LOWER.length;
  const entropy = password.length * Math.log2(poolSize);
  if (entropy < 28) return { label: "Weak", text: "Too guessable — make it longer.", color: "text-danger" };
  if (entropy < 45) return { label: "Moderate", text: "Not bad, but not Fort Knox either.", color: "text-warning" };
  if (entropy < 65) return { label: "Strong", text: "Solid protection for most accounts.", color: "text-success" };
  return { label: "Fort Knox", text: "Unbreakable — great job!", color: "text-success" };
}
