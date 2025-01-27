import { gql } from "@apollo/client";

// Add Favorite Mutation
export const addFavoriteMutation = (productId: string, clerkId: string) => gql`
  mutation {
    addFavorite(input: {
      productId: "${productId}",
      clerkId: "${clerkId}"
    }) {
      id
      productId
      clerkId
    }
  }
`;

// Delete Favorite Mutation
export const deleteFavoriteMutation = (favoriteId: string) => gql`
  mutation {
    deleteFavorite(favoriteId: "${favoriteId}")
  }
`;

// Get Favorite Query
export const getFavoriteQuery = (productId: string, clerkId: string) => gql`
  query {
    getFavorite(productId: "${productId}", clerkId: "${clerkId}") {
      id
      productId
      clerkId
      product {
        id
        name
        description
      }
    }
  }
`;

// Get Favorites Query
export const getFavoritesQuery = (clerkId: string) => gql`
  query {
    getFavorites(clerkId: "${clerkId}") {
      id
      productId
      clerkId
      product {
        id
        name
        description
      }
    }
  }
`;
