// THIS PAGE ONLY WILL BE AVAILABLE BY THE ADMIN'
import EmptyList from "@/components/global/EmptyList";
//  import { fetchAdminProducts } from "@/app/utils/actions"; // PRISMA
import { fetchAdminProducts } from "@/app/utils/Api/Actions/Products"; 
import Link from "next/link";

import { formatCurrency } from "@/app/utils/format";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import FormContainer from "@/components/form/FormContainer";
import { IconButton } from "@/components/form/Buttons";
// Was importing the Prisma/Postgres version - broken in practice, since the
// productId values on this page come from fetchAdminProducts (GraphQL/Mongo,
// line 4 above) and essentially never match a row in Postgres's disconnected
// Product table, so the delete button silently failed. See Doc 4 SQL notes.
import { deleteProductAction } from "@/app/utils/Api/Actions/Products";


async function ItemsPage() {

  const items = await fetchAdminProducts();
  if (items.length === 0) return <EmptyList />;
    
  return (
    <section>
      <Table>
        <TableCaption className="capitalize">
          total products : {items.length}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const { id: productId, name, company, price } = item;
            return (
              <TableRow key={productId}>
                <TableCell>
                  <Link
                    href={`/products/${productId}`}
                    className="underline text-muted-foreground tracking-wide capitalize"
                  >
                    {name}
                  </Link>
                </TableCell>
                <TableCell>{company}</TableCell>
                <TableCell>{formatCurrency(price)}</TableCell>

                    <TableCell className="flex items-center gap-x-2">
                        {/*BUTTON TO EDIT  */ }
                  <Link href={`/admin/products/edit/${productId}`}>
                    <IconButton actionType="edit"></IconButton> 
                        </Link>
                        {/*BUTTON TO DELETE */ }
                  <DeleteProduct productId={productId} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

// Here in getting a component type form dont matter if the fomr only has a component (is good practice if a component make a action that affect a api or data (mutation) then i need to make a form to separate the action (server) and the component (client))
function DeleteProduct({ productId }: { productId: string }) {
  const deleteProduct = deleteProductAction.bind(null, { productId });
  return (
    <FormContainer action={deleteProduct}>
      <IconButton actionType="delete" />
    </FormContainer>
  );
}

export default ItemsPage;
