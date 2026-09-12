import { describe, it, expect } from "vitest";
import { isDomainMatch } from "@/lib/utils/domain";

describe("isDomainMatch", () => {
  it("exact match", () => {
    expect(isDomainMatch("https://github.com/login", "https://github.com")).toBe(true);
    expect(isDomainMatch("github.com", "github.com")).toBe(true);
  });
  it("subdomain matches parent", () => {
    expect(isDomainMatch("https://github.com", "https://app.github.com")).toBe(true);
    expect(isDomainMatch("github.com", "sub.github.com")).toBe(true);
    expect(isDomainMatch("example.com", "https://a.b.example.com/path")).toBe(true);
  });
  it("prevents sibling evil domain", () => {
    expect(isDomainMatch("https://github.com", "https://evilgithub.com")).toBe(false);
    expect(isDomainMatch("github.com", "evilgithub.com")).toBe(false);
  });
  it("prevents suffix trick", () => {
    expect(isDomainMatch("https://github.com", "https://github.com.evil.com")).toBe(false);
    expect(isDomainMatch("github.com.evil.com", "github.com")).toBe(false);
  });
  it("case and port insensitive", () => {
    expect(isDomainMatch("https://GitHub.com:443", "https://github.com")).toBe(true);
    expect(isDomainMatch("github.com", "GITHUB.COM")).toBe(true);
  });
  it("bare host without scheme", () => {
    expect(isDomainMatch("github.com", "github.com")).toBe(true);
  });
  it("empty or null", () => {
    expect(isDomainMatch(null, "github.com")).toBe(false);
    expect(isDomainMatch("github.com", null as unknown as string)).toBe(false);
    expect(isDomainMatch("", "github.com")).toBe(false);
  });
  it("reverse should not match", () => {
    // entry is subdomain, current is parent -> false (stored https://app.github.com should not match github.com site)
    expect(isDomainMatch("https://app.github.com", "https://github.com")).toBe(false);
  });
});
