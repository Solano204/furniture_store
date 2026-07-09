
export type actionFunction = (
  prevState: any,
  formData: FormData
) => Promise<{ message: string }>;

export type CartItem = {
  productId: string;
  image: string;
  title: string;
  price: string;
  amount: number;
  company: string;
};

export type CartState = {
  cartItems: CartItem[];
  numItemsInCart: number;
  cartTotal: number;
  shipping: number;
  tax: number;
  orderTotal: number;
};

// The Prisma schema stores `product` as a denormalized Json snapshot on
// CartItem (not a relation - see prisma/schema.prisma), so this is just the
// generated CartItem model type as-is; CartItemsList parses the `product`
// field itself. Aliased on import since this file already declares its own
// unrelated `CartItem` type above.
import { CartItem as PrismaCartItem } from "@prisma/client";
export type CartItemWithProduct = PrismaCartItem;