import { gql } from "@apollo/client";

export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder(
    $clerkId: String!
    $products: Int
    $orderTotal: Float!
    $tax: Float!
    $shipping: Float!
    $username: String!
  ) {
    createOrder(
      input: {
        clerkId: $clerkId
        products: $products
        orderTotal: $orderTotal
        tax: $tax
        shipping: $shipping
        username: $username
      }
    ) {
      id
      products
      orderTotal
      tax
      shipping
      username
    }
  }
`;

export const GET_USER_ORDERS_QUERY = gql`
  query GetUserOrders($clerkId: String!) {
    getUserOrders(clerkId: $clerkId) {
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

export const GET_ORDERS_QUERY = gql`
  query GetOrders {
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
