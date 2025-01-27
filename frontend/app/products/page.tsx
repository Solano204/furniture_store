import ProductsContainer from '@/components/products/ProductsContainer';


// Here the params are optional because i came from the main page and i din' know the id
async function ProductsPage({
  searchParams,
}: {
  searchParams: { layout?: string; search?: string };
    }) {
    
  const layout = searchParams.layout || '';
    const search = searchParams.search || '';
      
  return (
    <>
      <ProductsContainer layout={layout} search={search} />
    </>
  );
}
export default ProductsPage;