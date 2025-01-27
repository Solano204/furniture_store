import ProductsGrid from "./ProductsGrid";
import ProductsList from "./ProductsList";
import { LuLayoutGrid, LuList } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { fetchAllProducts } from "@/app/utils/actions";
import { fetchAllProducts } from "@/app/utils/Api/Actions/Products";
import Link from "next/link";

// This  is the main conmtainer where i decide if i show the grid or list way the products
async function ProductsContainer({
  layout,
  search,
}: {
  layout: string; // Here I gotta need the layout to show to a way the products (grid by default)
  search: string;
}) {
  // Here i get all products if i iant filter by search what's that say i din' provide the search then i bring all products
  const products = await fetchAllProducts(search );
  const totalProducts = products.length;
  const searchTerm = search ? `&search=${search}` : "";
  console.log("l", layout);
  console.log("s", search);
  return (
    <>
      {/* HEADER */}
      <section>
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-lg">
            {totalProducts} product{totalProducts > 1 && "s"}
          </h4>
          <div className="flex gap-x-4">
            <Button
              // Here im applying the effect of preased
              variant={layout === "grid" ? "default" : "ghost"}
              size="icon"
              asChild
            >
              {/* Here i send the user the same page without the search and now with the layout that i wanna show (because each i navigate to new page next will render all the page again and i have to read all parameters) */}
              <Link href={`/products?layout=grid${searchTerm}`}>
                <LuLayoutGrid />
              </Link>
            </Button>
            <Button
              variant={layout === "list" ? "default" : "ghost"}
              size="icon"
              asChild
            >
              <Link href={`/products?layout=list${searchTerm}`}>
                <LuList />
              </Link>
            </Button>
          </div>
        </div>
        <Separator className="mt-4" />
      </section>
      {/* PRODUCTS */}
      <div>
        {totalProducts === 0 ? (
          <h5 className="text-2xl mt-16">
            Sorry, no products matched your search...
          </h5>
        ) : layout === "grid" ? (
          <ProductsGrid products={products} />
        ) : (
          <ProductsList products={products} />
        )}
      </div>
    </>
  );
}
export default ProductsContainer;
