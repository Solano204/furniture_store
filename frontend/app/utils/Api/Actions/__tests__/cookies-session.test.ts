import { beforeEach, describe, expect, it, vi } from "vitest";

// cookies-session.tsx reads process.env.SECRET at module-load time (to build the JWT
// signing key), so it must be set before the module is first imported - a dynamic
// import() after stubbing the env, not a static import (which ESM hoists above this).
process.env.SECRET = "test-secret-key-for-jwt-signing-only";

const setMock = vi.fn();
const deleteMock = vi.fn();
const getMock = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ set: setMock, delete: deleteMock, get: getMock })),
}));

const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

const { encrypt, decrypt, createSession, deleteSession, getDataFromCookie } = await import("../cookies-session");

const PAYLOAD = { userId: "u1", username: "carlos", refreshToken: "refresh-tok", jwt: "access-tok" };

describe("encrypt/decrypt", () => {
  it("round-trips a session payload", async () => {
    const token = await encrypt(PAYLOAD);
    const decoded = await decrypt(token);

    expect(decoded).toMatchObject(PAYLOAD);
  });

  it("returns null for a malformed/tampered token instead of throwing", async () => {
    expect(await decrypt("not-a-real-jwt")).toBeNull();
  });

  it("returns null when no token is passed at all", async () => {
    expect(await decrypt(undefined)).toBeNull();
  });
});

describe("createSession", () => {
  beforeEach(() => {
    setMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("sets an httpOnly, secure, lax-samesite cookie and revalidates /", async () => {
    await createSession(PAYLOAD);

    expect(setMock).toHaveBeenCalledWith(
      "sessionita",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: "lax", path: "/" }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("the stored cookie value decrypts back into the same payload", async () => {
    await createSession(PAYLOAD);

    const [, cookieValue] = setMock.mock.calls[0];
    expect(await decrypt(cookieValue)).toMatchObject(PAYLOAD);
  });
});

describe("deleteSession", () => {
  beforeEach(() => {
    deleteMock.mockReset();
    redirectMock.mockReset();
  });

  it("deletes the session cookie and redirects home", async () => {
    await deleteSession();

    expect(deleteMock).toHaveBeenCalledWith("sessionita");
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});

describe("getDataFromCookie", () => {
  beforeEach(() => getMock.mockReset());

  it("returns undefined when there is no session cookie", async () => {
    getMock.mockReturnValueOnce(undefined);

    expect(await getDataFromCookie()).toBeUndefined();
  });

  it("returns the decrypted payload when the cookie is present and valid", async () => {
    const token = await encrypt(PAYLOAD);
    getMock.mockReturnValueOnce({ value: token });

    expect(await getDataFromCookie()).toMatchObject(PAYLOAD);
  });

  it("returns undefined when the cookie value fails to decrypt", async () => {
    getMock.mockReturnValueOnce({ value: "tampered-value" });

    expect(await getDataFromCookie()).toBeUndefined();
  });
});
