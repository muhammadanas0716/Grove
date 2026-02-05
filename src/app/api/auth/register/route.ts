import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import bcrypt from "bcryptjs";
import { api } from "convex/_generated/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_CONVEX_URL is not set" },
        { status: 500 },
      );
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const convex = new ConvexHttpClient(convexUrl);

    const userId = await convex.mutation(api.auth.createUser, {
      name,
      email,
      password: hashedPassword,
      emailVerified: null,
      image: null,
    });

    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 400 }
    );
  }
}
