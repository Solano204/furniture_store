"use server";
import { getClient } from "../Client";
import {
  AUTHENTICATE_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  LOGOUT_MUTATION,
  REGISTER_MUTATION,
} from "../Queries/Security";
import {
  SessionPayload,
  createSession,
  deleteSession,
  updateSession,
  verifySession,
  getDataFromCookie,
} from "./cookies-session";
import { redirect } from "next/navigation";
import { userSchema, validateSession } from "../../schemas";
import { revalidatePath } from "next/cache";
import { setAccessToken } from "../Client";
import { tr } from "@faker-js/faker";

export const login = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const userData = { username, password };

    // Validate the user data
    const validatedUser = validateSession(userSchema, userData);

    // Perform mutation
    const client = getClient();
    const { data } = await client.mutate({
      mutation: AUTHENTICATE_MUTATION,
      variables: { username, password },
    });
    const { accessToken, refreshToken, clerkId } = data.authenticate;

    // Set the token globally
    setAccessToken(accessToken);

    // Prepare the session payload
    const dataUser: SessionPayload = {
      userId: clerkId,
      username: username,
      jwt: accessToken,
      refreshToken: refreshToken,
    };
    // Store the session in a cookie
    await createSession(dataUser);

    // Redirect the user
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Failed to login.");
  }
  redirect("/");
};

export const changePassword = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const username = formData.get("username") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmationPassword = formData.get("confirmPassword") as string;

  const { data } = await getClient().mutate({
    mutation: CHANGE_PASSWORD_MUTATION,
    variables: { username, currentPassword, newPassword, confirmationPassword },
  });
  // data.changePassword;
  return { message: "password changed succesfuly" }; // Assuming `data.changePassword` contains the message
};

export const logout = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const s = getClient();
  revalidatePath("/");
  await s.mutate({ mutation: LOGOUT_MUTATION });
  await deleteSession();
  redirect("/");
};

export const register = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const userData = { username, password };

    // Validate the user data
    const validatedUser = validateSession(userSchema, userData);

    // Perform mutation
    const client = getClient();
    const { data } = await client.mutate({
      mutation: REGISTER_MUTATION,
      variables: { username, password },
    });
    const { accessToken, refreshToken, clerkId } = data.register;

    // Set the token globally
    setAccessToken(accessToken);

    // Prepare the session payload
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const dataUser: SessionPayload = {
      userId: clerkId,
      username: username,
      jwt: accessToken,
      refreshToken: refreshToken,
    };
    // Store the session in a cookie
    await createSession(dataUser);

    // Redirect the user
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Failed to login.");
  }
  redirect("/");
};

type User = {
  userId?: string; // Unique identifier for the user
};
type User2 = {
  id: string; // Unique identifier for the user
  username: string;
};

export const auth = async (): Promise<User> => {
  try {
    const cookie = await getDataFromCookie();
    // Simulate authentication logic or replace with actual implementation
    const user: User = { userId: cookie?.userId }; // Replace this with real user fetching logic
    if (user) {
      return user; // Return a valid user object
    } else {
      const user: User = { userId: undefined };
      return user;
    }
  } catch (error) {
    console.error("Error during authentication:", error); // Log the error
    throw new Error("Unauthorized access"); // Return null if there's an error
  }
};

export const getAdminUser = async (): Promise<User2> => {
  const user = await currentUser();
  if (user == null || user.id !== process.env.ADMIN_USER_ID) {
    redirect("/");
  }
  return user;
};

export const currentUser = async (): Promise<User2> => {
  try {
    const cookie = await getDataFromCookie();
    // Simulate authentication logic or replace with actual implementation
    if (cookie) {
      const user: User2 = {
        id: cookie.userId,
        username: cookie.username,
      }; // Replace this with real user fetching logic
      return user; // Return a valid user object
    } else {
      const user: User2 = {
        id: "",
        username: "",
      };
      return user;
    }
  } catch (error) {
    throw new Error("Unauthorized access");
  }
};

// src/app/utils/Api/Actions/Security.ts

export async function authId(): Promise<{ userId: string | undefined }> {
  try {
    const cookie = await getDataFromCookie();
    return { userId: cookie?.userId };
  } catch (error) {
    console.error("Error during authentication:", error);
    return { userId: undefined }; // Return undefined if authentication fails
  }
}

export async function authJwt(): Promise<{ jwt: string | undefined }> {
  try {
    if (!(await getDataFromCookie())) return { jwt: undefined };

    const cookie = await getDataFromCookie();
    return { jwt: cookie?.jwt };
  } catch (error) {
    console.error("Error during authentication:", error);
    return { jwt: undefined }; // Return undefined if authentication fails
  }
}
