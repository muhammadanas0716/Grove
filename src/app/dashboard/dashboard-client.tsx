"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

type MediaKind = "video" | "image";

type MediaItem = {
  _id: string;
  kind: MediaKind;
  name: string;
  size: number;
  url: string | null;
  createdAt: number;
  mimeType?: string | null;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function DashboardClient({ userId }: { userId: string }) {
  const subscription = useQuery(api.subscriptions.getUserSubscription, {
    userId: userId as any,
  });

  const status = subscription?.subscriptionStatus ?? "inactive";
  const isTrial = status === "trialing";
  const isActive = status === "active";
  const hasAccess = isActive || isTrial;

  const project = useQuery(
    api.projects.getUserProject,
    hasAccess ? { userId: userId as any } : "skip"
  );
  const canUpload = hasAccess && !!project;
  const mediaItems = useQuery(
    api.media.listByProject,
    project?._id
      ? { userId: userId as any, projectId: project._id }
      : "skip"
  );

  const createProject = useMutation(api.projects.createProject);
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveMedia = useMutation(api.media.saveMedia);
  const ensureInviteToken = useMutation(api.projects.ensureInviteToken);

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [projectInput, setProjectInput] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (project?.name) {
      setProjectInput(project.name);
    }
  }, [project?.name]);

  useEffect(() => {
    if (!project?.inviteToken) {
      setShareUrl(null);
      return;
    }
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    setShareUrl(`${base}/invite/${project.inviteToken}`);
  }, [project?.inviteToken]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/polar/sync", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to sync subscription");
      }
      setSyncMessage("Subscription synced from Polar.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sync subscription";
      setSyncMessage(message);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateProject = async (event: FormEvent) => {
    event.preventDefault();
    if (!hasAccess) return;
    const trimmed = projectInput.trim();
    if (!trimmed) return;
    setCreatingProject(true);
    setProjectError(null);
    try {
      await createProject({ userId: userId as any, name: trimmed });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create project";
      setProjectError(message);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleFiles = async (files: FileList | null, kind: MediaKind) => {
    if (!files || files.length === 0 || !project?._id || !hasAccess) return;
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUploadUrl({ userId: userId as any });
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!response.ok) {
          throw new Error("Upload failed. Please try again.");
        }
        const { storageId } = (await response.json()) as { storageId: string };
        await saveMedia({
          userId: userId as any,
          projectId: project._id,
          storageId: storageId as any,
          kind,
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload files";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const projectLoaded = project !== undefined;
  const mediaList = mediaItems ?? [];
  const videos = useMemo(
    () => mediaList.filter((item) => item.kind === "video"),
    [mediaList]
  );
  const photos = useMemo(
    () => mediaList.filter((item) => item.kind === "image"),
    [mediaList]
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] page-transition">
      <ThemeToggle />
      <div className="flex min-h-screen">
        <aside
          className={`shrink-0 transition-[width] duration-300 ease-out ${
            sidebarOpen
              ? "w-64 border-r border-[var(--border)] bg-[var(--surface-5)] px-6 py-8 rounded-r-[32px] overflow-hidden"
              : "w-0 overflow-hidden border-r-0 px-0 py-0 pointer-events-none"
          }`}
        >
          <div>
            <h1
              className="text-[clamp(44px,5vw,72px)] leading-[0.9]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              grove
            </h1>
            <p
              className="mt-4 text-sm text-[var(--muted)]"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              Media review workspace
            </p>
          </div>

          <div className="mt-10 space-y-8">
            <div>
              <p className="text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
                Plan status
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs ${
                    isActive
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : isTrial
                      ? "border-[var(--foreground)] text-[var(--foreground)]"
                      : "border-[var(--muted)] text-[var(--muted)]"
                  }`}
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {isActive ? "Active" : isTrial ? "Trial" : "No access"}
                </span>
                <span
                  className="text-xs text-[var(--muted)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  Status {status}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="mt-4 w-full rounded-full border border-[var(--border)] bg-[var(--surface-4)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)] disabled:opacity-60"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                {syncing ? "Syncing..." : "Sync subscription"}
              </button>
              {syncMessage && (
                <p
                  className="mt-2 text-xs text-[var(--muted)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {syncMessage}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
                Project
              </p>
              <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-display), serif" }}>
                {project?.name ?? "No project yet"}
              </p>
              <p
                className="mt-2 text-xs text-[var(--muted)]"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                {project?.name
                  ? "Upload and review your media below."
                  : "Create a project to start uploading."}
              </p>
            </div>

            <div>
              <p className="text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
                Toolbar
              </p>
              {canUpload ? (
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={!canUpload || uploading}
                    className="w-full rounded-full border border-[var(--border)] bg-[var(--surface-4)] px-3 py-2 text-sm transition hover:border-[var(--accent)] disabled:opacity-60"
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    Upload video
                  </button>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={!canUpload || uploading}
                    className="w-full rounded-full border border-[var(--border)] bg-[var(--surface-4)] px-3 py-2 text-sm transition hover:border-[var(--accent)] disabled:opacity-60"
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    Upload photo
                  </button>
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-full border border-[var(--border)] bg-[var(--surface-4)] px-3 py-2 text-sm text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    Review mode (soon)
                  </button>
                </div>
              ) : (
                <p
                  className="mt-3 text-xs text-[var(--muted)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {hasAccess
                    ? "Create a project to enable uploads."
                    : "Activate a plan or trial to enable uploads."}
                </p>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 px-8 py-10">
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-4)] px-4 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            </button>
          </div>
          <header className="max-w-4xl">
            <h2
              className="text-[clamp(40px,4vw,64px)] leading-[1.05]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Dashboard
            </h2>
            <p
              className="mt-4 text-base text-[var(--muted)]"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              Upload videos or photos, preview them with a custom viewer, and keep your review bay clean.
            </p>
          </header>

          {!hasAccess && (
            <section className="mt-8 max-w-3xl rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
              <h3
                className="text-2xl"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                Access locked
              </h3>
              <p
                className="mt-3 text-sm text-[var(--muted)]"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                No active plan or trial found. Start a trial to unlock uploads.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/subscribe"
                  className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm text-[var(--background)] transition hover:bg-[var(--accent-hover)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  Start trial
                </a>
                <a
                  href="/subscribe"
                  className="rounded-full border border-[var(--border)] px-5 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  View plans
                </a>
              </div>
            </section>
          )}

          {hasAccess && !projectLoaded && (
            <section className="mt-8 max-w-3xl rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
              <p
                className="text-sm text-[var(--muted)]"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                Loading project…
              </p>
            </section>
          )}

          {hasAccess && projectLoaded && !project && (
            <section className="mt-8 max-w-3xl rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
              <h3
                className="text-2xl"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                Name your first project
              </h3>
              <p
                className="mt-3 text-sm text-[var(--muted)]"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                This creates a workspace for your uploads. You can always add another project later.
              </p>
              <form className="mt-5 flex flex-col gap-4" onSubmit={handleCreateProject}>
                <input
                  type="text"
                  value={projectInput}
                  onChange={(event) => setProjectInput(event.target.value)}
                  placeholder="Launch teaser v1"
                  className="h-11 rounded-full border border-[var(--border)] bg-transparent px-4 text-base font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                  style={{ fontFamily: "var(--font-sans), sans-serif" }}
                />
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="w-fit rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--background)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
                  style={{ fontFamily: "var(--font-sans), sans-serif" }}
                >
                  {creatingProject ? "Creating..." : "Create project"}
                </button>
                {projectError && (
                  <p
                    className="text-xs text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {projectError}
                  </p>
                )}
              </form>
            </section>
          )}

          {hasAccess && projectLoaded && project && (
            <div className="mt-8 space-y-8">
              <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p
                      className="text-sm text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-mono), monospace" }}
                    >
                      Current project
                    </p>
                    <h3
                      className="mt-2 text-3xl"
                      style={{ fontFamily: "var(--font-display), serif" }}
                    >
                      {project.name}
                    </h3>
                  </div>
                  <p
                    className="text-sm text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {mediaList.length} assets
                  </p>
                </div>
                <p
                  className="mt-4 text-sm text-[var(--muted)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  Upload video or photo files. Click any thumbnail to open the viewer.
                </p>
                {shareUrl ? (
                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p
                      className="text-xs text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-mono), monospace" }}
                    >
                      Share link (view + notes only)
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span
                        className="text-xs text-[var(--foreground)]"
                        style={{ fontFamily: "var(--font-mono), monospace" }}
                      >
                        {shareUrl}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!shareUrl) return;
                          await navigator.clipboard.writeText(shareUrl);
                          setShareCopied(true);
                          setTimeout(() => setShareCopied(false), 2000);
                        }}
                        className="rounded-full border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        style={{ fontFamily: "var(--font-mono), monospace" }}
                      >
                        {shareCopied ? "Copied" : "Copy link"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p
                      className="text-xs text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-mono), monospace" }}
                    >
                      Generate a share link for collaborators.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!project) return;
                          setShareError(null);
                          try {
                            const token = await ensureInviteToken({
                              userId: userId as any,
                              projectId: project._id,
                            });
                            const base =
                              process.env.NEXT_PUBLIC_APP_URL ||
                              (typeof window !== "undefined" ? window.location.origin : "");
                            setShareUrl(`${base}/invite/${token}`);
                          } catch (error) {
                            const message =
                              error instanceof Error ? error.message : "Failed to generate link";
                            setShareError(message);
                          }
                        }}
                        className="rounded-full border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        style={{ fontFamily: "var(--font-mono), monospace" }}
                      >
                        Generate link
                      </button>
                      {shareError && (
                        <span
                          className="text-xs text-[var(--muted)]"
                          style={{ fontFamily: "var(--font-mono), monospace" }}
                        >
                          {shareError}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className="grid gap-5 lg:grid-cols-[1.05fr_1.4fr]">
                <UploadZone
                  title="Upload videos"
                  description="Drag MP4, MOV, or WebM files into the bay."
                  hint={`${videos.length} videos in this project`}
                  kind="video"
                  onFiles={handleFiles}
                  disabled={!canUpload || uploading}
                  inputRef={videoInputRef}
                />
                <MediaGrid items={videos} kind="video" />
              </section>

              <section className="grid gap-5 lg:grid-cols-[1.05fr_1.4fr]">
                <UploadZone
                  title="Upload photos"
                  description="Drop PNG, JPG, or HEIC frames."
                  hint={`${photos.length} photos in this project`}
                  kind="image"
                  onFiles={handleFiles}
                  disabled={!canUpload || uploading}
                  inputRef={imageInputRef}
                />
                <MediaGrid items={photos} kind="image" />
              </section>

              {uploadError && (
                <p
                  className="text-sm text-[var(--muted)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {uploadError}
                </p>
              )}

              <div className="flex justify-center">
                <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] px-5 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <DockButton
                      label="Upload video"
                      helper={uploading ? "Uploading" : "Quick add"}
                      onClick={() => videoInputRef.current?.click()}
                      disabled={!canUpload || uploading}
                    >
                      <VideoIcon />
                    </DockButton>
                    <DockButton
                      label="Upload photo"
                      helper={uploading ? "Uploading" : "Quick add"}
                      onClick={() => imageInputRef.current?.click()}
                      disabled={!canUpload || uploading}
                    >
                      <ImageIcon />
                    </DockButton>
                    <DockButton label="Review mode" helper="Soon" disabled>
                      <WaveIcon />
                    </DockButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}

type UploadZoneProps = {
  title: string;
  description: string;
  hint: string;
  kind: MediaKind;
  onFiles: (files: FileList | null, kind: MediaKind) => void;
  disabled?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

function UploadZone({
  title,
  description,
  hint,
  kind,
  onFiles,
  disabled,
  inputRef,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const accept = kind === "video" ? "video/*" : "image/*";

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setDragging(false);
    onFiles(event.dataTransfer.files, kind);
  };

  return (
    <div
      className={`rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--surface-1)] p-6 transition-all ${
        dragging ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "hover:border-[var(--accent)]"
      } ${disabled ? "opacity-60" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
            {title}
          </p>
          <h4
            className="mt-3 text-lg font-medium"
            style={{ fontFamily: "var(--font-sans), sans-serif" }}
          >
            {description}
          </h4>
          <p
            className="mt-3 text-xs text-[var(--muted)]"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            {hint}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
          {kind === "video" ? <VideoIcon /> : <ImageIcon />}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-[var(--background)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          Add {kind === "video" ? "videos" : "photos"}
        </button>
        <span
          className="text-xs text-[var(--muted)]"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          or drag files here
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        onChange={(event) => onFiles(event.target.files, kind)}
        className="hidden"
      />
    </div>
  );
}

type MediaGridProps = {
  items: MediaItem[];
  kind: MediaKind;
};

function MediaGrid({ items, kind }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--surface-3)] p-6 text-center">
        <p className="text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
          {kind === "video" ? "No videos yet." : "No photos yet."}
        </p>
        <p
          className="mt-2 text-xs text-[var(--muted)]"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          Upload a file to preview it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item._id}
          href={`/dashboard/media/${item._id}`}
          className="group block rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3 text-left transition-all hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
            {item.url ? (
              item.kind === "video" ? (
                <video
                  src={item.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
                />
              )
            ) : (
              <div className="flex h-36 items-center justify-center text-xs text-[var(--muted)]">
                Preview unavailable
              </div>
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div
              className="absolute bottom-3 left-3 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              Open
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
              {item.name}
            </p>
            <p
              className="mt-1 text-xs text-[var(--muted)]"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              {formatBytes(item.size)} · {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

type DockButtonProps = {
  label: string;
  helper: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

function DockButton({ label, helper, disabled, onClick, children }: DockButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] disabled:opacity-60"
    >
      <span className="text-[var(--accent)]">{children}</span>
      <span>
        <p
          className="text-xs text-[var(--muted)]"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          {helper}
        </p>
        <p className="text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
          {label}
        </p>
      </span>
    </button>
  );
}

function VideoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.75 7.5A2.25 2.25 0 0 1 6 5.25h9A2.25 2.25 0 0 1 17.25 7.5v9A2.25 2.25 0 0 1 15 18.75H6A2.25 2.25 0 0 1 3.75 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m17.25 9.75 3.53-2.35A.75.75 0 0 1 22 8.03v7.94a.75.75 0 0 1-1.22.58l-3.53-2.35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 6A1.5 1.5 0 0 1 6 4.5h12A1.5 1.5 0 0 1 19.5 6v12A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m7.5 15 3.25-3.25a1.5 1.5 0 0 1 2.12 0L16.5 15.38l1.75-1.75a1.5 1.5 0 0 1 2.12 0l1.38 1.37"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12c2.5 0 2.5-6 5-6s2.5 12 5 12 2.5-6 5-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
