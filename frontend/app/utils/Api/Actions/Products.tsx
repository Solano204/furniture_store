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
import { auth, currentUser, getAdminUser } from "../Actions/Security";

import {
  createProductMutation,
  deleteProductMutation,
  updateProductMutation,
  getFeaturedProductsQuery,
  getProductByIdQuery,
  getProductReviewsQuery,
  searchProductsQuery,
  updateProductMutationImage,
} from "../Queries/Products";
import { gql } from "@apollo/client";
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

export const fetchFeaturedProducts = async () => {
  try {
    const { data } = await getClient().query({
      query: gql`
        query {
          getFeaturedProducts {
            id
            name
            description
            image
            featured
            createdAt
            price
          }
        }
      `,
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
    const getFeaturedProductsQuery = gql`
      query {
        getFeaturedProducts {
          id
          name
          company
          description
          image
          featured
          price
          createdAt

        }
      }
    `;

    const { data } = await getClient().query({
      query: getFeaturedProductsQuery,
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
  const user = await currentUser();

  try {
    const rawData = Object.fromEntries(formData);
    const file = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(productSchema, rawData);
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);

    const CREATE_PRODUCT_MUTATION = gql`
    mutation {
      createProduct(input: {
        name: "${validatedFields.name}",
        description: "${validatedFields.description}",
        image: "${fullPath}",
        clerkId: "${user.id}",
        company: "${validatedFields.company}",
        price: ${validatedFields.price}
      }) {
        id
        name
        description
        image
        createdAt
        company
        price 
      }
    }
  `;

    try {
      const { data } = await getClient().mutate({
        mutation: CREATE_PRODUCT_MUTATION,
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
  const query = gql`
  query {
    getProductById(productId: "${productId}") {
      id
      name
      description
      image
      company
      createdAt
      price
    }
  }
`;

  const { data } = await getClient().query({
    query,
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
    query: gql`
    query {
      searchProducts(company: "${search}", name: "${search}") {
        id
        name
        description
        image
        price
      }
    }
  `,
  });
  return data.searchProducts; // Return the actual product data
};

export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  await getAdminUser();
  try {
    const { data } = await getClient().query({
      query: getProductByIdQuery(productId),
    });
    const product = data.product;

    const DELETE_PRODUCT_MUTATION = gql`
    mutation {
      deleteProduct(productId: "${productId}") {
        id
        name
      }
    }
  `;

    try {
      const { data } = await getClient().mutate({
        mutation: DELETE_PRODUCT_MUTATION,
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

    const UPDATE_PRODUCT_MUTATION = gql`
    mutation {
      updateProduct(productId: "${productId}", input: {
        name: "${validatedFields.name}",
        description: "${validatedFields.description}",
        company: "${validatedFields.company}",
        price: ${validatedFields.price}
      }) {
        id
        name
        description
        image
        company
        price
      }
    }
  `;

    try {
      const { data } = await getClient().mutate({
        mutation: UPDATE_PRODUCT_MUTATION,
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
  const user = await currentUser();
  try {
    const image = formData.get("image") as File;
    const productId = formData.get("id") as string;
    const oldImageUrl = formData.get("url") as string;

    const validatedFile = validateWithZodSchema(imageSchema, { image });

    // Define the GraphQL mutation outside the function call
  

    const fullPath = await uploadImage(validatedFile.image);
    await deleteImage(oldImageUrl);

    const UPDATE_PRODUCT_IMAGE_MUTATION = gql`
    mutation {
      updateProductImage(productId: "${productId}", image: "${fullPath}") {
        id
        name
        description
        image
        company
        price
      }
    }
  `;

    const { data } = await getClient().mutate({
      mutation: UPDATE_PRODUCT_IMAGE_MUTATION,
    });

    revalidatePath(`/admin/products/${productId}/edit`);
    return { message: "Product image updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchProductRating = async (
  productId: string
): Promise<{ rating: number; count: number }> => {
  const GET_PRODUCT_REVIEWS_QUERY = gql`
    query {
      getProductReviews(productId: "${productId}") {
        id
        productId
        rating
        comment
        clerkId
        createdAt
      }
    }
  `;

  try {
    const { data } = await getClient().query({
      query: GET_PRODUCT_REVIEWS_QUERY,
    });
    return data.getProductReviews;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    throw new Error("Failed to fetch product reviews");
  }
};
