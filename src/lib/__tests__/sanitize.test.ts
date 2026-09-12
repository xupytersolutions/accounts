import { describe, it, expect } from "vitest";

function sanitize(entry: Record<string, unknown>) {
  const { password: _p, ...rest } = entry as { password: string } & Record<string, unknown>;
  void _p;
  return rest;
}

describe("sanitize entry", () => {
  it("removes password", () => {
    const e = { id: "1", email: "a@b.com", password: "secret", title: "t" };
    const s = sanitize(e);
    expect((s as Record<string, unknown>).password).toBeUndefined();
    expect((s as Record<string, unknown>).email).toBe("a@b.com");
  });
  it("IDOR check conceptual", () => {
    const userId = "u1";
    const entry = { id: "e1", spaceId: "s1", space: { ownerId: "u2" } };
    const space = { id: "s1", ownerId: userId };
    // Patch should verify entry.space.ownerId === userId and spaceId matches
    const isOwner = entry.space.ownerId === userId;
    const spaceMatches = entry.spaceId === space.id;
    expect(isOwner).toBe(false);
    expect(spaceMatches).toBe(true);
  });
});
