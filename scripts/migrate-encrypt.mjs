import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const PREFIX = "v1:";
const prisma = new PrismaClient();

function getKey() {
  const envKey = process.env.VAULT_ENCRYPTION_KEY;
  const fallback = process.env.AUTH_SECRET;
  let raw = envKey || fallback;
  if (!raw) throw new Error("Missing key");
  if (!envKey && fallback) raw = crypto.createHash("sha256").update(`vault:${fallback}`).digest("hex");
  const s = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(s)) return Buffer.from(s, "hex");
  if (s.length >= 32 && /^[A-Za-z0-9+/=]+$/.test(s) && s.length % 4 === 0) {
    try { const b = Buffer.from(s, "base64"); if (b.length === 32) return b; } catch {}
  }
  if (Buffer.from(s, "utf8").length === 32) return Buffer.from(s, "utf8");
  return crypto.createHash("sha256").update(s).digest();
}

function encrypt(plain) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, enc]).toString("base64");
}

function isEncrypted(v) { return typeof v === "string" && v.startsWith(PREFIX); }

async function main() {
  const entries = await prisma.vaultEntry.findMany();
  let migrated = 0;
  for (const e of entries) {
    if (!isEncrypted(e.password)) {
      const enc = encrypt(e.password);
      await prisma.vaultEntry.update({ where: { id: e.id }, data: { password: enc } });
      migrated++;
      console.log(`Migrated ${e.id}`);
    }
  }
  console.log(`Done migrated=${migrated} total=${entries.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
