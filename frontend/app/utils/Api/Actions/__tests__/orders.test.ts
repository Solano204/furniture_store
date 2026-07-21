import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock, mutateMock, currentUserMock, getAdminUserMock, fetchOrCreateCartMock, dbDeleteMock, redirectMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutateMock: vi.fn(),
  currentUserMock: vi.fn(),
  getAdminUserMock: vi.fn(),
  fetchOrCreateCartMock: vi.fn(),
  dbDeleteMock: vi.fn(),
  redirectMock: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }),
}));

vi.mock("../../Client", () => ({ getClient: () => ({ query: queryMock, mutate: mutateMock }) }));
vi.mock("../Security", () => ({ currentUser: currentUserMock, getAdminUser: getAdminUserMock }));
vi.mock("../../../cartActionBase", () => ({ fetchOrCreateCart: fetchOrCreateCartMock }));
vi.mock("@/app/utils/db", () => ({ default: { cart: { delete: dbDeleteMock } } }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createOrder, fetchUserOrders, fetchAdminOrders } from "../Orders";

describe("createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
  });

  it("creates the order from the current cart, deletes the cart, and redirects to /orders", async () => {
    fetchOrCreateCartMock.mockResolvedValue({ id: "cart-1", numItemsInCart: 2, orderTotal: 20, tax: 2, shipping: 5 });
    mutateMock.mockResolvedValue({ data: { createOrder: { id: "order-1" } } });

    await expect(createOrder(null, new FormData())).rejects.toThrow("NEXT_REDIRECT");

    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({
      variables: expect.objectContaining({ clerkId: "u1", products: 2, orderTotal: 20, tax: 2, shipping: 5, username: "jane" }),
    }));
    expect(dbDeleteMock).toHaveBeenCalledWith({ where: { id: "cart-1" } });
    expect(redirectMock).toHaveBeenCalledWith("/orders");
  });

  it("returns an error message and does not delete the cart or redirect when the mutation fails", async () => {
    fetchOrCreateCartMock.mockResolvedValue({ id: "cart-1", numItemsInCart: 2, orderTotal: 20, tax: 2, shipping: 5 });
    mutateMock.mockRejectedValue(new Error("Insufficient stock"));

    const result = await createOrder(null, new FormData());

    expect(result).toEqual({ message: "Insufficient stock" });
    expect(dbDeleteMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("fetchUserOrders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
  });

  it("returns the current user's orders", async () => {
    queryMock.mockResolvedValue({ data: { getUserOrders: [{ id: "order-1" }] } });

    expect(await fetchUserOrders()).toEqual([{ id: "order-1" }]);
    expect(queryMock).toHaveBeenCalledWith(expect.objectContaining({ variables: { clerkId: "u1" } }));
  });
});

describe("fetchAdminOrders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires an admin and returns every order", async () => {
    getAdminUserMock.mockResolvedValue({ id: "admin-1", username: "admin" });
    queryMock.mockResolvedValue({ data: { getOrders: [{ id: "order-1" }, { id: "order-2" }] } });

    expect(await fetchAdminOrders()).toEqual([{ id: "order-1" }, { id: "order-2" }]);
    expect(getAdminUserMock).toHaveBeenCalled();
  });
});
