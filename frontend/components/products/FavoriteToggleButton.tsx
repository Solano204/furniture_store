// import { auth } from "@clerk/nextjs/server";
// import { CardSignInButton  } from "../form/Buttons";
import {auth} from "@/app/utils/Api/Actions/Security";
 import { CardSignInButtonOwn  } from "../form/Buttons";
// import { fetchFavoriteId } from "@/app/utils/actions"; PRISMA VERSION 1 POTGREST
import { fetchFavoriteId } from "@/app/utils/Api/Actions/Favorites";
import FavoriteToggleForm from "./FavoriteToggleForm";
import { string } from "zod";

// This component if i ian't logged the will show the button favorite that when i press then will me redirect to the loggin page
// if i've logged then i get the normal button to add the product to my favorite  
async function FavoriteToggleButton({ productId }: { productId: string }) {
  const { userId } = await auth();
  // if (!userId) return <CardSignInButton />; // button favorite with login
  if (!userId) return <CardSignInButtonOwn />; // button favorite with login
  // i get the button if its favorite 
  const favoriteId = await fetchFavoriteId(productId);


  /// I get the normal button 
  return <FavoriteToggleForm favoriteId={favoriteId} productId={productId} />;
}
export default FavoriteToggleButton;
