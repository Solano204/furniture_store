import CartItemsList from "@/components/cart/CartItemsList";
import CartTotals from "@/components/cart/CartTotals";
import SectionTitle from "@/components/global/SectionTitle";
import { fetchOrCreateCart,updateCart } from "@/app/utils/cartActionBase";
// import { auth } from "@clerk/nextjs/server";
import { auth } from "@/app/utils/Api/Actions/Security";

import { redirect } from "next/navigation";
async function CartPage() {

  const { userId } = await auth();
  if (!userId) redirect("/"); // HERE I PROVIDE THE USER ENTER IN THE CART BECAUSE ISNT LOGGED 
  
  // update the cart to keep the same state in different state
  const cart = await fetchOrCreateCart({ userId });
  await updateCart(cart);

  if (cart.numItemsInCart === 0) {
    return <SectionTitle text="Empty cart" />;
  }
  
  return (
    <>
      <SectionTitle text="Shopping Cart" />
      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <CartItemsList cartItems={cart.cartItems} />
        </div>
        <div className="lg:col-span-4 lg:pl-4">
          <CartTotals cart={cart} />
        </div>
      </div>
    </>
  );
}
export default CartPage;
