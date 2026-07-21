import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mutateMock, getDataFromCookieMock, createSessionMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  getDataFromCookieMock: vi.fn(),
  createSessionMock: vi.fn(),
}));

vi.mock("../../Client", () => ({
  getClient: () => ({ mutate: mutateMock }),
}));

const { deleteSessionMock, redirectMock } = vi.hoisted(() => ({
  deleteSessionMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("../cookies-session", () => ({
  getDataFromCookie: getDataFromCookieMock,
  createSession: createSessionMock,
  deleteSession: deleteSessionMock,
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { refreshAccessToken, login, register, logout, changePassword, auth, currentUser, getAdminUser } from "../Security";

// refreshToken previously returned a bare Boolean from the backend with no
// way to hand the new access token back to the caller, so this flow was
// unimplementable on the frontend - see AuthenticationService#refreshToken.
describe("refreshAccessToken", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    getDataFromCookieMock.mockReset();
    createSessionMock.mockReset();
  });

  it("returns false without calling the backend when there is no session", async () => {
    getDataFromCookieMock.mockResolvedValueOnce(undefined);

    const result = await refreshAccessToken();

    expect(result).toBe(false);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("rotates the access token and persists the updated session", async () => {
    getDataFromCookieMock.mockResolvedValueOnce({
      userId: "u1",
      username: "carlos",
      refreshToken: "refresh-token",
      jwt: "old-access-token",
    });
    mutateMock.mockResolvedValueOnce({ data: { refreshToken: "new-access-token" } });

    const result = await refreshAccessToken();

    expect(result).toBe(true);
    expect(createSessionMock).toHaveBeenCalledWith({
      userId: "u1",
      username: "carlos",
      refreshToken: "refresh-token",
      jwt: "new-access-token",
    });
  });

  it("returns false without persisting anything when the backend rejects the refresh token", async () => {
    getDataFromCookieMock.mockResolvedValueOnce({
      userId: "u1",
      username: "carlos",
      refreshToken: "expired-refresh-token",
      jwt: "old-access-token",
    });
    mutateMock.mockResolvedValueOnce({ data: { refreshToken: null } });

    const result = await refreshAccessToken();

    expect(result).toBe(false);
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("returns false when the mutation call itself throws", async () => {
    getDataFromCookieMock.mockResolvedValueOnce({
      userId: "u1",
      username: "carlos",
      refreshToken: "refresh-token",
      jwt: "old-access-token",
    });
    mutateMock.mockRejectedValueOnce(new Error("network error"));

    const result = await refreshAccessToken();

    expect(result).toBe(false);
    expect(createSessionMock).not.toHaveBeenCalled();
  });
});

function loginFormData(username = "carlos", password = "password123") {
  const data = new FormData();
  data.set("username", username);
  data.set("password", password);
  return data;
}

describe("login", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    createSessionMock.mockReset();
    redirectMock.mockReset();
  });

  it("authenticates, stores the session, and redirects home", async () => {
    mutateMock.mockResolvedValueOnce({
      data: { authenticate: { accessToken: "access-tok", refreshToken: "refresh-tok", clerkId: "u1" } },
    });

    await login(null, loginFormData());

    expect(createSessionMock).toHaveBeenCalledWith({
      userId: "u1",
      username: "carlos",
      jwt: "access-tok",
      refreshToken: "refresh-tok",
    });
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("throws a generic error and never redirects when credentials fail validation", async () => {
    await expect(login(null, loginFormData("ab", "short"))).rejects.toThrow("Failed to login.");

    expect(mutateMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("throws a generic error and never redirects when the backend rejects the credentials", async () => {
    mutateMock.mockRejectedValueOnce(new Error("Invalid credentials"));

    await expect(login(null, loginFormData())).rejects.toThrow("Failed to login.");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("register", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    createSessionMock.mockReset();
    redirectMock.mockReset();
  });

  it("registers, stores the session, and redirects home", async () => {
    mutateMock.mockResolvedValueOnce({
      data: { register: { accessToken: "access-tok", refreshToken: "refresh-tok", clerkId: "u2" } },
    });

    await register(null, loginFormData("newuser", "password123"));

    expect(createSessionMock).toHaveBeenCalledWith({
      userId: "u2",
      username: "newuser",
      jwt: "access-tok",
      refreshToken: "refresh-tok",
    });
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("throws a generic error without registering when the username is too short", async () => {
    await expect(register(null, loginFormData("ab", "password123"))).rejects.toThrow("Failed to login.");
    expect(mutateMock).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    deleteSessionMock.mockReset();
    redirectMock.mockReset();
  });

  it("calls the logout mutation, deletes the session cookie, and redirects home", async () => {
    mutateMock.mockResolvedValueOnce({ data: {} });

    await logout(null, new FormData());

    expect(mutateMock).toHaveBeenCalled();
    expect(deleteSessionMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});

describe("changePassword", () => {
  beforeEach(() => mutateMock.mockReset());

  it("sends the four password fields to the mutation and reports success", async () => {
    mutateMock.mockResolvedValueOnce({ data: { changePassword: true } });
    const data = new FormData();
    data.set("username", "carlos");
    data.set("currentPassword", "old-pw");
    data.set("newPassword", "new-pw");
    data.set("confirmPassword", "new-pw");

    const result = await changePassword(null, data);

    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({
      variables: { username: "carlos", currentPassword: "old-pw", newPassword: "new-pw", confirmationPassword: "new-pw" },
    }));
    expect(result).toEqual({ message: "password changed succesfuly" });
  });
});

describe("auth", () => {
  beforeEach(() => getDataFromCookieMock.mockReset());

  it("returns the userId from the session cookie", async () => {
    getDataFromCookieMock.mockResolvedValueOnce({ userId: "u1" });

    expect(await auth()).toEqual({ userId: "u1" });
  });

  it("returns an undefined userId when there is no session", async () => {
    getDataFromCookieMock.mockResolvedValueOnce(undefined);

    expect(await auth()).toEqual({ userId: undefined });
  });
});

describe("currentUser", () => {
  beforeEach(() => getDataFromCookieMock.mockReset());

  it("returns id/username from the session cookie when present", async () => {
    getDataFromCookieMock.mockResolvedValueOnce({ userId: "u1", username: "carlos" });

    expect(await currentUser()).toEqual({ id: "u1", username: "carlos" });
  });

  it("returns empty id/username when there is no session", async () => {
    getDataFromCookieMock.mockResolvedValueOnce(undefined);

    expect(await currentUser()).toEqual({ id: "", username: "" });
  });
});

describe("getAdminUser", () => {
  beforeEach(() => {
    getDataFromCookieMock.mockReset();
    redirectMock.mockReset();
    vi.stubEnv("ADMIN_USER_ID", "admin-1");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("returns the user without redirecting when their id matches ADMIN_USER_ID", async () => {
    getDataFromCookieMock.mockResolvedValueOnce({ userId: "admin-1", username: "admin" });

    const result = await getAdminUser();

    expect(result).toEqual({ id: "admin-1", username: "admin" });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects home when the caller's id does not match ADMIN_USER_ID", async () => {
    getDataFromCookieMock.mockResolvedValueOnce({ userId: "u1", username: "carlos" });

    await getAdminUser();

    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("redirects home when there is no session at all", async () => {
    getDataFromCookieMock.mockResolvedValueOnce(undefined);

    await getAdminUser();

    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
