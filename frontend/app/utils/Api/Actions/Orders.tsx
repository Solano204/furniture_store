"use server";
import { getClient } from "../Client";
import { fetchOrCreateCart } from "../../cartActionBase";
import db from "@/app/utils/db";
import { redirect } from "next/navigation";
import { auth, currentUser, getAdminUser } from "../Actions/Security";
import {
  createOrderMutation,
  getOrdersQuery,
  getUserOrdersQuery,
} from "../Queries/Order";
import { gql } from "@apollo/client";

// Function to create an order
export const createOrder = async (
  prevState: any,
  formData: FormData
): Promise<any | undefined> => {
  const user = await currentUser();

  try {
    const cart = await fetchOrCreateCart({
      userId: user.id,
      errorOnFailure: true,
    });

    const { data } = await getClient().mutate({
      mutation: gql`
        mutation {
          createOrder(input: {
            clerkId: "${user.id}",
            products: ${cart.numItemsInCart},
            orderTotal: ${cart.orderTotal},
            tax: ${cart.tax},
            shipping: ${cart.shipping},
            username: "${user.username}"
          }) {
            id
            products
            orderTotal
            tax
            shipping
            username
          }
        }
      `,
    });

    // Delete cart after the order is created
    await db.cart.delete({
      where: {
        id: cart.id,
      },
    });

  } catch (error) {
    return renderError(error); // Call the renderError method to handle errors
  }
  redirect("/orders"); 
};

// Helper function to render errors
export const renderError = async (error: unknown) => {
  console.error(error);
  return {
    message: error instanceof Error ? error.message : "An error occurred",
  };
};

// Define the Order type
export type Order = {
  id: string;
  clerkId: string;
  products: number;
  orderTotal: number;
  tax: number;
  shipping: number;
  username: string;
  createdAt: string; // Since DateTime in Prisma maps to a string in JavaScript (ISO 8601 format)
};

// Fetch orders for the current user
export const fetchUserOrders = async (): Promise<Order[]> => {
  const user = await currentUser();

  // Fetch user orders query
  const { data } = await getClient().query({
    query: gql`
      query {
        getUserOrders(clerkId: "${user.id}") {
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
    `,
  });

  return data.getUserOrders; // Assuming 'orders' is the correct field in the response
};


// Fetch all orders for the admin user
export const fetchAdminOrders = async (): Promise<Order[]> => {
  const user = await getAdminUser();

   // Fetch all orders query
   const { data } = await getClient().query({
    query: gql`
      query {
        getOrders {
          id
          username
           createdAt
          clerkId
          products
          orderTotal
          tax
          shipping
        }
      }
    `,
  });

  console.log("data Orders", data.getOrders);
  return data.getOrders; // Assuming 'orders' is the correct field in the response
};
