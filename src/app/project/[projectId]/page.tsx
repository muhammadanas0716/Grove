import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProjectDetailClient from "./project-detail-client";

type ProjectDetailPageProps = {
  params?: Promise<{ projectId: string }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const resolvedParams = params ? await params : undefined;
  const projectId = resolvedParams?.projectId ?? "";

  return <ProjectDetailClient userId={session.user?.id || ""} projectId={projectId} />;
}
