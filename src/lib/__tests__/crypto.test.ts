import { describe, it, expect, beforeEach } from "vitest";
import { encrypt, decrypt, isEncrypted, _resetKeyCache } from "@/lib/crypto";

describe("crypto AES-GCM", () => {
  beforeEach(() => {
    process.env.VAULT_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    _resetKeyCache();
  });

  it("roundtrip", () => {
    const plain = "S3cr3t!123";
    const enc = encrypt(plain);
    expect(isEncrypted(enc)).toBe(true);
    expect(decrypt(enc)).toBe(plain);
    expect(enc).not.toBe(plain);
  });

  it("different IV each time", () => {
    const a = encrypt("same");
    const b = encrypt("same");
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe("same");
    expect(decrypt(b)).toBe("same");
  });

  it("plaintext fallback for migration", () => {
    const plain = "legacy-plain";
    expect(isEncrypted(plain)).toBe(false);
    expect(decrypt(plain)).toBe(plain);
  });

  it("empty and unicode", () => {
    for (const p of ["", "🔐", "a".repeat(1000)]) {
      expect(decrypt(encrypt(p))).toBe(p);
    }
  });

  it("tamper detection", () => {
    const enc = encrypt("secret");
    const tampered = enc.slice(0, -4) + "AAAA";
    expect(() => decrypt(tampered)).toThrow();
  });
});
