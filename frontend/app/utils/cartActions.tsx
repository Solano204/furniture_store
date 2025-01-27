import { Cart } from "@prisma/client";

export interface CartActionsInterface {
    fetchOrCreateCart: (args: {
        userId: string;
        errorOnFailure?: boolean;
    }) => Promise<any>;
    updateOrCreateCartItem: (args: {
        productId: string;
        cartId: string;
        amount: number;
    }) => Promise<any>;
    updateCart: (cart: Cart) => Promise<any>;
    addToCartAction: (
        prevState: any,
        formData: FormData
    ) => Promise<{ message: string } | undefined>;

    removeCartItemAction: (
        prevState: any,
        formData: FormData
    ) => Promise<any>
}