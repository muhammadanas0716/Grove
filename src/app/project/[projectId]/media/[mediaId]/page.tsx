import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MediaDetailClient from "@/components/media/media-detail-client";

type MediaDetailPageProps = {
  params?: Promise<{ projectId: string; mediaId: string }>;
};

export default async function ProjectMediaPage({ params }: MediaDetailPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const resolvedParams = params ? await params : undefined;
  const projectId = resolvedParams?.projectId ?? "";
  const mediaId = resolvedParams?.mediaId ?? "";

  return (
    <MediaDetailClient
      userId={session.user?.id || ""}
      mediaId={mediaId}
      backHref={`/project/${projectId}`}
      backLabel="← Back to project"
    />
  );
}
