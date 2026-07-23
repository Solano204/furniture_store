"use server";
import db from "@/app/utils/db";
import { redirect } from "next/navigation";
import { Cart } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@/app/utils/Api/Actions/Security";
import { CartActionsInterface } from "./cartActions";
import { fetchProduct } from "./Api/Actions/Products";

class CartActionBase implements CartActionsInterface {
  // Here im definin' a query that join the tables ( im gettin' a cart that has several cartItems (each cartItems has a product ))
  private includeProductClause = {
    cartItems: {
      include: { product: true },
    },
  };

  // Gettin' the first cart that belong the user (query to table cart)
  public fetchCartItems = async (): Promise<number> => {
    const { userId } = await auth();

    const cart = await db.cart.findFirst({
      where: {
        clerkId: userId ?? "",
      },
      select: {
        // field to selects
        numItemsInCart: true,
      },
    });

    return cart?.numItemsInCart || 0;
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

  /// HERE IM GETTIN ' THE CART IN GENERAL WITH ITS ItemsCart(only has one product) if the cart isnt empty
  public fetchOrCreateCart = async ({
    userId,
    errorOnFailure = false,
  }: {
    userId: string;
    errorOnFailure?: boolean;
  }): Promise<any> => {

    let cart = await db.cart.findFirst({
      where: { clerkId: userId },
      include: { cartItems: true }, // Fetch cart items only
    });

    if (!cart && errorOnFailure) {
      throw new Error("Cart not found");
    }

    if (!cart) {
      cart = await db.cart.create({
        data: { clerkId: userId },
        include: { cartItems: true }, // Fetch cart items only
      });
    }

    // Fetch or enrich cart items with product data
    if (cart.cartItems.length > 0) {
      const productIds = cart.cartItems.map((item) => item.productId); // Get the product IDs

      // Fetch all products asynchronously and wait for resolution Products[]
      const products = await Promise.all(
        productIds.map((id) => fetchProduct(id))
      );

      if(products === undefined){ 
        throw new Error("Failed to fetch products");
      }

      // Map the cart items to include the enriched product data
      cart.cartItems = cart.cartItems.map((item) => ({
        ...item,
        product: products.find((p) => p.id === item.productId) || {},
      }));
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
  }): Promise<void> => {
    /// get the product that belong to one cartItem
    const cartItem = await db.cartItem.findFirst({
      where: { productId, cartId },
    });
    if (cartItem) {
      await db.cartItem.update({
        where: { id: cartItem.id },
        data: { amount: cartItem.amount + amount }, // updarting the fields
      });
    } else {
      try {
        const product = await fetchProduct(productId);
        await db.cartItem.create({
          data: { productId, product: product, cartId, amount },
        });
        console.log("CartItem created successfully!");
      } catch (error) {
        console.error("Error creating CartItem:", error);
      }
    }
  };



  public updateCart = async (cart: Cart): Promise<Cart> => {
    // Fetch all cart items for the cart
    const cartItems = await db.cartItem.findMany({
      where: { cartId: cart.id },
    });
  
    if (cartItems.length === 0) {
      // If no cart items, update the cart with zero values
      return await db.cart.update({
        where: { id: cart.id },
        data: { numItemsInCart: 0, cartTotal: 0, tax: 0, orderTotal: 0 },
      });
    }
  
    // Fetch product data for the cart items
    const productIds = cartItems.map((item) => item.productId); // Get the product IDs

      // Fetch all products asynchronously and wait for resolution Products[]
      const products = await Promise.all(
        productIds.map((id) => fetchProduct(id))
      );
  
    // Calculate totals
    let numItemsInCart = 0;
    let cartTotal = 0;
  
    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        numItemsInCart += item.amount;
        cartTotal += item.amount * product.price;
      }
    }
  
    const tax = cart.taxRate * cartTotal;
    const shipping = cartTotal ? cart.shipping : 0;
    const orderTotal = cartTotal + tax + shipping;
  
    return await db.cart.update({
      where: { id: cart.id },
      data: { numItemsInCart, cartTotal, tax, orderTotal },
    });
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
        await fetchProduct(productId); // get the product
      const cart = await this.fetchOrCreateCart({ userId: user.id }); // get the cart in general
      await this.updateOrCreateCartItem({ productId, cartId: cart.id, amount }); // modify the cartItem that is linked that product
      await this.updateCart(cart); // Modify the cart general (total,quantity)
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
      const cartItemId = formData.get("id") as string;

      // Get the car
      const cart = await this.fetchOrCreateCart({
        userId: user.id,
        errorOnFailure: true,
      });

      // delete the cartItem and its product(because im using cascade )
      await db.cartItem.delete({
        where: { id: cartItemId, cartId: cart.id },
      });

      // i UPDATE THE CAR IN GENERAL
      await this.updateCart(cart);
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
      const cart = await this.fetchOrCreateCart({
        userId: user.id,
        errorOnFailure: true,
      });

      await db.cartItem.update({
        where: { id: cartItemId, cartId: cart.id },
        data: { amount },
      });

      await this.updateCart(cart);
      revalidatePath("/cart");

      return { message: "Cart updated" };
    } catch (error) {
      return this.renderError(error);
    }
  };
}

export const getActionsCart = async (): Promise<CartActionBase> => {
  // Perform any async initialization logic if necessary
  const instance = new CartActionBase();
  return instance;
};
