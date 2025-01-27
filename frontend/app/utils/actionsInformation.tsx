// actionsInformationInterface.ts
export interface ActionsInformationInterface {
    fetchFeaturedProducts(): Promise<any[]>;
    fetchAdminProducts(): Promise<any[]>;
    fetchSingleProduct(productId: string): Promise<any>;
    fetchAllProducts(search: string): Promise<any[]>;
    createProductAction(prevState: any, formData: FormData): Promise<{ message: string }>;
    deleteProductAction(prevState: { productId: string }): Promise<{ message: string }>;
    fetchAdminProductDetails(productId: string): Promise<any>;
    updateProductAction(prevState: any, formData: FormData): Promise<{ message: string }>;
    updateProductImageAction(prevState: any, formData: FormData): Promise<{ message: string }>;
    toggleFavoriteAction(prevState: {
      productId: string;
      favoriteId: string | null;
      pathname: string;
    }): Promise<{ message: string }>;
    fetchFavoriteId(productId: string): Promise<string | null>;
    fetchUserFavorites(): Promise<any[]>;
    createReviewAction(prevState: any, formData: FormData): Promise<{ message: string }>;
    fetchProductReviews(productId: string): Promise<any[]>;
    fetchProductRating(productId: string): Promise<{ rating: number; count: number }>;
    fetchProductReviewsByUser(): Promise<any[]>;
    deleteReviewAction(prevState: { reviewId: string }): Promise<{ message: string }>;
    findExistingReview(userId: string, productId: string): Promise<any>;
    fetchProduct(productId: string): Promise<any>;
  }
  