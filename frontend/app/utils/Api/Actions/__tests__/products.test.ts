import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock, mutateMock, uploadImageMock, deleteImageMock, revalidatePathMock, getAdminUserMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutateMock: vi.fn(),
  uploadImageMock: vi.fn(),
  deleteImageMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  getAdminUserMock: vi.fn(),
}));

vi.mock("../../Client", () => ({
  getClient: () => ({ query: queryMock, mutate: mutateMock }),
}));

vi.mock("@/app/utils/supebase", () => ({
  uploadImage: uploadImageMock,
  deleteImage: deleteImageMock,
}));

vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

vi.mock("../Security", () => ({
  getAdminUser: getAdminUserMock,
}));

import {
  fetchFeaturedProducts,
  createProductAction,
  fetchSingleProduct,
  deleteProductAction,
  updateProductAction,
  updateProductImageAction,
} from "../Products";

// deleteProductAction is the exact function behind the admin/products
// delete-button regression flagged in TESTING_NOTES.md - covered first and
// most thoroughly here.
describe("deleteProductAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminUserMock.mockResolvedValue({ id: "admin-1", username: "admin" });
  });

  it("looks up the product, deletes it via GraphQL, deletes its image, and revalidates the admin list", async () => {
    queryMock.mockResolvedValue({ data: { getProductById: { id: "p1", image: "https://img/old.jpg" } } });
    mutateMock.mockResolvedValue({ data: { deleteProduct: true } });

    const result = await deleteProductAction({ productId: "p1" });

    expect(getAdminUserMock).toHaveBeenCalled();
    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({ variables: { productId: "p1" } }));
    expect(deleteImageMock).toHaveBeenCalledWith("https://img/old.jpg");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/products");
    expect(result).toEqual({ message: "Product removed successfully" });
  });

  it("returns an error message (and never touches the image) when the delete mutation itself fails", async () => {
    queryMock.mockResolvedValue({ data: { getProductById: { id: "p1", image: "https://img/old.jpg" } } });
    mutateMock.mockRejectedValue(new Error("GraphQL delete failed"));

    const result = await deleteProductAction({ productId: "p1" });

    expect(result).toEqual({ message: "GraphQL delete failed" });
    expect(deleteImageMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns an error message when the product lookup itself fails", async () => {
    queryMock.mockRejectedValue(new Error("Network error"));

    const result = await deleteProductAction({ productId: "missing" });

    expect(result).toEqual({ message: "Network error" });
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("requires an admin - never calls query/mutate when getAdminUser redirects (throws)", async () => {
    getAdminUserMock.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(deleteProductAction({ productId: "p1" })).rejects.toThrow("NEXT_REDIRECT");
    expect(queryMock).not.toHaveBeenCalled();
  });
});

describe("fetchFeaturedProducts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the featured products from the GraphQL response", async () => {
    queryMock.mockResolvedValue({ data: { getFeaturedProducts: [{ id: "p1" }] } });

    expect(await fetchFeaturedProducts()).toEqual([{ id: "p1" }]);
  });

  it("wraps a query failure in a generic error message", async () => {
    queryMock.mockRejectedValue(new Error("boom"));

    await expect(fetchFeaturedProducts()).rejects.toThrow("Failed to fetch featured products");
  });
});

describe("fetchSingleProduct", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the product when found", async () => {
    queryMock.mockResolvedValue({ data: { getProductById: { id: "p1", name: "Chair" } } });

    expect(await fetchSingleProduct("p1")).toEqual({ id: "p1", name: "Chair" });
  });

  it("throws when the product is not found", async () => {
    queryMock.mockResolvedValue({ data: { getProductById: null } });

    await expect(fetchSingleProduct("missing")).rejects.toThrow("Product not found");
  });
});

describe("createProductAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminUserMock.mockResolvedValue({ id: "admin-1", username: "admin" });
    queryMock.mockResolvedValue({ data: { searchProducts: [] } }); // no name collision by default
  });

  function formDataWith(overrides: Record<string, string> = {}) {
    const data = new FormData();
    data.set("name", overrides.name ?? "Oak Chair");
    data.set("company", overrides.company ?? "Acme");
    data.set("price", overrides.price ?? "100");
    data.set("description", overrides.description ?? "A sturdy oak chair for the living room.");
    data.set("image", new File(["fake-bytes"], "chair.jpg", { type: "image/jpeg" }));
    return data;
  }

  it("uploads the image, creates the product via GraphQL, and revalidates the admin list", async () => {
    uploadImageMock.mockResolvedValue("https://img/chair.jpg");
    mutateMock.mockResolvedValue({ data: { createProduct: { id: "p1" } } });

    const result = await createProductAction(null, formDataWith());

    expect(uploadImageMock).toHaveBeenCalled();
    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({
      variables: expect.objectContaining({ name: "Oak Chair", company: "Acme", price: 100, image: "https://img/chair.jpg", clerkId: "admin-1" }),
    }));
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/products");
    expect(result).toEqual({ message: "Product created successfully" });
  });

  it("returns a validation error and never uploads/mutates for an invalid field (name too short)", async () => {
    const result = await createProductAction(null, formDataWith({ name: "A" }));

    expect(result.message).toMatch(/at least 2 characters/);
    expect(uploadImageMock).not.toHaveBeenCalled();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("returns an error message when the create mutation fails after a successful upload", async () => {
    uploadImageMock.mockResolvedValue("https://img/chair.jpg");
    mutateMock.mockRejectedValue(new Error("GraphQL create failed"));

    const result = await createProductAction(null, formDataWith());

    expect(result).toEqual({ message: "GraphQL create failed" });
  });

  it("rejects a name that already exists (case-insensitive) - no image upload, no mutation", async () => {
    queryMock.mockResolvedValue({ data: { searchProducts: [{ id: "p-existing", name: "oak chair" }] } });

    const result = await createProductAction(null, formDataWith({ name: "Oak Chair" }));

    expect(result.message).toMatch(/already exists/);
    expect(uploadImageMock).not.toHaveBeenCalled();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("does not flag a different product whose name only partially matches the search", async () => {
    queryMock.mockResolvedValue({ data: { searchProducts: [{ id: "p-other", name: "Oak Chair Deluxe" }] } });
    uploadImageMock.mockResolvedValue("https://img/chair.jpg");
    mutateMock.mockResolvedValue({ data: { createProduct: { id: "p1" } } });

    const result = await createProductAction(null, formDataWith({ name: "Oak Chair" }));

    expect(result).toEqual({ message: "Product created successfully" });
    expect(mutateMock).toHaveBeenCalled();
  });
});

describe("updateProductAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminUserMock.mockResolvedValue({ id: "admin-1", username: "admin" });
    queryMock.mockResolvedValue({ data: { searchProducts: [] } }); // no name collision by default
  });

  it("validates and mutates, then revalidates the edit page for that product", async () => {
    mutateMock.mockResolvedValue({ data: { updateProduct: { id: "p1" } } });
    const data = new FormData();
    data.set("id", "p1");
    data.set("name", "Oak Chair");
    data.set("company", "Acme");
    data.set("price", "120");
    data.set("description", "A sturdy oak chair for the living room.");

    const result = await updateProductAction(null, data);

    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({
      variables: expect.objectContaining({ productId: "p1", price: 120 }),
    }));
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/products/p1/edit");
    expect(result).toEqual({ message: "Product updated successfully" });
  });

  it("returns a validation error without mutating when the price is negative", async () => {
    const data = new FormData();
    data.set("id", "p1");
    data.set("name", "Oak Chair");
    data.set("company", "Acme");
    data.set("price", "-5");
    data.set("description", "A sturdy oak chair for the living room.");

    const result = await updateProductAction(null, data);

    expect(result.message).toMatch(/positive number/);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("rejects renaming a product to a name another product already has", async () => {
    queryMock.mockResolvedValue({ data: { searchProducts: [{ id: "p-other", name: "Oak Chair" }] } });
    const data = new FormData();
    data.set("id", "p1");
    data.set("name", "Oak Chair");
    data.set("company", "Acme");
    data.set("price", "120");
    data.set("description", "A sturdy oak chair for the living room.");

    const result = await updateProductAction(null, data);

    expect(result.message).toMatch(/already exists/);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("re-saving a product under its own unchanged name is not flagged as a duplicate of itself", async () => {
    queryMock.mockResolvedValue({ data: { searchProducts: [{ id: "p1", name: "Oak Chair" }] } });
    mutateMock.mockResolvedValue({ data: { updateProduct: { id: "p1" } } });
    const data = new FormData();
    data.set("id", "p1");
    data.set("name", "Oak Chair");
    data.set("company", "Acme");
    data.set("price", "120");
    data.set("description", "A sturdy oak chair for the living room.");

    const result = await updateProductAction(null, data);

    expect(result).toEqual({ message: "Product updated successfully" });
    expect(mutateMock).toHaveBeenCalled();
  });
});

describe("updateProductImageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminUserMock.mockResolvedValue({ id: "admin-1", username: "admin" });
  });

  it("uploads the new image, deletes the old one, mutates, and revalidates", async () => {
    uploadImageMock.mockResolvedValue("https://img/new.jpg");
    mutateMock.mockResolvedValue({ data: {} });
    const data = new FormData();
    data.set("id", "p1");
    data.set("url", "https://img/old.jpg");
    data.set("image", new File(["x"], "new.jpg", { type: "image/jpeg" }));

    const result = await updateProductImageAction(null, data);

    expect(deleteImageMock).toHaveBeenCalledWith("https://img/old.jpg");
    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({ variables: { productId: "p1", image: "https://img/new.jpg" } }));
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/products/p1/edit");
    expect(result).toEqual({ message: "Product image updated successfully" });
  });

  it("returns a validation error for a non-image file, without touching storage", async () => {
    const data = new FormData();
    data.set("id", "p1");
    data.set("url", "https://img/old.jpg");
    data.set("image", new File(["x"], "doc.pdf", { type: "application/pdf" }));

    const result = await updateProductImageAction(null, data);

    expect(result.message).toMatch(/must be an image/);
    expect(uploadImageMock).not.toHaveBeenCalled();
    expect(deleteImageMock).not.toHaveBeenCalled();
  });
});
