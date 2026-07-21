"use server";
export type SessionPayload = {
  userId: string;
  username: string;
  refreshToken: string;
  jwt: string;
};

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const secretKey = process.env.SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(key);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // encrypt the cookie
  const session = await encrypt(payload);

 // set the cookie
  (await cookies()).set("sessionita", session, {
    httpOnly: true, // Inmutable to browser
    secure: true, // Only https and localHost
    expires: expiresAt, // Expire Time
    sameSite: "lax", // Prevent send the cookie from other sites 
    path: "/", // Avaialiable for all site 
  });
  revalidatePath("/");
}

// Update the time for the session
// Not currently called anywhere (e.g. from middleware) - session cookies are
// issued with a fixed 1h expiry (see createSession) and never slid forward.
export async function updateSession() {
  const session = (await cookies()).get("sessionita")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  (await cookies()).set("sessionita", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

// Delete the cookie form thue browser
export async function deleteSession() {
  (await cookies()).delete("sessionita");
  redirect("/");
}
export async function getDataFromCookie(): Promise<SessionPayload | undefined> {
  // Retrieve the session cookie
  const cookie = (await cookies()).get("sessionita")?.value;
  if (!cookie) {
    return undefined; // No cookie found
  }

  // Decrypt the cookie to extract the session payload
  const session = await decrypt(cookie);

  // Validate the session payload structure
  if (session) {
      // Ensure `expiresAt` is a valid Date object
    return {
      ...session,
    } as SessionPayload;
  }

  // Return null if the session is invalid or doesn't match the structure
  return undefined;
}
