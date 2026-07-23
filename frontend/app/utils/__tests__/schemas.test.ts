import { describe, expect, it } from "vitest";
import { productSchema, reviewSchema, userSchema, validateWithZodSchema } from "../schemas";

describe("productSchema", () => {
  const validProduct = {
    name: "Oak Chair",
    company: "Acme",
    featured: true,
    price: 100,
    description: "A sturdy oak chair.",
  };

  it("accepts a valid product", () => {
    expect(() => validateWithZodSchema(productSchema, validProduct)).not.toThrow();
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(() =>
      validateWithZodSchema(productSchema, { ...validProduct, name: "A" }),
    ).toThrow(/at least 2 characters/);
  });

  it("rejects a negative price", () => {
    expect(() =>
      validateWithZodSchema(productSchema, { ...validProduct, price: -1 }),
    ).toThrow(/positive number/);
  });

  it("rejects a description shorter than 10 characters", () => {
    expect(() =>
      validateWithZodSchema(productSchema, { ...validProduct, description: "short" }),
    ).toThrow(/between 10 and 1000 characters/);
  });

  it("coerces a numeric-string price", () => {
    const result = validateWithZodSchema(productSchema, { ...validProduct, price: "150" });
    expect(result.price).toBe(150);
  });
});

describe("reviewSchema", () => {
  const validReview = {
    productId: "p1",
    authorName: "Carlos",
    authorImageUrl: "https://example.com/avatar.png",
    rating: 5,
    comment: "Great product, very happy with it.",
  };

  it("accepts a valid review", () => {
    expect(() => validateWithZodSchema(reviewSchema, validReview)).not.toThrow();
  });

  it("rejects a rating above 5", () => {
    expect(() =>
      validateWithZodSchema(reviewSchema, { ...validReview, rating: 6 }),
    ).toThrow(/at most 5/);
  });

  it("rejects a rating below 1", () => {
    expect(() =>
      validateWithZodSchema(reviewSchema, { ...validReview, rating: 0 }),
    ).toThrow(/at least 1/);
  });

  it("rejects an empty productId", () => {
    expect(() =>
      validateWithZodSchema(reviewSchema, { ...validReview, productId: "" }),
    ).toThrow(/Product ID cannot be empty/);
  });
});

describe("userSchema", () => {
  it("accepts a valid username/password pair", () => {
    expect(() =>
      validateWithZodSchema(userSchema, { username: "carlos", password: "password123" }),
    ).not.toThrow();
  });

  it("rejects a username shorter than 3 characters", () => {
    expect(() =>
      validateWithZodSchema(userSchema, { username: "ab", password: "password123" }),
    ).toThrow(/at least 3 characters/);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(() =>
      validateWithZodSchema(userSchema, { username: "carlos", password: "short" }),
    ).toThrow(/at least 8 characters/);
  });
});
