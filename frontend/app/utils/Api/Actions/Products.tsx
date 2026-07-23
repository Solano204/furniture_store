"use server";

import { revalidatePath } from "next/cache";
import {
  productSchema,
  validateWithZodSchema,
  imageSchema,
  reviewSchema,
} from "../../schemas";
import { uploadImage, deleteImage } from "@/app/utils/supebase";
import { getClient } from "../Client";
import db from "@/app/utils/db";
import { getAdminUser } from "./Security";

import {
  CREATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  GET_FEATURED_PRODUCTS_QUERY,
  GET_PRODUCT_BY_ID_QUERY,
  SEARCH_PRODUCTS_QUERY,
  UPDATE_PRODUCT_IMAGE_MUTATION,
} from "../Queries/Products";
import { redirect } from "next/navigation";

export interface Review {
  id: string;
  clerkId: string;
  rating: number;
  comment: string;
  authorName: string;
  authorImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
}

const renderError = (error: unknown): { message: string } => ({
  message: error instanceof Error ? error.message : "An error occurred",
});

// There's no exact-match-by-name query on the backend, only fuzzy
// SEARCH_PRODUCTS_QUERY (partial match, used for the storefront search box) -
// reused here since adding a new backend query is out of this frontend's
// scope, but matched exactly (case-insensitive) client-side so a search for
// "Chair" doesn't false-positive against "Office Chair".
async function findProductByExactName(name: string, excludeProductId?: string) {
  const { data } = await getClient().query({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { company: name, name },
    fetchPolicy: "network-only",
  });
  const matches = (data?.searchProducts ?? []) as { id: string; name: string }[];
  return matches.find(
    (p) => p.id !== excludeProductId && p.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
}

export const fetchFeaturedProducts = async () => {
  try {
    const { data } = await getClient().query({
      query: GET_FEATURED_PRODUCTS_QUERY,
    });
    return data.getFeaturedProducts;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw new Error("Failed to fetch featured products");
  }
};


type Product = {
  id: string;
  name: string;
  company: string;
  description: string;
  featured: boolean;
  image: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  clerkId: string;
};

export const fetchAdminProducts = async (): Promise<Product[]> => {
  await getAdminUser(); // Ensure this function is properly implemented
  try {
    const { data } = await getClient().query({
      query: GET_FEATURED_PRODUCTS_QUERY,
    });

    return data.getFeaturedProducts as Product[];
  } catch (error) {
    console.error('Error fetching admin products:', error);
    throw new Error('Failed to fetch admin products');
  }
};

export const createProductAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAdminUser();

  try {
    const rawData = Object.fromEntries(formData);
    const file = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(productSchema, rawData);
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });

    const duplicate = await findProductByExactName(validatedFields.name);
    if (duplicate) {
      return { message: `A product named "${validatedFields.name}" already exists` };
    }

    const fullPath = await uploadImage(validatedFile.image);

    try {
      const { data } = await getClient().mutate({
        mutation: CREATE_PRODUCT_MUTATION,
        variables: {
          name: validatedFields.name,
          description: validatedFields.description,
          image: fullPath,
          clerkId: user.id,
          company: validatedFields.company,
          price: validatedFields.price,
        },
      });

      revalidatePath("/admin/products");
      return { message: "Product created successfully" };
    } catch (error) {
      return renderError(error);
    }
  } catch (error) {
    return renderError(error);
  }
};

export const fetchSingleProduct = async (productId: string) => {
  const { data } = await getClient().query({
    query: GET_PRODUCT_BY_ID_QUERY,
    variables: { productId },
  });
  const product = data.getProductById;
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

export const fetchProduct = async (productId: string) => {
 return await fetchSingleProduct(productId) as Product;
};

export const fetchAdminProductDetails = async (productId: string) => {
  await getAdminUser();
  const product = await fetchSingleProduct(productId);
  if (!product) redirect('/admin/products');
  return product;
};

export const fetchAllProducts = async (search: string): Promise<any[]> => {
  const { data } = await getClient().query({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { company: search, name: search },
  });
  return data.searchProducts; // Return the actual product data
};

export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  await getAdminUser();
  try {
    const { data } = await getClient().query({
      query: GET_PRODUCT_BY_ID_QUERY,
      variables: { productId },
    });
    const product = data.getProductById;

    try {
      await getClient().mutate({
        mutation: DELETE_PRODUCT_MUTATION,
        variables: { productId },
      });
    } catch (error) {
      return renderError(error);
    }

    await deleteImage(product.image);
    revalidatePath("/admin/products");
    return { message: "Product removed successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateProductAction = async (
  prevState: any,
  formData: FormData
) => {
  await getAdminUser();
  try {
    const productId = formData.get("id") as string;
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(productSchema, rawData);

    const duplicate = await findProductByExactName(validatedFields.name, productId);
    if (duplicate) {
      return { message: `A product named "${validatedFields.name}" already exists` };
    }

    try {
      await getClient().mutate({
        mutation: UPDATE_PRODUCT_MUTATION,
        variables: {
          productId,
          name: validatedFields.name,
          description: validatedFields.description,
          company: validatedFields.company,
          price: validatedFields.price,
        },
      });
      revalidatePath(`/admin/products/${productId}/edit`);
      return { message: "Product updated successfully" };
    } catch (error) {
      return renderError(error);
    }
  } catch (error) {
    return renderError(error);
  }
};

export const updateProductImageAction = async (
  prevState: any,
  formData: FormData
) => {
  await getAdminUser();
  try {
    const image = formData.get("image") as File;
    const productId = formData.get("id") as string;
    const oldImageUrl = formData.get("url") as string;

    const validatedFile = validateWithZodSchema(imageSchema, { image });

    const fullPath = await uploadImage(validatedFile.image);
    await deleteImage(oldImageUrl);

    await getClient().mutate({
      mutation: UPDATE_PRODUCT_IMAGE_MUTATION,
      variables: { productId, image: fullPath },
    });

    revalidatePath(`/admin/products/${productId}/edit`);
    return { message: "Product image updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};
