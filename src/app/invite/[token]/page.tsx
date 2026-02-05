import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

export const runtime = "nodejs";

type InvitePageProps = {
  params?: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const resolvedParams = params ? await params : undefined;
  const token = resolvedParams?.token ?? "";

  const session = await auth();
  if (!session) {
    redirect(`/auth/signin?next=/invite/${token}`);
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    redirect("/");
  }

  if (!token) {
    redirect("/");
  }

  const convex = new ConvexHttpClient(convexUrl);
  const projectId = await convex.mutation(api.projects.acceptInvite, {
    userId: session.user?.id as any,
    token,
  });

  redirect(`/project/${projectId}`);
}
