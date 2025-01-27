import { fetchCartItems } from "@/app/utils/cartActionBase";
import { Button } from "../ui/button";
import Link from "next/link";
import { LuShoppingCart } from "react-icons/lu";

async function CartButton() {
   const numItemsInCart = await fetchCartItems();
  return (
    <Button asChild variant={'outline'} size={'icon'} className="flex justify-center items-center relative">
      <Link href={'/cart'}>
        <LuShoppingCart/>
        <span className="absolute -top-3 -right-3 bg-primary text-white w-5 h-5 rounded-full flex justify-center items-center text-xs ">0</span>
      </Link>
    </Button>
  );
}

export default CartButton
