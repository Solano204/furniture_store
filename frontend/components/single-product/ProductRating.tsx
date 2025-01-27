import { FaStar } from 'react-icons/fa';
// import { fetchProductRating } from "@/app/utils/actions"; // FIRST VERSION
import { fetchProductRating } from "@/app/utils/Api/Actions/Review";


async function ProductRating({ productId }: { productId: string }) {
const { rating, count } = await fetchProductRating(productId);
  const className = `flex gap-1 items-center text-md mt-1 mb-4`;
  const countValue = `(${count}) reviews`;
  return (
    <span className={className}>
      <FaStar className='w-3 h-3' />
      {rating} {countValue}
    </span>
  );
}

export default ProductRating;