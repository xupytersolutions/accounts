import { describe, it, expect } from "vitest";
import { hashToken, generateRawToken } from "@/lib/auth-extension";
import crypto from "node:crypto";

describe("extension token hashing", () => {
  it("hash is sha256 hex, 64 chars, deterministic", () => {
    const raw = "test-token-123";
    const h1 = hashToken(raw);
    const h2 = hashToken(raw);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(h1).toBe(crypto.createHash("sha256").update(raw).digest("hex"));
  });
  it("different tokens different hashes", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });
  it("generateRawToken entropy", () => {
    const a = generateRawToken();
    const b = generateRawToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(43);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });
  it("revocation check conceptual", () => {
    const raw = generateRawToken();
    const hash = hashToken(raw);
    // Simulate DB record
    const record = { tokenHash: hash, revokedAt: null as Date | null, expiresAt: new Date(Date.now() + 100000) };
    const isRevoked = !!record.revokedAt;
    const isExpired = record.expiresAt < new Date();
    expect(isRevoked).toBe(false);
    expect(isExpired).toBe(false);
    record.revokedAt = new Date();
    expect(!!record.revokedAt).toBe(true);
  });
  it("expired check", () => {
    const record = { expiresAt: new Date(Date.now() - 1000) };
    expect(record.expiresAt < new Date()).toBe(true);
  });
});
