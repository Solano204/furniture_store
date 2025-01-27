"use server";
import { uploadImage, deleteImage } from "@/app/utils/supebase";
import { revalidatePath } from "next/cache";
import {
  productSchema,
  validateWithZodSchema,
  imageSchema,
  reviewSchema,
} from "../../schemas";
import { getClient } from "../Client";
import { fetchOrCreateCart } from "../../cartActionBase";
import db from "@/app/utils/db";
import { redirect } from "next/navigation";
import { auth, currentUser, getAdminUser } from "../Actions/Security";
import {
  deleteReviewMutation,
  getCharactersQuery,
  getReviewAggregateQuery,
  getReviewUserProductQuery,
  getUserReviewsQuery,
  createReviewMutation,
} from "../Queries/Review";
import { getProductReviewsQuery } from "../Queries/Products";
import { gql } from "@apollo/client";

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

    console.log("validatedFields", validatedFields);
    const createReviewMutation =  gql`
    mutation {
      createReview(
        input: {
          productId: "${validatedFields.productId}",
          authorName: "${validatedFields.authorName}",
          authorImageUrl: "${validatedFields.authorImageUrl}",
          rating: ${validatedFields.rating},
          comment: "${validatedFields.comment}",
          clerkId: "${user.id}"
        }
      ) {
        id
        productId
        rating
        comment
        clerkId
        createdAt
      }
    }
  `;

    const { data } = await getClient().mutate({
      mutation: createReviewMutation,
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

    const user = await currentUser();
    const getProductReviewsQuery =   gql`
    query {
      getProductReviews(productId: "${productId}") {
        id
        productId
        rating
        authorName
        authorImageUrl
        comment
        clerkId
        createdAt
      }
    }
  `;

    const { data } = await getClient().query({
      query: getProductReviewsQuery,
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

  const getReviewAggregateQuery =  gql`
  query {
    getReviewAggregate(productId: "${productId}") {
      productId
      avgRating
      ratingCount
    }
  }
`;

    const { data } = await getClient().query({
      query: getReviewAggregateQuery,
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
    const getUserReviewsQuery = gql`
      query {
        getUserReviews(clerkId: "${user.id}") {
          id
          rating
          comment
          authorName
          authorImageUrl
          createdAt
          product {
            id
            name
            image
          }
        }
      }
    `;

    const { data } = await getClient().query({
      query: getUserReviewsQuery,
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
    const deleteReviewMutation = gql`
    mutation {
      deleteReview(id: "${reviewId}", clerkId: "${user.id}")
    }
  `;
  
    const { data } = await getClient().mutate({
      mutation: deleteReviewMutation,
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
      query: gql`
        query {
          getReviewUserProduct(productId: "${productId}", clerkId: "${userId}")
        }
      `,
    });

    return data?.getReviewUserProduct || false;
  } catch (error) {
    console.error("Error finding existing review:", error);
    return null; // Return null if no review is found or an error occurs
  }
};
