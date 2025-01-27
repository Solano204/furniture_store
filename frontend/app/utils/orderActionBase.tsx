// OrderService.ts
"use server";
import { IOrderService } from "./orderActions";
import { fetchOrCreateCart } from "./cartActionBase";
import { Order } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import db from "@/app/utils/db";
class OrderService {
  getAuthUser = async (): Promise<any> => {
    const user = await currentUser();
    if (!user) {
      throw new Error("You must be logged in to access this route");
    }
    console.log(user);
    return user;
  };

  getAdminUser = async (): Promise<any> => {
    const user = await this.getAuthUser();
    if (user.id !== process.env.ADMIN_USER_ID) {
      throw new Error("Unauthorized access");
    }
    return user;
  };

  createOrder = async (
    prevState: any,
    formData: FormData
  ): Promise<any | undefined> => {


    console.log("jkjjjj")
    const user = await this.getAuthUser();
    try {
      const cart = await fetchOrCreateCart({
        userId: user.id,
        errorOnFailure: true,
      });
      const order = await db.order.create({
        data: {
          clerkId: user.id,
          products: cart.numItemsInCart,
          orderTotal: cart.orderTotal,
          tax: cart.tax,
          shipping: cart.shipping,
          email: user.emailAddresses[0].emailAddress,
        },
      });

      await db.cart.delete({
        where: {
          id: cart.id,
        },
      });
      
    } catch (error) {
      return this.renderError(error);
    }
    redirect("/orders");
  };
  public renderError = (error: unknown) => {
    console.error(error);
    return {
      message: error instanceof Error ? error.message : "An error occurred",
    };
  };

  fetchUserOrders = async (): Promise<Order[]> => {
    const user = await this.getAuthUser();
    const orders = await db.order.findMany({
      where: {
        clerkId: user.id,
        isPaid: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders;
  };

  fetchAdminOrders = async (): Promise<Order[]> => {
    const user = await this.getAdminUser();
    const orders = await db.order.findMany({
      where: {
        isPaid: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders;
  };
}

const orderService = new OrderService();
export const createOrder = orderService.createOrder;
export const fetchUserOrders = orderService.fetchUserOrders;
export const fetchAdminOrders = orderService.fetchAdminOrders;
