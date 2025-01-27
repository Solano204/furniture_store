// import { fetchProductReviews } from "@/app/utils/actions"; // FIRST VERSION PRISMA
import { fetchProductReviews } from "@/app/utils/Api/Actions/Review"; 

import ReviewCard from "./ReviewCard";
import SectionTitle from "../global/SectionTitle";
async function ProductReviews({ productId }: { productId: string }) {
  const reviews = await fetchProductReviews(productId);
  return (
    <div className="mt-16">
      <SectionTitle text="product reviews" />
      <div className="grid md:grid-cols-2 gap-8 my-8">
        {reviews.map((review) => {
          const { comment, rating,   authorImageUrl , authorName } = review;
          const reviewInfo = {
            comment,
            rating,
            image: authorImageUrl, // image of the user
            name: authorName ,
          };
          return <ReviewCard key={review.id} reviewInfo={reviewInfo} />;
        })}
      </div>
    </div>
  );
}
export default ProductReviews;
