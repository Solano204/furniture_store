import { gql } from "@apollo/client";

export const GET_FEATURED_PRODUCTS_QUERY = gql`
  query GetFeaturedProducts {
    getFeaturedProducts {
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
`;

export const GET_PRODUCT_BY_ID_QUERY = gql`
  query GetProductById($productId: String!) {
    getProductById(productId: $productId) {
      id
      name
      description
      image
      company
      createdAt
      price
    }
  }
`;

export const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts($company: String!, $name: String!) {
    searchProducts(company: $company, name: $name) {
      id
      name
      description
      image
      price
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct(
    $name: String!
    $description: String!
    $image: String!
    $clerkId: String!
    $company: String!
    $price: Int!
  ) {
    createProduct(
      input: {
        name: $name
        description: $description
        image: $image
        clerkId: $clerkId
        company: $company
        price: $price
      }
    ) {
      id
      name
      description
      image
      createdAt
      company
      price
    }
  }
`;

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($productId: String!) {
    deleteProduct(productId: $productId) {
      id
      name
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($productId: String!, $name: String, $description: String, $company: String, $price: Int) {
    updateProduct(
      productId: $productId
      input: { name: $name, description: $description, company: $company, price: $price }
    ) {
      id
      name
      description
      image
      company
      price
    }
  }
`;

export const UPDATE_PRODUCT_IMAGE_MUTATION = gql`
  mutation UpdateProductImage($productId: String!, $image: String!) {
    updateProductImage(productId: $productId, image: $image) {
      id
      name
      description
      image
      company
      price
    }
  }
`;
