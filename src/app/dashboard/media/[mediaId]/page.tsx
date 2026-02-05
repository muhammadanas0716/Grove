import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MediaDetailClient from "@/components/media/media-detail-client";

type MediaDetailPageProps = {
  params?: Promise<{ mediaId: string }>;
};

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const resolvedParams = params ? await params : undefined;
  const mediaId = resolvedParams?.mediaId ?? "";

  return (
    <MediaDetailClient
      userId={session.user?.id || ""}
      mediaId={mediaId}
      backHref="/dashboard"
      backLabel="← Back to dashboard"
    />
  );
}
