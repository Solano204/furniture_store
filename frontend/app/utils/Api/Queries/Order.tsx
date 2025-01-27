import { gql } from "@apollo/client";

// Create Order Mutation
export const createOrderMutation = (
  clerkId: string,
  products: string[],
  orderTotal: number,
  tax: number,
  shipping: number,
  username: string
) => gql`
  mutation {
    createOrder(input: {
      clerkId: "${clerkId}",
      products: ${JSON.stringify(products)},
      orderTotal: ${orderTotal},
      tax: ${tax},
      shipping: ${shipping},
      username: "${username}"
    }) {
      id
      orderTotal
      tax
      shipping
      username
    }
  }
`;

// Get User Orders Query
export const getUserOrdersQuery = (clerkId: string) => gql`
  query {
    getUserOrders(clerkId: "${clerkId}") {
      id
      clerkId
      products
      orderTotal
      tax
      shipping
      username
      createdAt
    }
  }
`;

// Get All Orders Query
export const getOrdersQuery = () => gql`
  query {
    getOrders {
      id
      clerkId
      products
      orderTotal
      tax
      shipping
      username
      createdAt
    }
  }
`;
