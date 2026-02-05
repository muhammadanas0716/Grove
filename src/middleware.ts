import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

function hasActiveAccess(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/polar") ||
    pathname.startsWith("/invite")
  ) {
    return NextResponse.next();
  }

  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!authSecret) {
    return NextResponse.json(
      { error: "AUTH_SECRET is not set" },
      { status: 500 }
    );
  }

  const token = await getToken({ req, secret: authSecret });
  if (!token?.id) {
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = "/auth/signin";
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.next();
  }

  const convex = new ConvexHttpClient(convexUrl);

  const isProjectPath = pathname.startsWith("/project/");
  const isDashboardProject = pathname.startsWith("/dashboard/project/");
  const isDashboardMedia = pathname.startsWith("/dashboard/media/");

  if (isProjectPath || isDashboardProject || isDashboardMedia) {
    const parts = pathname.split("/").filter(Boolean);
    const projectId = isProjectPath
      ? parts[1]
      : isDashboardProject
      ? parts[2]
      : undefined;
    const mediaId = isDashboardMedia
      ? parts[2]
      : parts[2] === "media"
      ? parts[3]
      : undefined;

    const hasAccess = await convex.query(api.projects.checkAccess, {
      userId: token.id as any,
      projectId: projectId as any,
      mediaId: mediaId as any,
    });

    if (!hasAccess) {
      const subscribeUrl = req.nextUrl.clone();
      subscribeUrl.pathname = "/subscribe";
      subscribeUrl.searchParams.set("reason", "access");
      return NextResponse.redirect(subscribeUrl);
    }

    return NextResponse.next();
  }

  const subscription = await convex.query(api.subscriptions.getUserSubscription, {
    userId: token.id as any,
  });

  if (!hasActiveAccess(subscription?.subscriptionStatus)) {
    const subscribeUrl = req.nextUrl.clone();
    subscribeUrl.pathname = "/subscribe";
    subscribeUrl.searchParams.set("reason", "access");
    return NextResponse.redirect(subscribeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/project/:path*", "/api/:path*"],
};
