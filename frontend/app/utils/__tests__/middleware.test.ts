import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { matchesRoutePrefix } from "../../../middleware";

describe("matchesRoutePrefix", () => {
  it("matches the exact prefix", () => {
    expect(matchesRoutePrefix("/admin", ["/admin"])).toBe(true);
  });

  it("matches nested paths under the prefix", () => {
    expect(matchesRoutePrefix("/admin/products/edit/abc123", ["/admin"])).toBe(true);
  });

  it("does not match an unrelated path with the same leading characters", () => {
    expect(matchesRoutePrefix("/admin-panel", ["/admin"])).toBe(false);
  });

  it("does not match a path outside every prefix", () => {
    expect(matchesRoutePrefix("/products", ["/dashboard", "/admin"])).toBe(false);
  });
});

const { decryptMock } = vi.hoisted(() => ({ decryptMock: vi.fn() }));

vi.mock("../Api/Actions/cookies-session", () => ({
  decrypt: decryptMock,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => (name === "sessionita" ? { value: "some-cookie-value" } : undefined),
  })),
}));

describe("middleware auth guard", () => {
  it("redirects to home when the session cookie is present but fails to decrypt (expired/tampered)", async () => {
    decryptMock.mockResolvedValueOnce(null);
    const { default: middleware } = await import("../../../middleware");

    const req = new NextRequest(new Request("https://example.com/dashboard"));
    const res = await middleware(req);

    expect(res?.status).toBe(307);
    expect(res?.headers.get("location")).toBe("https://example.com/");
  });

  it("allows the request through when the session decrypts successfully", async () => {
    decryptMock.mockResolvedValueOnce({ userId: "user-1" });
    const { default: middleware } = await import("../../../middleware");

    const req = new NextRequest(new Request("https://example.com/dashboard"));
    const res = await middleware(req);

    expect(res).toBeUndefined();
  });
});
