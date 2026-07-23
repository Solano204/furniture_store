import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDataFromCookieMock } = vi.hoisted(() => ({ getDataFromCookieMock: vi.fn() }));
vi.mock("../Actions/cookies-session", () => ({ getDataFromCookie: getDataFromCookieMock }));

import { buildAuthHeaders } from "../Client";

// Reads the session cookie fresh on every call rather than caching a
// module-level token - see Client.tsx's own comment on why a process-global
// token would leak between concurrent users' requests.
describe("buildAuthHeaders", () => {
  beforeEach(() => getDataFromCookieMock.mockReset());

  it("attaches the current session's JWT as a Bearer token", async () => {
    getDataFromCookieMock.mockResolvedValue({ jwt: "access-tok" });

    const headers = await buildAuthHeaders();

    expect(headers.Authorization).toBe("Bearer access-tok");
  });

  it("sends an empty Bearer token when there is no session", async () => {
    getDataFromCookieMock.mockResolvedValue(undefined);

    const headers = await buildAuthHeaders();

    expect(headers.Authorization).toBe("Bearer ");
  });

  it("preserves any existing headers passed in", async () => {
    getDataFromCookieMock.mockResolvedValue({ jwt: "access-tok" });

    const headers = await buildAuthHeaders({ "X-Custom": "value" });

    expect(headers).toEqual({ "X-Custom": "value", Authorization: "Bearer access-tok" });
  });

  it("re-reads the cookie on every call instead of caching the token from a previous call", async () => {
    getDataFromCookieMock.mockResolvedValueOnce({ jwt: "token-for-user-a" });
    getDataFromCookieMock.mockResolvedValueOnce({ jwt: "token-for-user-b" });

    const first = await buildAuthHeaders();
    const second = await buildAuthHeaders();

    expect(first.Authorization).toBe("Bearer token-for-user-a");
    expect(second.Authorization).toBe("Bearer token-for-user-b");
  });
});
