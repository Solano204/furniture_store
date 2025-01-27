"use client";
import { useEffect, useState } from "react";
import SelectProductAmount from "./SelectProductAmount";
import { Mode } from "./SelectProductAmount";
import FormContainer from "../form/FormContainer";
import { SubmitButton } from "../form/Buttons";
// import { useAuth } from "@clerk/nextjs";
// import { ProductSignInButton } from "../form/Buttons";

import { ProductSignInButtonOwn } from "../form/Buttons";
import { addToCartAction } from "@/app/utils/cartActionBase";

function AddToCart({ productId }: { productId: string }) {
  //Here in the father im passin' the function that modify the state of the hook (amount) to the child "SelectProductAmount", then when the child modify the state will affect the state of the father and which cause that the father and all its children will be re-rendered

  const [amount, setAmount] = useState(1);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  // Fetch user data from the server
  useEffect(() => {
    try {
      const response = fetch("/api/info")
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setUserId(data.user.userId);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setUserId(undefined);
        });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserId(undefined);
    }
}, []);

  return (
    <div className="mt-4">
      {/* Amount selection */}
      <SelectProductAmount
        mode={Mode.SingleProduct}
        amount={amount}
        setAmount={setAmount}
      />

      {/* Render form or sign-in button based on authentication */}
      {userId ? (
        <FormContainer action={addToCartAction}>
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="amount" value={amount} />
          <SubmitButton text="Add to Cart" size="default" className="mt-8" />
        </FormContainer>
      ) : (
        <ProductSignInButtonOwn />
      )}
    </div>
  );
}

export default AddToCart;

// "use client";

// import { useState, useEffect } from "react";
// import SelectProductAmount from "./SelectProductAmount";
// import { Mode } from "./SelectProductAmount";
// import FormContainer from "../form/FormContainer";
// import { SubmitButton } from "../form/Buttons";
// import { ProductSignInButton } from "../form/Buttons";
// import { addToCartAction } from "@/app/utils/cartActionBase";

// function AddToCart({ productId }: { productId: string }) {
//   const [amount, setAmount] = useState(1);
//   const [userId, setUserId] = useState<string | undefined>(undefined);

//   // Fetch user data from the server
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await fetch("/api/auth");
//         if (response.ok) {
//           const data = await response.json();
//           setUserId(data.userId);
//         } else {
//           console.error("Failed to fetch user data");
//           setUserId(undefined);
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//         setUserId(undefined);
//       }
//     };

//     fetchUser();
//   }, []);

//   return (
//     <div className="mt-4">
//       {/* Amount selection */}
//       <SelectProductAmount
//         mode={Mode.SingleProduct}
//         amount={amount}
//         setAmount={setAmount}
//       />

//       {/* Render form or sign-in button based on authentication */}
//       {userId ? (
//         <FormContainer action={addToCartAction}>
//           <input type="hidden" name="productId" value={productId} />
//           <input type="hidden" name="amount" value={amount} />
//           <SubmitButton text="Add to Cart" size="default" className="mt-8" />
//         </FormContainer>
//       ) : (
//         <ProductSignInButton />
//       )}
//     </div>
//   );
// }

// export default AddToCart;
