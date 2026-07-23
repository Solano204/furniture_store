import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock, mutateMock, currentUserMock, revalidatePathMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutateMock: vi.fn(),
  currentUserMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("../../Client", () => ({ getClient: () => ({ query: queryMock, mutate: mutateMock }) }));
vi.mock("../Security", () => ({ currentUser: currentUserMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

import { toggleFavoriteAction, fetchFavoriteId, fetchUserFavorites } from "../Favorites";

describe("toggleFavoriteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
  });

  it("adds the product to favorites when it isn't one yet, and revalidates the page", async () => {
    mutateMock.mockResolvedValue({ data: {} });

    const result = await toggleFavoriteAction({ productId: "p1", favoriteId: null, pathname: "/products/p1" });

    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({ variables: { productId: "p1", clerkId: "u1" } }));
    expect(revalidatePathMock).toHaveBeenCalledWith("/products/p1");
    expect(result).toEqual({ message: "Added to Faves" });
  });

  it("removes the favorite when one already exists for the product", async () => {
    mutateMock.mockResolvedValue({ data: {} });

    const result = await toggleFavoriteAction({ productId: "p1", favoriteId: "fav-1", pathname: "/favorites" });

    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({ variables: { favoriteId: "fav-1" } }));
    expect(result).toEqual({ message: "Removed from Faves" });
  });

  it("returns a generic error message when the mutation fails, without throwing", async () => {
    mutateMock.mockRejectedValue(new Error("network down"));

    const result = await toggleFavoriteAction({ productId: "p1", favoriteId: null, pathname: "/" });

    expect(result).toEqual({ message: "Something went wrong" });
  });
});

describe("fetchFavoriteId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
  });

  it("returns the favorite's id when one exists", async () => {
    queryMock.mockResolvedValue({ data: { getFavorite: { id: "fav-1" } } });

    expect(await fetchFavoriteId("p1")).toBe("fav-1");
  });

  it("returns null when there is no favorite for that product", async () => {
    queryMock.mockResolvedValue({ data: { getFavorite: null } });

    expect(await fetchFavoriteId("p1")).toBeNull();
  });

  it("returns null (not a thrown error) when the query fails", async () => {
    queryMock.mockRejectedValue(new Error("boom"));

    expect(await fetchFavoriteId("p1")).toBeNull();
  });
});

describe("fetchUserFavorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
  });

  it("returns the user's favorites", async () => {
    queryMock.mockResolvedValue({ data: { getFavorites: [{ id: "fav-1" }] } });

    expect(await fetchUserFavorites()).toEqual([{ id: "fav-1" }]);
  });

  it("returns an empty array (not a thrown error) when the query fails", async () => {
    queryMock.mockRejectedValue(new Error("boom"));

    expect(await fetchUserFavorites()).toEqual([]);
  });
});
