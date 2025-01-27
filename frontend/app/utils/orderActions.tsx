import { Order } from "@prisma/client";

// IOrderService.ts
export interface IOrderService {
  createOrder(
    prevState: any,
    formData: FormData
  ): Promise<{ message: string } | undefined>;
  fetchUserOrders(): Promise<Order[]>;
  fetchAdminOrders(): Promise<Order[]>;
}
