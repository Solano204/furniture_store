// THIS PAGE WILL BE THE CONTAINER THAT GET ALL PRODUCTS
// import { fetchFeaturedProducts } from '@/app/utils/actions';
import { fetchFeaturedProducts } from '@/app/utils/Api/Actions/Products';
import EmptyList from '../global/EmptyList';
import SectionTitle from '../global/SectionTitle';
import ProductsGrid from '../products/ProductsGrid';
async function FeaturedProducts() {
  const products = await fetchFeaturedProducts();
  if (products.length === 0) return <EmptyList />;
  return (
    <section className='pt-24'>
      <SectionTitle text='featured products' />
      <ProductsGrid products={products} />
    </section>
  );
}

export default FeaturedProducts;

