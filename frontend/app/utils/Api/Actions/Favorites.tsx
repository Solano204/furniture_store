"use server";
import { getClient } from "../Client";
import { fetchOrCreateCart } from "../../cartActionBase";
import { auth, currentUser, getAdminUser } from "../Actions/Security";
import {
  addFavoriteMutation,
  deleteFavoriteMutation,
  getFavoriteQuery,
  getFavoritesQuery,
} from "../Queries/Favorites";
import { revalidatePath } from "next/cache";
import { gql } from "@apollo/client";
import path from "path";
import { Favorite, Product } from "@prisma/client";

// Here I add or remove the product from the list of favorites based on whether it's already in the list.
export const toggleFavoriteAction = async (prevState: {
  productId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const user = await currentUser(); // Get the current user
  const { productId, favoriteId, pathname } = prevState;

  try {
    // If the product is already a favorite, remove it
    if (favoriteId) {
      await getClient().mutate({
        mutation: gql`
          mutation {
            deleteFavorite(favoriteId: "${favoriteId}")
          }
        `,
      });
    } else {
      // If it's not a favorite, add it
      await getClient().mutate({
        mutation: gql`
          mutation {
            addFavorite(input: {
              productId: "${productId}",
              clerkId: "${user.id}"
            }) {
              id
              productId
              clerkId
            }
          }
        `,
      });
    }

    console.log("pathname",pathname)
    // Revalidate the current page to ensure data is fresh
    revalidatePath(pathname);
    // Return the appropriate message based on whether the product was added or removed
    return { message: favoriteId ? "Removed from Faves" : "Added to Faves" };
  } catch (error) {
    console.error("Error in toggleFavoriteAction:", error);
    return { message: "Something went wrong" };
  }
};

// Get the favorite ID for a specific product
export const fetchFavoriteId = async (productId: string ) => {
  const user = await currentUser(); // Get the current user

  try {
    const { data } = await getClient().query({
      query: gql`
        query {
          getFavorite(productId: "${productId}", clerkId: "${user.id}") {
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
      `
    });
    const favorite = data?.getFavorite?.id || null;
    return favorite ;
  } catch (error) {
    console.error("Error fetching favorite ID:", error);
    return null; // Return null in case of error
  }
};


// Product Type
type Favorites = {
  id: string;
  clerkId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  company: string;
  description: string;
  featured: boolean;
  image: string;
  price: number;
  productId: string;
  product: Product;
};


// Fetch User Favorites
export const fetchUserFavorites = async (): Promise<Favorites[]> => {
  const user = await currentUser(); // Get the current user

  try {
    const { data } = await getClient().query({
      query: gql`
        query {
          getFavorites(clerkId: "${user.id}") {
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
      `,
    });


    // Convert createdAt and updatedAt to Date objects
    const favorites = (data?.getFavorites);

    return favorites;
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return []; // Return an empty array in case of error
  }
};

