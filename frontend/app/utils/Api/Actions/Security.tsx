"use server";
import { getClient } from "../Client";
import {
  AUTHENTICATE_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  REGISTER_MUTATION,
} from "../Queries/Security";
import {
  SessionPayload,
  createSession,
  deleteSession,
  getDataFromCookie,
} from "./cookies-session";
import { redirect } from "next/navigation";
import { userSchema, validateSession } from "../../schemas";
import { revalidatePath } from "next/cache";

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

// Rotates the access token using the stored refresh token and persists it,
// keeping the rest of the session payload intact. Writes a cookie, so this
// can only be called from a Server Action or Route Handler, never from a
// Server Component - call it after a GraphQL call comes back with an
// UNAUTHORIZED/INVALID_CREDENTIALS error, then retry the original operation once.
export const refreshAccessToken = async (): Promise<boolean> => {
  const session = await getDataFromCookie();
  if (!session?.refreshToken) {
    return false;
  }

  try {
    const { data } = await getClient().mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { refreshToken: session.refreshToken },
    });

    const newAccessToken: string | null = data?.refreshToken ?? null;
    if (!newAccessToken) {
      return false;
    }

    await createSession({ ...session, jwt: newAccessToken });
    return true;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return false;
  }
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

