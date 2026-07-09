import ProductsContainer from '@/components/products/ProductsContainer';


// Here the params are optional because i came from the main page and i din' know the id
async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ layout?: string; search?: string }>;
    }) {

  const resolvedSearchParams = await searchParams;
  const layout = resolvedSearchParams.layout || '';
    const search = resolvedSearchParams.search || '';
      
  return (
    <>
      <ProductsContainer layout={layout} search={search} />
    </>
  );
}
export default ProductsPage;