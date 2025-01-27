

import { gql } from "@apollo/client";

// Create Product Mutation
export const createProductMutation = (
  name: string,
  description: string,
  image: string,
  clerkId: string,
  company: string,
  price: number
) => gql`
  mutation {
    createProduct(input: {
      name: "${name}",
      description: "${description}",
      image: "${image}",
      clerkId: "${clerkId}",
      company: "${company}"
      price: "${price}"
    }) {
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

// Delete Product Mutation
export const deleteProductMutation = (productId: string) => gql`
  mutation {
    deleteProduct(productId: "${productId}") {
      id
      name
    }
  }
`;

// Update Product Mutation
export const updateProductMutation = (
    productId: string,
    name?: string,
    description?: string,
    company?: string,
    price?: Number,
    image?: string

      
) => gql`
  mutation {
    updateProduct(productId: "${productId}", input: {
      ${name ? `name: "${name}",` : ""}
      ${description ? `description: "${description}"` : ""}
      ${company ? `company: "${company}"` : ""}
      ${price ? `price: "${price}"` : ""}
      ${image ? `image: "${image}"` : ""}
    }) {
      id
      name
      description
      image
      company
      price
    }
  }
`;
export const updateProductMutationImage = (
    productId: string,
    image?: string

      
) => gql`
  mutation {
    updateProductImage(productId: "${productId}", image: "${image}") {
      id
      name
      description
      image
      company
      price
    }
  }
`;

// Get Product Reviews Query
export const getProductReviewsQuery = (productId: string) => gql`
  query {
    getProductReviews(productId: "${productId}") {
      id
      productId
      rating
      comment
      clerkId
      createdAt
    }
  }
`;

// Search Products Query
export const searchProductsQuery = (company: string, name: string) => gql`
  query {
    searchProducts(company: "${company}", name: "${name}") {
      id
      name
      description
      image
      price
    }
  }
`;


// Get Featured Products Query
export const getFeaturedProductsQuery = () => gql`
  query {
    getFeaturedProducts {
      id
      name
      company
      description
      image
      featured
      price
      createdAt
      updateAt
    }
  }
`;


// Get Product by ID Query
export const getProductByIdQuery = (productId: string) => gql`
  query {
    getProductById(productId: "${productId}") {
      id
      name
      description
      image
      createdAt
      price
    }
  }
`;

