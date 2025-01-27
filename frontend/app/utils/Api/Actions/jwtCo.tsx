"use server";
import { authJwt } from "@/app/utils/Api/Actions/Security";

export async function jwtCo(): Promise<{ jwt: string | undefined }> {
    try {
        const cookie = await authJwt();
        const jwt: string | undefined = cookie.jwt; // Correctly extract `jwt`
        return { jwt }; // Return `jwt` with correct key
    } catch (error) {
        console.error("Error during authentication:", error);
        return { jwt: undefined }; // Return undefined if authentication fails
    }
}

export async function getAuthorizationHeader(): Promise<String> {
    try {
        const { jwt } = await jwtCo();
        return `Authorization: Bearer ${jwt || ""}`; // Construct the Authorization header
    } catch (error) {
        console.error("Error while getting the Authorization header:", error);
        return "Authorization: Bearer "; // Return an empty Bearer token in case of failure
    }
  }