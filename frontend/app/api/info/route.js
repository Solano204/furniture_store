// src/pages/api/auth.ts
import { authId } from "@/app/utils/Api/Actions/Security";
import { NextResponse } from "next/server";
import { verifySession} from "@/app/utils/Api/Actions/cookies-session";

export async function GET(req, res) {
  try {
    const user = await authId();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.error();
  }
}
