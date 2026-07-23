import { getDataFromCookie } from "@/app/utils/Api/Actions/cookies-session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getDataFromCookie();
    return NextResponse.json({ user: { userId: session?.userId } });
  } catch (error) {
    return NextResponse.error();
  }
}
