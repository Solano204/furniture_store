import BreadCrumbs from "@/components/single-product/BreadCrumbs";
import Image from "next/image";
import { formatCurrency } from "@/app/utils/format";
import FavoriteToggleButton from "@/components/products/FavoriteToggleButton";
import ShareButton from "@/components/single-product/ShareButton";
import AddToCart from "@/components/single-product/AddToCart";
import ProductRating from "@/components/single-product/ProductRating";
import SubmitReview from "@/components/reviews/SubmitReview";
import ProductReviews from "@/components/reviews/ProductReviews";
// import { fetchSingleProduct, findExistingReview } from "@/app/utils/actions"; PRISMA POTGREST (VERSION 1 )
import { fetchSingleProduct } from "@/app/utils/Api/Actions/Products";
import {  findExistingReview } from "@/app/utils/Api/Actions/Review";
// import { auth } from "@clerk/nextjs/server";
import { auth } from "@/app/utils/Api/Actions/Security";
async function SingleProductPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const product = await fetchSingleProduct(params.id);
  
  // Here im evaluting 2 options the user is logged or doent have review about this product
  const reviewDoesNotExist = userId && !(await findExistingReview(userId, product.id));

  const { name, image, company, description, price } = product;
  const dollarsAmount = formatCurrency(price);
  return (
    <section>
      <BreadCrumbs name={product.name} />
      <div className="mt-6 grid gap-y-8 lg:grid-cols-2 lg:gap-x-16">
        {/* IMAGE FIRST COL */}
        <div className="relative h-full">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,33vw"
            priority
            className="w-full rounded-md object-cover"
          />
        </div>
        {/* PRODUCT INFO SECOND COL */}
        <div>
          <div className="flex gap-x-8 items-center">
            <h1 className="capitalize text-3xl font-bold">{name}</h1>
            <FavoriteToggleButton productId={params.id} />
            <ShareButton name={product.name} productId={params.id} />
          </div>

          <ProductRating productId={params.id} />
          <h4 className="text-xl mt-2">{company}</h4>
          <p className="mt-3 text-md bg-muted inline-block p-2 rounded-md">
            {dollarsAmount}
          </p>
          <p className="mt-6 leading-8 text-muted-foreground">{description}</p>
          {/* Button to the product to cart */}
          <AddToCart productId={params.id} />
        </div>
      </div>

      {/*Here i show all reviews dont matter if im not logged */}
      <ProductReviews productId={params.id} />
       {/* i show the button that active the form to leave a review */}
      {reviewDoesNotExist && <SubmitReview productId={params.id} />}
    </section>
  );
}

export default SingleProductPage;
