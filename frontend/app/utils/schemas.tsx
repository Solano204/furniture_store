// HERE I define all schemas that will compare all my incomin' objects if i fail some validation then I return a object will all errors that i got

import { z, ZodError, ZodSchema } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "name must be at least 2 characters.",
    })
    .max(100, {
      message: "name must be less than 100 characters.",
    }),
  company: z.string(),
  featured: z.coerce.boolean(),
  price: z.coerce.number().int().min(0, {
    message: "price must be a positive number.",
  }),
  // refine is a function asyn that allow me validate the data more complex like functional programmation
  description: z.string().refine(
    (description) => {
      const wordCount = description.length;
      return wordCount >= 10 && wordCount <= 1000;
    },
    {
      message: "description must be between 10 and 1000 words.",
    }
  ),
});



export function validateSession<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    // Validate and return the parsed data
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation Errors:", error.errors);
      throw new Error(
        error.errors.map((e) => e.message).join(", ") // Combine all error messages
      );
    }
    throw error; // Re-throw unknown errors
  }
}

export function validateWithZodSchema<T>(
    schema: ZodSchema<T>,
    data: unknown
): T {
    // Here i validate (comparing my two object my schema and my data) if it was valid i get a true, if it was failured then i get a arrays of errors (all my erros defined)
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((error) => error.message);
    throw new Error(errors.join(", ")); // return the exeptions with the array of all errors that will be catch by the useState of form
  }
  return result.data;
}


export const imageSchema = z.object({
  image: validateImageFile(), // here im define a function that will validate the incomin' data
});

function validateImageFile() {
  const maxUploadSize = 1024 * 1024;
  const acceptedFileTypes = ["image/"];
  return z
    .instanceof(File) // check if is file
    .refine((file) => {
      return !file || file.size <= maxUploadSize;
    }, `File size must be less than 1 MB`)
    .refine((file) => {
      return (
        !file || acceptedFileTypes.some((type) => file.type.startsWith(type))
      );
    }, "File must be an image");
}



// Schema to check the new review
export const reviewSchema = z.object({
  productId: z.string().refine((value) => value !== "", {
    message: "Product ID cannot be empty",
  }),
  authorName: z.string().refine((value) => value !== "", {
    message: "Author name cannot be empty",
  }),
  authorImageUrl: z.string().refine((value) => value !== "", {
    message: "Author image URL cannot be empty",
  }),
  rating: z.coerce
    .number()
    .int()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be at most 5" }),
  comment: z
    .string()
    .min(10, { message: "Comment must be at least 10 characters long" })
    .max(1000, { message: "Comment must be at most 1000 characters long" }),
});

export  const userSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(50, { message: "Username must be less than 50 characters." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(128, { message: "Password must be less than 128 characters." }),
});


