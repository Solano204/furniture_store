"use server";
import { revalidatePath } from "next/cache";
import {
  reviewSchema,
  validateWithZodSchema,
} from "../../schemas";
import { getClient } from "../Client";
import { currentUser } from "../Actions/Security";
import {
  DELETE_REVIEW_MUTATION,
  GET_REVIEW_AGGREGATE_QUERY,
  GET_REVIEW_USER_PRODUCT_QUERY,
  GET_USER_REVIEWS_QUERY,
  CREATE_REVIEW_MUTATION,
  GET_PRODUCT_REVIEWS_QUERY,
} from "../Queries/Review";

type Review = {
  id: string; // Unique identifier for the review
  clerkId: string; // User ID of the reviewer
  rating: number; // Star rating given by the user
  comment: string; // Review comment
  authorName: string; // Name of the reviewer
  authorImageUrl: string; // URL of the reviewer's profile image
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Update timestamp
  product: {
    id: string; // Product ID associated with the review
    name: string; // Product name
    image: string; // Product image URL
  };
};


// Create a review
export const createReviewAction = async (
  prevState: any,
  formData: FormData
) => {
  const user = await currentUser();
  try {
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(reviewSchema, rawData);

    const { data } = await getClient().mutate({
      mutation: CREATE_REVIEW_MUTATION,
      variables: {
        productId: validatedFields.productId,
        authorName: validatedFields.authorName,
        authorImageUrl: validatedFields.authorImageUrl,
        rating: validatedFields.rating,
        comment: validatedFields.comment,
        clerkId: user.id,
      },
    });

    // Revalidate the product page to reflect the new review
    revalidatePath(`/products/${validatedFields.productId}`);
    return { message: "Review submitted successfully" };
  } catch (error) {
    console.error("Error creating review:", error);
    return { message: "Failed to submit review, please try again." };
  }
};

// Fetch all reviews for a product
export const fetchProductReviews = async (
  productId: string
): Promise<Review[]> => {
  try {
    const { data } = await getClient().query({
      query: GET_PRODUCT_REVIEWS_QUERY,
      variables: { productId },
    });

    // Return the list of reviews
    return data?.getProductReviews || []; // Return empty array if no reviews found
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return []; // Return empty array in case of error
  }
};

// Fetch average rating and count of reviews for a product
export const fetchProductRating = async (productId: string) => {
  try {
    const { data } = await getClient().query({
      query: GET_REVIEW_AGGREGATE_QUERY,
      variables: { productId },
    });

    // Return average rating and count, default to 0 if no data available
    return {
      rating: data?.getReviewAggregate.avgRating ?? 0,
      count: data?.getReviewAggregate.ratingCount ?? 0,
    };
  } catch (error) {
    console.error("Error fetching product rating:", error);
    return { rating: 0, count: 0 }; // Return default values in case of error
  }
};


export const fetchProductReviewsByUser = async (): Promise<Review[]> => {
  const user = await currentUser(); // Fetch the current user details
  try {
    const { data } = await getClient().query({
      query: GET_USER_REVIEWS_QUERY,
      variables: { clerkId: user.id },
    });

    // Map the API response into the `Review` type
    const reviews: Review[] = data?.getUserReviews.map((review: any) => ({
      ...review,
      createdAt: new Date(review.createdAt), // Convert timestamp to Date object
      updatedAt: new Date(review.updatedAt), // Convert timestamp to Date object
    })) || [];

    return reviews;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return []; // Return an empty array in case of an error
  }
};

// Delete a review
export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState;
  const user = await currentUser();

  try {
    const { data } = await getClient().mutate({
      mutation: DELETE_REVIEW_MUTATION,
      variables: { id: reviewId, clerkId: user.id },
    });

    // Revalidate the reviews page after deletion
    revalidatePath("/reviews");
    return {
      message: data ? "Review deleted successfully" : "failed delete review",
    };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { message: "Failed to delete review, please try again." };
  }
};

// Find an existing review by user and product
export const findExistingReview = async (userId: string, productId: string) => {
  try {
    const { data } = await getClient().query({
      query: GET_REVIEW_USER_PRODUCT_QUERY,
      variables: { productId, clerkId: userId },
    });

    return data?.getReviewUserProduct || false;
  } catch (error) {
    console.error("Error finding existing review:", error);
    return null; // Return null if no review is found or an error occurs
  }
};
