import { gql } from "@apollo/client";

export const GET_USER_REVIEWS_QUERY = gql`
  query GetUserReviews($clerkId: String!) {
    getUserReviews(clerkId: $clerkId) {
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

export const GET_REVIEW_USER_PRODUCT_QUERY = gql`
  query GetReviewUserProduct($productId: String!, $clerkId: String!) {
    getReviewUserProduct(productId: $productId, clerkId: $clerkId)
  }
`;

export const GET_REVIEW_AGGREGATE_QUERY = gql`
  query GetReviewAggregate($productId: String!) {
    getReviewAggregate(productId: $productId) {
      productId
      avgRating
      ratingCount
    }
  }
`;

export const DELETE_REVIEW_MUTATION = gql`
  mutation DeleteReview($id: String!, $clerkId: String!) {
    deleteReview(id: $id, clerkId: $clerkId)
  }
`;

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview(
    $productId: String!
    $authorName: String
    $authorImageUrl: String
    $rating: Int!
    $comment: String
    $clerkId: String!
  ) {
    createReview(
      input: {
        productId: $productId
        authorName: $authorName
        authorImageUrl: $authorImageUrl
        rating: $rating
        comment: $comment
        clerkId: $clerkId
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

export const GET_PRODUCT_REVIEWS_QUERY = gql`
  query GetProductReviews($productId: String!) {
    getProductReviews(productId: $productId) {
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
