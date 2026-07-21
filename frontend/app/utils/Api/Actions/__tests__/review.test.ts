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

import {
  createReviewAction,
  fetchProductReviews,
  fetchProductRating,
  fetchProductReviewsByUser,
  deleteReviewAction,
  findExistingReview,
} from "../Review";

function reviewFormData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  data.set("productId", overrides.productId ?? "p1");
  data.set("authorName", overrides.authorName ?? "Jane");
  data.set("authorImageUrl", overrides.authorImageUrl ?? "https://img/avatar.png");
  data.set("rating", overrides.rating ?? "5");
  data.set("comment", overrides.comment ?? "Great product, very happy with it.");
  return data;
}

describe("createReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
  });

  it("validates, mutates with the clerkId attached, and revalidates the product page", async () => {
    mutateMock.mockResolvedValue({ data: { createReview: { id: "r1" } } });

    const result = await createReviewAction(null, reviewFormData());

    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({
      variables: expect.objectContaining({ productId: "p1", rating: 5, clerkId: "u1" }),
    }));
    expect(revalidatePathMock).toHaveBeenCalledWith("/products/p1");
    expect(result).toEqual({ message: "Review submitted successfully" });
  });

  it("returns a friendly error and does not mutate when the rating is out of range", async () => {
    const result = await createReviewAction(null, reviewFormData({ rating: "6" }));

    expect(result).toEqual({ message: "Failed to submit review, please try again." });
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("returns a friendly error when the mutation itself fails", async () => {
    mutateMock.mockRejectedValue(new Error("network down"));

    const result = await createReviewAction(null, reviewFormData());

    expect(result).toEqual({ message: "Failed to submit review, please try again." });
  });
});

describe("fetchProductReviews", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the product's reviews", async () => {
    queryMock.mockResolvedValue({ data: { getProductReviews: [{ id: "r1" }] } });

    expect(await fetchProductReviews("p1")).toEqual([{ id: "r1" }]);
  });

  it("returns an empty array when the query fails", async () => {
    queryMock.mockRejectedValue(new Error("boom"));

    expect(await fetchProductReviews("p1")).toEqual([]);
  });
});

describe("fetchProductRating", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the average rating and count", async () => {
    queryMock.mockResolvedValue({ data: { getReviewAggregate: { avgRating: 4.5, ratingCount: 10 } } });

    expect(await fetchProductRating("p1")).toEqual({ rating: 4.5, count: 10 });
  });

  it("defaults to zero on failure", async () => {
    queryMock.mockRejectedValue(new Error("boom"));

    expect(await fetchProductRating("p1")).toEqual({ rating: 0, count: 0 });
  });
});

describe("fetchProductReviewsByUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
  });

  it("converts createdAt/updatedAt strings into Date objects", async () => {
    queryMock.mockResolvedValue({
      data: { getUserReviews: [{ id: "r1", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" }] },
    });

    const [review] = await fetchProductReviewsByUser();

    expect(review.createdAt).toBeInstanceOf(Date);
    expect(review.updatedAt).toBeInstanceOf(Date);
  });

  it("returns an empty array when the query fails", async () => {
    queryMock.mockRejectedValue(new Error("boom"));

    expect(await fetchProductReviewsByUser()).toEqual([]);
  });
});

describe("deleteReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserMock.mockResolvedValue({ id: "u1", username: "jane" });
  });

  it("deletes the review, scoped to the caller's clerkId, and revalidates /reviews", async () => {
    mutateMock.mockResolvedValue({ data: { deleteReview: true } });

    const result = await deleteReviewAction({ reviewId: "r1" });

    expect(mutateMock).toHaveBeenCalledWith(expect.objectContaining({ variables: { id: "r1", clerkId: "u1" } }));
    expect(revalidatePathMock).toHaveBeenCalledWith("/reviews");
    expect(result).toEqual({ message: "Review deleted successfully" });
  });

  it("reports a failed delete when the backend returns no data, without throwing", async () => {
    mutateMock.mockResolvedValue({ data: null });

    const result = await deleteReviewAction({ reviewId: "r1" });

    expect(result).toEqual({ message: "failed delete review" });
  });

  it("returns a friendly error when the mutation throws", async () => {
    mutateMock.mockRejectedValue(new Error("network down"));

    const result = await deleteReviewAction({ reviewId: "r1" });

    expect(result).toEqual({ message: "Failed to delete review, please try again." });
  });
});

describe("findExistingReview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the review when the user already reviewed this product", async () => {
    queryMock.mockResolvedValue({ data: { getReviewUserProduct: { id: "r1" } } });

    expect(await findExistingReview("u1", "p1")).toEqual({ id: "r1" });
  });

  it("returns false when there is no existing review", async () => {
    queryMock.mockResolvedValue({ data: { getReviewUserProduct: null } });

    expect(await findExistingReview("u1", "p1")).toBe(false);
  });

  it("returns null (not a thrown error) when the query fails", async () => {
    queryMock.mockRejectedValue(new Error("boom"));

    expect(await findExistingReview("u1", "p1")).toBeNull();
  });
});
