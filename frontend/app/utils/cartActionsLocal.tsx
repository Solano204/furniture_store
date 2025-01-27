/*

import db from "@/app/utils/db";
import { redirect } from "next/navigation";
import { Cart } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CartActionsInterface } from "./cartActions";
import { addItemToCart, removeItemFromCart, clearCart, editItemInCart,updateCart} from './features/cartSlice';
import { useDispatch, useSelector } from "react-redux";
import {fetchProduct} from './actions'
interface ProductSummary {
  id: string; // Unique identifier for the product
  name: string; // Name of the product
  company: string; // Company producing the product
  image: string; // URL or path to the product image
  price: number; // Price of the product
  amount: number; // Quantity of the product in the cart
}

interface CartState {
  id: number; // Unique identifier for the cart
  cartItems: ProductSummary[]; // Array of product summaries
  numItemsInCart: number; // Total number of items in the cart
  cartTotal: number; // Total cost of items in the cart
  shipping: number; // Shipping cost
  tax: number; // Tax amount
  taxRate: number; // Tax rate
  orderTotal: number; // Total order cost (cart total + tax + shipping)
  createdAt: string; // Timestamp when the cart was created
  updatedAt: string; // Timestamp when the cart was last updated
}

const dispatch = useDispatch();

class CartActionLocal implements CartActionsInterface {
  // Here im definin' a query that join the tables ( im gettin' a cart that has several cartItems (each cartItems has a product ))
  private includeProductClause = {
    cartItems: {
      include: { product: true },
    },
  };

  // Gettin' the first cart that belong the user (query to table cart)
  public fetchCartItems = async (): Promise<number> => {
    const { userId } = await auth();
    const num = useSelector((state: CartState) => state.numItemsInCart);
    return num;
  };

  // To get the erros
  public renderError = (error: unknown) => {
    return {
      message: error instanceof Error ? error.message : "An error occurred",
    };
  };

  // to get the user
  public getAuthUser = async () => {
    const user = await currentUser();
    if (!user) {
      throw new Error("You must be logged in to access this route");
    }
    return user;
  };

  

  // im gettin' a cart with all its cartItems(that has only one product)
  public fetchOrCreateCart = async ({
    userId,
    errorOnFailure = false,
  }: {
    userId?: string;
    errorOnFailure?: boolean;
  }): Promise<any> => {
    const cart = useSelector((state: CartState) => state);
    if (!cart && errorOnFailure) {
      throw new Error("Cart not found");
    }
    return cart;
  };

  // update the currentAmount (if exist i update it or the new cartItem with that cart and the new quantity)
  public updateOrCreateCartItem = async ({
    productId,
    cartId,
    amount,
  }: {
    productId: string;
    cartId: string;
    amount: number;
  }): Promise<void | { message: string }> => {
    // QUERY TO GET THE PRODUCT !!!!!!
    const product  = await fetchProduct(productId);
    
    dispatch(addItemToCart(product));
    revalidatePath("/cart");
    return { message: "Cart updated" };
  };

  // In this update the cart in general the (quantity,total)
  public updateCart = async (cart: Cart): Promise<Cart> => {
    dispatch(updateCart(cart));
    const currentCar = useSelector((state: CartState) => state);
    if (!cart) {
      throw new Error("Cart not found");
    }
    revalidatePath("/cart");
    return cart;
  };

  // This is method executed when i added a new quantity of product
  public addToCartAction = async (
    prevState: any,
    formData: FormData
  ): Promise<any> => {
    const user = await this.getAuthUser();
    try {
      const productId = formData.get("productId") as string;
      const amount = Number(formData.get("amount"));
      // QUERY TO GET THE PRODUCT !!!!!!
      dispatch(addItemToCart({productId,amount}));
    } catch (error) {
      this.renderError(error);
    }
    redirect("/cart");
  };

  // here i delete the (the product and cartItem from cart)
  public removeCartItemAction = async (
    prevState: any,
    formData: FormData
  ): Promise<{ message: string }> => {
    const user = await this.getAuthUser();

    try {
      dispatch(removeItemFromCart({productId:formData.get("productId") as string}));
      revalidatePath("/cart");
      return { message: "Item removed from cart" };
    } catch (error) {
      return this.renderError(error);
    }
  };

  public updateCartItemAction = async ({
    amount,
    cartItemId,
  }: {
    amount: number;
    cartItemId: string;
  }): Promise<{ message: string }> => {
    const user = await this.getAuthUser();
    try {
      const product  = await fetchProduct(cartItemId);
      dispatch(addItemToCart(product));
      return { message: "Cart updated" };
    } catch (error) {
      return this.renderError(error);
    }
  };
}


export const getActionsCart = async (): Promise<CartActionLocal> => {
    // Perform any async initialization logic if necessary
    const instance = new CartActionLocal();
    return instance;
  };

  */