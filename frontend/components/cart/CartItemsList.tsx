"use client";
// Container where i show all cart (product an' the whole infomratiion cart)
import { Card } from "@/components/ui/card";
import { FirstColumn, SecondColumn, FourthColumn } from "./CartItemColumns";
import ThirdColumn from "./ThirdColumn";
import { CartItemWithProduct } from "@/app/utils/types";
import { Product } from "@prisma/client";

function CartItemsList({ cartItems }: { cartItems: CartItemWithProduct[] }) {
  return (
    <div>
      {cartItems.map((cartItem) => {
        const { id, amount, product: rawProduct } = cartItem;

        // Parse JSON product into a Product object
        const product: Product = typeof rawProduct === "string"
          ? JSON.parse(rawProduct)
          : rawProduct;

        const { id: productId, image, name, company, price } = product;

        return (
          <Card
            key={id}
            className="flex flex-col gap-y-4 md:flex-row flex-wrap p-6 mb-8 gap-x-4"
          >
            {/*image */}
            <FirstColumn image={image} name={name} />
            {/*name and compamny */}
            <SecondColumn name={name} company={company} productId={productId} />
            {/*amount select and delete button */}
            <ThirdColumn id={id} quantity={amount} />
            {/*price  */}
            <FourthColumn price={price} />
          </Card>
        );
      })}
    </div>
  );
}
export default CartItemsList;
