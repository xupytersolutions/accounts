import crypto from "node:crypto";

const PREFIX = "v1:";
const IV_LEN = 12;
const TAG_LEN = 16;
let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const envKey = process.env.VAULT_ENCRYPTION_KEY;
  const fallback = process.env.AUTH_SECRET;

  let raw: string | undefined = envKey || fallback;
  if (!raw) {
    throw new Error("Vault encryption key missing: set VAULT_ENCRYPTION_KEY or AUTH_SECRET");
  }
  if (!envKey && fallback) {
    // Derive a distinct key from AUTH_SECRET so rotation is independent, without logging the secret
    raw = crypto.createHash("sha256").update(`vault:${fallback}`).digest("hex");
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[crypto] VAULT_ENCRYPTION_KEY not set — derived from AUTH_SECRET. Set VAULT_ENCRYPTION_KEY in production.");
    }
  }

  // Accept 64-char hex (32 bytes), base64, or raw
  let key: Buffer;
  const s = raw!.trim();
  if (/^[0-9a-fA-F]{64}$/.test(s)) {
    key = Buffer.from(s, "hex");
  } else if (s.length >= 32 && /^[A-Za-z0-9+/=]+$/.test(s) && s.length % 4 === 0) {
    try {
      const b = Buffer.from(s, "base64");
      if (b.length === 32) key = b;
      else key = crypto.createHash("sha256").update(s).digest();
    } catch {
      key = crypto.createHash("sha256").update(s).digest();
    }
  } else if (Buffer.from(s, "utf8").length === 32) {
    key = Buffer.from(s, "utf8");
  } else {
    key = crypto.createHash("sha256").update(s).digest();
  }

  if (key.length !== 32) {
    // Ensure 32 bytes
    key = crypto.createHash("sha256").update(key).digest();
  }
  cachedKey = key;
  return key;
}

// For tests: allow resetting
export function _resetKeyCache() {
  cachedKey = null;
}

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encrypt(plaintext: string): string {
  if (typeof plaintext !== "string") plaintext = String(plaintext);
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, tag, enc]);
  return PREFIX + combined.toString("base64");
}

export function decrypt(ciphertext: string): string {
  if (!isEncrypted(ciphertext)) {
    // Plaintext fallback — migration path. Callers should treat this as plaintext and re-encrypt on next write.
    return ciphertext;
  }
  const key = getKey();
  const b = Buffer.from(ciphertext.slice(PREFIX.length), "base64");
  if (b.length < IV_LEN + TAG_LEN) throw new Error("Invalid ciphertext");
  const iv = b.subarray(0, IV_LEN);
  const tag = b.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = b.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

export function encryptIfNeeded(value: string): string {
  return isEncrypted(value) ? value : encrypt(value);
}

/** Decrypt if encrypted, otherwise return as-is (safe for migration). */
export function decryptIfNeeded(value: string | null | undefined): string {
  if (value == null) return "";
  return decrypt(value);
}
