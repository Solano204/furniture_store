"use server";
import { getClient } from "../Client";
import { currentUser } from "./Security";
import {
  ADD_FAVORITE_MUTATION,
  DELETE_FAVORITE_MUTATION,
  GET_FAVORITE_QUERY,
  GET_FAVORITES_QUERY,
} from "../Queries/Favorites";
import { revalidatePath } from "next/cache";
import { Product } from "@prisma/client";

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
        mutation: DELETE_FAVORITE_MUTATION,
        variables: { favoriteId },
      });
    } else {
      // If it's not a favorite, add it
      await getClient().mutate({
        mutation: ADD_FAVORITE_MUTATION,
        variables: { productId, clerkId: user.id },
      });
    }

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
      query: GET_FAVORITE_QUERY,
      variables: { productId, clerkId: user.id },
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
      query: GET_FAVORITES_QUERY,
      variables: { clerkId: user.id },
    });

    // Convert createdAt and updatedAt to Date objects
    const favorites = (data?.getFavorites);

    return favorites;
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return []; // Return an empty array in case of error
  }
};
