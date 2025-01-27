'use client';

import { useActionState } from "react";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { actionFunction } from "@/app/utils/types";
import { useRouter } from "next/navigation";
const initialState = {
  message: "",
};

function FormContainer({
  action,
  children,
}: {
  action: actionFunction;
  children: React.ReactNode;
    }) {
      const [state, formAction] = useActionState(action, initialState);
      const { toast } = useToast();
      const router = useRouter(); // Initialize useRouter
      // Will be execute when i change the value the message
      useEffect(() => {
        console.log(state); // Log state to debug
        if (state?.message) {
          toast({ description: state.message });
        }
      }, [state]);

      {
        /*Here im recivin' all children like (inputs, number,images,ect) here im includin' them to they can get context about the form, i can have elemnts linked dont matter is back of form the most important is that i include them all inside of the form */
      }
      return <form action={formAction}>{children}</form>;
    }
export default FormContainer;
