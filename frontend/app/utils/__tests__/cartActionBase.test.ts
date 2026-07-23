import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock, authMock, currentUserMock, fetchProductMock, redirectMock, revalidatePathMock } = vi.hoisted(() => ({
  dbMock: {
    cart: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    cartItem: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), findMany: vi.fn() },
  },
  authMock: vi.fn(),
  currentUserMock: vi.fn(),
  fetchProductMock: vi.fn(),
  redirectMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/app/utils/db", () => ({ default: dbMock }));
vi.mock("@/app/utils/Api/Actions/Security", () => ({ auth: authMock, currentUser: currentUserMock }));
vi.mock("../Api/Actions/Products", () => ({ fetchProduct: fetchProductMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

const {
  fetchCartItems,
  fetchOrCreateCart,
  updateCart,
  addToCartAction,
  removeCartItemAction,
  updateCartItemAction,
} = await import("../cartActionBase");

describe("fetchCartItems", () => {
  beforeEach(() => {
    Object.values(dbMock.cart).forEach((fn) => fn.mockReset());
    authMock.mockReset();
  });

  it("returns the signed-in user's item count", async () => {
    authMock.mockResolvedValue({ userId: "u1" });
    dbMock.cart.findFirst.mockResolvedValue({ numItemsInCart: 3 });

    expect(await fetchCartItems()).toBe(3);
  });

  it("returns 0 when there is no cart yet", async () => {
    authMock.mockResolvedValue({ userId: "u1" });
    dbMock.cart.findFirst.mockResolvedValue(null);

    expect(await fetchCartItems()).toBe(0);
  });
});

describe("fetchOrCreateCart", () => {
  beforeEach(() => {
    Object.values(dbMock.cart).forEach((fn) => fn.mockReset());
    fetchProductMock.mockReset();
  });

  it("returns the existing cart, enriched with product data for each cart item", async () => {
    dbMock.cart.findFirst.mockResolvedValue({ id: "cart-1", cartItems: [{ productId: "p1", amount: 2 }] });
    fetchProductMock.mockResolvedValue({ id: "p1", name: "Chair", price: 50 });

    const cart = await fetchOrCreateCart({ userId: "u1" });

    expect(cart.cartItems[0].product).toEqual({ id: "p1", name: "Chair", price: 50 });
    expect(dbMock.cart.create).not.toHaveBeenCalled();
  });

  it("creates a new empty cart when the user has none and errorOnFailure is not set", async () => {
    dbMock.cart.findFirst.mockResolvedValue(null);
    dbMock.cart.create.mockResolvedValue({ id: "cart-new", cartItems: [] });

    const cart = await fetchOrCreateCart({ userId: "u1" });

    expect(dbMock.cart.create).toHaveBeenCalledWith(expect.objectContaining({ data: { clerkId: "u1" } }));
    expect(cart.id).toBe("cart-new");
  });

  it("throws instead of creating a cart when errorOnFailure is true and none exists", async () => {
    dbMock.cart.findFirst.mockResolvedValue(null);

    await expect(fetchOrCreateCart({ userId: "u1", errorOnFailure: true })).rejects.toThrow("Cart not found");
    expect(dbMock.cart.create).not.toHaveBeenCalled();
  });
});

describe("updateCart", () => {
  beforeEach(() => {
    Object.values(dbMock.cart).forEach((fn) => fn.mockReset());
    Object.values(dbMock.cartItem).forEach((fn) => fn.mockReset());
    fetchProductMock.mockReset();
  });

  it("zeroes out the cart when it has no items", async () => {
    dbMock.cartItem.findMany.mockResolvedValue([]);
    dbMock.cart.update.mockResolvedValue({ id: "cart-1", numItemsInCart: 0, cartTotal: 0, tax: 0, orderTotal: 0 });

    await updateCart({ id: "cart-1", taxRate: 0.1, shipping: 5 } as any);

    expect(dbMock.cart.update).toHaveBeenCalledWith({
      where: { id: "cart-1" },
      data: { numItemsInCart: 0, cartTotal: 0, tax: 0, orderTotal: 0 },
    });
  });

  it("computes numItemsInCart/cartTotal/tax/shipping/orderTotal from the priced cart items", async () => {
    dbMock.cartItem.findMany.mockResolvedValue([
      { productId: "p1", amount: 2 },
      { productId: "p2", amount: 1 },
    ]);
    fetchProductMock.mockImplementation(async (id: string) =>
      id === "p1" ? { id: "p1", price: 10 } : { id: "p2", price: 25 },
    );
    dbMock.cart.update.mockImplementation(async ({ data }: any) => ({ id: "cart-1", ...data }));

    // cartTotal = 2*10 + 1*25 = 45; tax = 0.1 * 45 = 4.5; shipping = 5 (cartTotal > 0); orderTotal = 54.5
    const result = await updateCart({ id: "cart-1", taxRate: 0.1, shipping: 5 } as any);

    expect(result).toEqual({ id: "cart-1", numItemsInCart: 3, cartTotal: 45, tax: 4.5, orderTotal: 54.5 });
  });

  it("propagates the failure when a cart item's product has since been deleted (fetchProduct rejects, per fetchSingleProduct's contract)", async () => {
    dbMock.cartItem.findMany.mockResolvedValue([{ productId: "p1", amount: 2 }, { productId: "deleted", amount: 1 }]);
    fetchProductMock.mockImplementation(async (id: string) =>
      id === "p1" ? { id: "p1", price: 10 } : Promise.reject(new Error("Product not found")),
    );

    await expect(updateCart({ id: "cart-1", taxRate: 0, shipping: 0 } as any)).rejects.toThrow("Product not found");
    expect(dbMock.cart.update).not.toHaveBeenCalled();
  });

  it("charges no shipping when the cart total is zero (e.g. every line-item product was free)", async () => {
    dbMock.cartItem.findMany.mockResolvedValue([{ productId: "p1", amount: 2 }]);
    fetchProductMock.mockResolvedValue({ id: "p1", price: 0 });
    dbMock.cart.update.mockImplementation(async ({ data }: any) => ({ id: "cart-1", ...data }));

    const result = await updateCart({ id: "cart-1", taxRate: 0.1, shipping: 5 } as any);

    expect(result).toEqual({ id: "cart-1", numItemsInCart: 2, cartTotal: 0, tax: 0, orderTotal: 0 });
  });
});

describe("addToCartAction", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
    fetchProductMock.mockReset();
    Object.values(dbMock.cart).forEach((fn) => fn.mockReset());
    Object.values(dbMock.cartItem).forEach((fn) => fn.mockReset());
    redirectMock.mockReset();
  });

  it("adds a new cart item when none exists yet for that product, then redirects to /cart", async () => {
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
    fetchProductMock.mockResolvedValue({ id: "p1", price: 10 });
    dbMock.cart.findFirst.mockResolvedValue({ id: "cart-1", cartItems: [] });
    dbMock.cartItem.findFirst.mockResolvedValue(null);
    dbMock.cartItem.findMany.mockResolvedValue([]);
    dbMock.cart.update.mockResolvedValue({});
    const data = new FormData();
    data.set("productId", "p1");
    data.set("amount", "2");

    await addToCartAction(null, data);

    expect(dbMock.cartItem.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ productId: "p1", cartId: "cart-1", amount: 2 }),
    }));
    expect(redirectMock).toHaveBeenCalledWith("/cart");
  });

  it("increments the existing cart item's amount instead of creating a duplicate", async () => {
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
    fetchProductMock.mockResolvedValue({ id: "p1", price: 10 });
    dbMock.cart.findFirst.mockResolvedValue({ id: "cart-1", cartItems: [] });
    dbMock.cartItem.findFirst.mockResolvedValue({ id: "item-1", amount: 3 });
    dbMock.cartItem.findMany.mockResolvedValue([]);
    dbMock.cart.update.mockResolvedValue({});
    const data = new FormData();
    data.set("productId", "p1");
    data.set("amount", "2");

    await addToCartAction(null, data);

    expect(dbMock.cartItem.update).toHaveBeenCalledWith({ where: { id: "item-1" }, data: { amount: 5 } });
    expect(dbMock.cartItem.create).not.toHaveBeenCalled();
  });
});

describe("removeCartItemAction", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
    Object.values(dbMock.cart).forEach((fn) => fn.mockReset());
    Object.values(dbMock.cartItem).forEach((fn) => fn.mockReset());
    revalidatePathMock.mockReset();
  });

  it("deletes the cart item, recomputes the cart, and revalidates /cart", async () => {
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
    dbMock.cart.findFirst.mockResolvedValue({ id: "cart-1", cartItems: [] });
    dbMock.cartItem.findMany.mockResolvedValue([]);
    dbMock.cart.update.mockResolvedValue({});
    const data = new FormData();
    data.set("id", "item-1");

    const result = await removeCartItemAction(null, data);

    expect(dbMock.cartItem.delete).toHaveBeenCalledWith({ where: { id: "item-1", cartId: "cart-1" } });
    expect(revalidatePathMock).toHaveBeenCalledWith("/cart");
    expect(result).toEqual({ message: "Item removed from cart" });
  });

  it("returns an error message instead of throwing when the cart cannot be found", async () => {
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
    dbMock.cart.findFirst.mockResolvedValue(null);
    const data = new FormData();
    data.set("id", "item-1");

    const result = await removeCartItemAction(null, data);

    expect(result).toEqual({ message: "Cart not found" });
  });
});

describe("updateCartItemAction", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
    Object.values(dbMock.cart).forEach((fn) => fn.mockReset());
    Object.values(dbMock.cartItem).forEach((fn) => fn.mockReset());
    revalidatePathMock.mockReset();
  });

  it("updates the item's amount, recomputes the cart, and revalidates /cart", async () => {
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
    dbMock.cart.findFirst.mockResolvedValue({ id: "cart-1", cartItems: [] });
    dbMock.cartItem.findMany.mockResolvedValue([]);
    dbMock.cart.update.mockResolvedValue({});

    const result = await updateCartItemAction({ amount: 5, cartItemId: "item-1" });

    expect(dbMock.cartItem.update).toHaveBeenCalledWith({ where: { id: "item-1", cartId: "cart-1" }, data: { amount: 5 } });
    expect(result).toEqual({ message: "Cart updated" });
  });
});
