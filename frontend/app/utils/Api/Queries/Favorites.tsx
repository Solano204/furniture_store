import { gql } from "@apollo/client";

export const ADD_FAVORITE_MUTATION = gql`
  mutation AddFavorite($productId: String!, $clerkId: String!) {
    addFavorite(input: { productId: $productId, clerkId: $clerkId }) {
      id
      productId
      clerkId
    }
  }
`;

export const DELETE_FAVORITE_MUTATION = gql`
  mutation DeleteFavorite($favoriteId: String!) {
    deleteFavorite(favoriteId: $favoriteId)
  }
`;

export const GET_FAVORITE_QUERY = gql`
  query GetFavorite($productId: String!, $clerkId: String!) {
    getFavorite(productId: $productId, clerkId: $clerkId) {
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

export const GET_FAVORITES_QUERY = gql`
  query GetFavorites($clerkId: String!) {
    getFavorites(clerkId: $clerkId) {
      id
      productId
      clerkId
      product {
        id
        name
        company
        description
        image
        featured
        price
        createdAt
      }
    }
  }
`;
