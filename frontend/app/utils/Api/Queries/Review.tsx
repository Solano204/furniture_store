import { gql } from "@apollo/client";

// Characters Query
export const getCharactersQuery = (page: number, name: string) => gql`
  query {
    characters(page: ${page}, filter: { name: "${name}" }) {
      results {
        name
        status
        species
      }
    }
  }
`;

// Get User Reviews Query
export const getUserReviewsQuery = (clerkId: string) => gql`
  query {
    getUserReviews(clerkId: "${clerkId}") {
      id
      rating
      comment
      product {
        id
        name
        image
      }
    }
  }
`;

// Get Review User Product Query
export const getReviewUserProductQuery = (
  productId: string,
  clerkId: string
) => gql`
  query {
    getReviewUserProduct(productId: "${productId}", clerkId: "${clerkId}")
  }
`;

// Get Review Aggregate Query
export const getReviewAggregateQuery = (productId: string) => gql`
  query {
    getReviewAggregate(productId: "${productId}") {
      productId
      avgRating
      ratingCount
    }
  }
`;

// Delete Review Mutation
export const deleteReviewMutation = (id: string, clerkId: string) => gql`
  mutation {
    deleteReview(id: "${id}", clerkId: "${clerkId}")
  }
`;


// Create Review Mutation
export const createReviewMutation = (
  productId: string,
  authorName: string,
  authorImageUrl: string,
  rating: number,
  comment: string,
  clerkId: string
) => gql`
  mutation {
    createReview(
      input: {
        productId: "${productId}",}
        authorName: "${authorName}",
        authorImageUrl: "${authorImageUrl}",
        rating: ${rating},
        comment: "${comment}",
        clerkId: "${clerkId}"
      }
    ) {
      id
      productId
      rating
      comment
      authorName
      authorImageUrl
      clerkId
      createdAt
    }
  }
`;