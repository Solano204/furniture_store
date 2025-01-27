"use server";
// actionsInformationPrismaDb.ts
import db from '@/app/utils/db';
import { redirect } from 'next/navigation';
import { ActionsInformationInterface} from './actionsInformation';
import { productSchema, validateWithZodSchema, imageSchema, reviewSchema } from './schemas';
import { uploadImage, deleteImage } from '@/app/utils/supebase';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { number } from 'zod';
class ActionsInformationPrismaDb  {

      fetchFeaturedProducts = async () => {
        const products = await db.product.findMany({
          where: {
            featured: true,
          },
        });
        return products;
      };
      
       renderError = (error: unknown): { message: string } => {
        return {
          message: error instanceof Error ? error.message : 'An error occurred',
        };
      };
      
      // here i get the user 
       getAuthUser = async () => {
        const user = await currentUser();
        if (!user) {
          throw new Error('You must be logged in to access this route');
        }
        return user;
      };
      
      // I get the admin, if the currents inst admin then i redirect the user to login page 
      getAdminUser = async () => {
        const user = await this.getAuthUser();
        if (user.id !== process.env.ADMIN_USER_ID) redirect('/');
        return user;
      };
      
      // Get all products if only if im user 
        fetchAdminProducts = async () => {
        await this.getAdminUser();
        const products = await db.product.findMany({
          orderBy: {
            createdAt: 'desc',
          },
        });
        return products;
      };
      
      // Here i create the new product
       createProductAction = async (
        prevState: any,
        formData: FormData
      ): Promise<{ message: string }> => {
        const user = await this.getAuthUser();
      
        try {
          const rawData = Object.fromEntries(formData);
          const file = formData.get('image') as File;
          const validatedFields = validateWithZodSchema(productSchema, rawData);
          const validatedFile = validateWithZodSchema(imageSchema, { image: file });
          const fullPath = await uploadImage(validatedFile.image);
      
          await db.product.create({
            data: {
              ...validatedFields,
              image: fullPath, // here im saving the url Complete because when i render the image a image i need this url entire
              clerkId: user.id,
            },
          });
        } catch (error) {
          return this.renderError(error);
        }
        redirect('/admin/products');
      };
      
      fetchSingleProduct = async (productId: string) => {
        const product = await db.product.findUnique({
          where: {
            id: productId,
          },
        });
        if (!product) {
          redirect('/products');
        }
        return product;
      };
      
      fetchAllProducts = async (search: string): Promise<any[]> => {
        return db.product.findMany({
          where: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ],
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      };

      //THE PAGE ADMIN/PRODUCT SO WHAT ONLY THE ADMIN  CAN MAKE THese OPERATIONS
      // Here I delete the product 
      
      deleteProductAction = async (prevState: { productId: string }) => {
        const { productId } = prevState;
        await this.getAdminUser();
        try {
          const product = await db.product.delete({
            where: {
              id: productId,
            },
          });
          await deleteImage(product.image);
          revalidatePath('/admin/products');
          return { message: 'product removed' };
        } catch (error) {
          return this.renderError(error);
        }
      };
      
      
      
      // Get the details of  a product 
       fetchAdminProductDetails = async (productId: string) => {
        await this.getAdminUser();
        const product = await db.product.findUnique({
          where: {
            id: productId,
          },
        });
        if (!product) redirect('/admin/products');
        return product;
      };
      
      
      
      
       updateProductAction = async (
        prevState: any,
        formData: FormData
      ) => {
        await this.getAdminUser();
        try {
          const productId = formData.get('id') as string;
          const rawData = Object.fromEntries(formData);
      
          const validatedFields = validateWithZodSchema(productSchema, rawData);
      
          await db.product.update({
            where: {
              id: productId,
            },
            data: {
              ...validatedFields,
            },
          });
          revalidatePath(`/admin/products/${productId}/edit`);
          return { message: 'Product updated successfully' };
        } catch (error) {
          return this.renderError(error);
        }
      };
      
      
      
      // HERE I UPDATE THE IOMAGES (IN THE 2 METHOD I NEED THE FULL URL )
      updateProductImageAction = async (
        prevState: any,
        formData: FormData
      ) => {
        await this.getAuthUser();
        try {
          const image = formData.get('image') as File;
          const productId = formData.get('id') as string;
          const oldImageUrl = formData.get('url') as string;
      
          const validatedFile = validateWithZodSchema(imageSchema, { image });
          
          // I upload the new image
          const fullPath = await uploadImage(validatedFile.image);
          // I delete the olf image  
          await deleteImage(oldImageUrl);
          await db.product.update({
            where: {
              id: productId,
            },
            data: {
              image: fullPath,
            },
          });
          revalidatePath(`/admin/products/${productId}/edit`);
          return { message: 'Product Image updated successfully' };
        } catch (error) {
          return this.renderError(error);
        }
      };
      
      
      
      
      // Here imma the product to list of favorites or take it off that list if its already its ins that list
       toggleFavoriteAction = async (prevState: {
        productId: string;
        favoriteId: string | null;
        pathname: string;
      }) => {
        const user = await this.getAuthUser();
        const { productId, favoriteId, pathname } = prevState;
        try {
          if (favoriteId) {
            await db.favorite.delete({
              where: {
                id: favoriteId,
              },
            });
          } else {
            await db.favorite.create({
              data: {
                productId,
                clerkId: user.id,
              },
            });
          }
          revalidatePath(pathname); // i update the cache of the currentPage
          return { message: favoriteId ? 'Removed from Faves' : 'Added to Faves' };
        } catch (error) {
          return this.renderError(error);
        }
      };
      
      
      
      // Here i get the id of the product if ist in my favorite
      fetchFavoriteId = async (productId: string): Promise<string | null> => {
        const user = await this.getAuthUser();
        const favorite = await db.favorite.findFirst({
          where: {
            productId,
            clerkId: user.id,
          },
          select: {
            id: true,
          },
        });
        return favorite?.id || null;
      };
      
      
      
      // I get all favorites from the current User
       fetchUserFavorites = async () => {
        const user = await this.getAuthUser();
        const favorites = await db.favorite.findMany({
          where: {
            clerkId: user.id,
          },
          include: {
            product: true,
          },
        });
        return favorites;
      };
      
      
      
      // Here i create a review
       createReviewAction = async (
        prevState: any,
        formData: FormData
      ) => {
        const user = await this.getAuthUser();
        try {
          const rawData = Object.fromEntries(formData);
      
          const validatedFields = validateWithZodSchema(reviewSchema, rawData);
      
          await db.review.create({
            data: {
              ...validatedFields,
              clerkId: user.id,
            },
          });
          // Update the cache of the product/currentId
          revalidatePath(`/products/${validatedFields.productId}`);
          return { message: 'Review submitted successfully' };
        } catch (error) {
          return this.renderError(error);
        }
      };
      
      
      // I get all reviews from' a product
      fetchProductReviews = async (productId: string) => {
        const reviews = await db.review.findMany({
          where: {
            productId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        return reviews;
      };
      
      fetchProductRating = async (productId: string): Promise<{rating: number; count: number }> => {
        const result = await db.review.groupBy({
          by: ['productId'],
          _avg: {
            rating: true,
          },
          _count: {
            rating: true,
          },
          where: {
            productId,
          },
        });
      
        // Check if result is not empty and that the required properties exist
        if (!result || result.length === 0 || !result[0]._count?.rating || !result[0]._avg?.rating) {
          return { rating: 0, count: 0 };
        }
      
        // Ensure that rating is always a number
        const averageRating = result[0]?._avg.rating !== undefined
          ? parseFloat(result[0]._avg.rating.toFixed(1))
          : 0;
      
        return {
          rating: averageRating, // Guaranteed to be a number
          count: result[0]?._count.rating ?? 0,
        };
      };
      
      // Gettin' all revires about the current User 
      fetchProductReviewsByUser = async () => {
        const user = await this.getAuthUser();
        const reviews = await db.review.findMany({
          where: {
            clerkId: user.id,
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            // Join with the table product to get the information (image and name)
            product: {
              select: {
                image: true,
                name: true,
              },
            },
          },
        });
        return reviews;
      };
      
       deleteReviewAction = async (prevState: { reviewId: string }) => {
        const { reviewId } = prevState;
        const user = await this.getAuthUser();
      
        try {
          await db.review.delete({
            where: {
              id: reviewId,
              clerkId: user.id,
            },
          });
      
          revalidatePath('/reviews'); // I update the cache abou' the user
          return { message: 'Review deleted successfully' };
        } catch (error) {
          return this.renderError(error);
        }
      };
      
       findExistingReview = async (userId: string, productId: string) => {
        return db.review.findFirst({
          where: {
            clerkId: userId,
            productId,
          },
        });
      };

      // gettin'product (table product)
   fetchProduct = async (productId: string) => {
    const product = await db.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  };
}

// Async function to create and return an instance
export const getActionsInformationDbPrisma = async (): Promise<ActionsInformationPrismaDb> => {
    // Perform any async initialization logic if necessary
    const instance = new ActionsInformationPrismaDb();
    return instance;
  };