"use client";

import { usePathname } from "next/navigation";
import FormContainer from "../form/FormContainer";
// import { toggleFavoriteAction } from "@/app/utils/actions";
import { toggleFavoriteAction } from "@/app/utils/Api/Actions/Favorites";
import { CardSubmitButton } from "../form/Buttons";

type FavoriteToggleFormProps = {
  productId: string;
  favoriteId: string | null; // Here i specify the id favorite is null or not Becuse the user cant get this product like favorite yet
};

function FavoriteToggleForm({
  productId,
  favoriteId,
}: FavoriteToggleFormProps) {
    const pathname = usePathname();
    // Here i use the method bind to send the object to action that's linked
  const toggleAction = toggleFavoriteAction.bind(null, {
    productId,
    favoriteId,
    pathname,
  });
    
  return (
      <FormContainer action={toggleAction}>
          {/*if the favoriteId is in the list then i active the effect filled unlike the empty effect */}
      <CardSubmitButton isFavorite={favoriteId ? true : false} />
    </FormContainer>
  );
}
export default FavoriteToggleForm;
