"use client";

import { ReloadIcon } from "@radix-ui/react-icons";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { SignInButton } from "@clerk/nextjs";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { LuTrash2, LuPenOff, LuPen } from "react-icons/lu";
import { boolean } from "zod";
import Link from "next/link";

type btnSize = "default" | "lg" | "sm";

type SubmitButtonProps = {
  className?: string;
  text?: string;
  size?: btnSize;
};

export function SubmitButton({
  className = "",
  text = "submit",
  size = "lg",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn("capitalize", className)}
      size={size}
    >
      {/*This button will be turning round because when i check the state is pending then i get this component with the animation-spin that make the componen is turning 'round til the state change and i other time check and i replace this component by other  */}
      {pending ? (
        <>
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          Please wait...
        </>
      ) : (
        text
      )}
    </Button>
  );
}

/// Here im getting some a two button Delete or edit

type actionType = "edit" | "delete";
export const IconButton = ({ actionType }: { actionType: actionType }) => {
  // Here the button will get the status of the form where was inserted
  const { pending } = useFormStatus();

  const renderIcon = () => {
    switch (actionType) {
      case "edit":
        return <LuPen />;
      case "delete":
        return <LuTrash2 />;
      default:
        const never: never = actionType;
        throw new Error(`Invalid action type: ${never}`);
    }
  };

  return (
    <Button
      type="submit"
      size="icon"
      variant="link"
      className="p-2 cursor-pointer"
    >
      {pending ? <ReloadIcon className=" animate-spin" /> : renderIcon()}
    </Button>
  );
};

//
// This button is the fvorite to that will handle the status of  form when i add the product -> favorite and o'll apply effect depde
export const CardSubmitButton = ({ isFavorite }: { isFavorite: boolean }) => {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      variant="outline"
      className=" p-2 cursor-pointer"
    >
      {pending ? (
        <ReloadIcon className=" animate-spin" />
      ) : isFavorite ? (
        <FaHeart />
      ) : (
        <FaRegHeart />
      )}
    </Button>
  );
};

// 

export const CardSignInButtonOwn = () => {
  return (
    <Link href="/auth/login">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="p-2 cursor-pointer flex items-center justify-center"
      >
        <FaRegHeart />
      </Button>
    </Link>
  );
};

// Exportin' a the button of the login
export const ProductSignInButtonOwn = () => {
  return (
    <Link href="/auth/login">
      <Button type="button" size="default" className="mt-8">
        Please Sign In
      </Button>
    </Link>
  );
};

// This button allow me Presss the button to add the product to my favorites
// export const CardSignInButton = () => {
//   return (
//     <SignInButton mode="modal">
//       <Button
//         type="button"
//         size="icon"
//         variant="outline"
//         className="p-2 cursor-pointer"
//         asChild
//       >
//         <FaRegHeart />
//       </Button>
//     </SignInButton>
//   );
// };


// Exportin' a the button of the login when i add the product
// export const ProductSignInButton = () => {
//   return (
//     <SignInButton mode="modal">
//       <Button type="button" size="default" className="mt-8">
//         Please Sign In
//       </Button>
//     </SignInButton>
//   );
// };