"use client";
import { useEffect, useState } from "react";
import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import { Card } from "@/components/ui/card";
import RatingInput from "@/components/reviews/RatingInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { Button } from "@/components/ui/button";
// import { createReviewAction } from "@/app/utils/actions"; // PRISMA
import { createReviewAction } from "@/app/utils/Api/Actions/Review";
// import { useUser } from "@clerk/nextjs";
import { auth } from "@/app/utils/Api/Actions/Security";

function SubmitReview({ productId }: { productId: string }) {

  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);
  // const { user } =  useUser();
  
   type User = {
    userId?: string;
    firstName?: string; 
  }
  const [amount, setAmount] = useState(1);
  const [userInformation, setUserInformation] = useState<User | undefined>(undefined);
  
    // Fetch user data from the server
    useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await fetch("/api/info");
          
          if (response.ok) {
            const data: User = await response.json();
            setUserInformation(data);
          } else {
            console.error("Failed to fetch user data");
            setUserInformation(undefined);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserInformation(undefined);
        }
      };
  
      fetchUser();
    }, []);
  
  return (
    <div>

     {/* Button that active the form handlin' the state of the hook*/}
      <Button
        size="lg"
        className="capitalize"
        onClick={() => setIsReviewFormVisible((prev) => !prev)}
      >
        leave review
      </Button>


      
      {isReviewFormVisible && (
        <Card className="p-8 mt-8">
          <FormContainer action={createReviewAction}>
            <input type="hidden" name="productId" value={productId} />
            <input
              type="hidden"
              name="authorName"
              // value={user?.firstName || "anyone"}
              value={userInformation?.firstName || "anyone"}
            />
            <input
              type="hidden"
              name="authorImageUrl"
              // value={user?.imageUrl || "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycmFvTWdhN1ZHOFJkTDgyTHVGdG5mWFdLcjQifQ"}
              value={ "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ycmFvTWdhN1ZHOFJkTDgyTHVGdG5mWFdLcjQifQ"}
            />
            <RatingInput name="rating" />
            <TextAreaInput
              name="comment"
              labelText="feedback"
              defaultValue="Outstanding product!!!"
            />
            <SubmitButton className="mt-4" />
          </FormContainer>
        </Card>
      )}
    </div>
  );
}


export default SubmitReview;