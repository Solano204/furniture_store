"use client";

import { usePathname } from "next/navigation";
import FormContainer from "../form/FormContainer";
import { logout } from "@/app/utils/Api/Actions/Security";
import { CardSubmitButton } from "../form/Buttons";
import { FaRegHeart } from "react-icons/fa";

type FavoriteToggleFormProps = {
  productId: string;
  favoriteId: string | null;
};

function ButtonLogout() {
  const pathname = usePathname();
  // Here i use the method bind to send the object to action that's linked

  return (
    <FormContainer action={logout}>
      {/*if the favoriteId is in the list then i active the effect filled unlike the empty effect */}
      <button type="submit">Logout</button>
    </FormContainer>
  );
}
export default ButtonLogout;
