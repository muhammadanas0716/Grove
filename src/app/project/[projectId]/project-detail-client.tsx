"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { ThemeToggle } from "@/components/theme-toggle";

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

type ProjectDetailClientProps = {
  userId: string;
  projectId: string;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function ProjectDetailClient({ userId, projectId }: ProjectDetailClientProps) {
  const project = useQuery(
    api.projects.getProjectById,
    projectId ? { userId: userId as any, projectId: projectId as any } : "skip"
  );

  const mediaItems = useQuery(
    api.media.listByProject,
    project?._id ? { userId: userId as any, projectId: project._id } : "skip"
  );

  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveMedia = useMutation(api.media.saveMedia);
  const ensureInviteToken = useMutation(api.projects.ensureInviteToken);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const role = project?.role ?? "collaborator";
  const canUpload = role === "owner";

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

  const handleFiles = async (files: FileList | null, kind: MediaKind) => {
    if (!files || files.length === 0 || !project?._id || !canUpload) return;
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
      const message = error instanceof Error ? error.message : "Failed to upload files";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const mediaList = mediaItems ?? [];
  const videos = useMemo(
    () => mediaList.filter((item) => item.kind === "video"),
    [mediaList]
  );
  const photos = useMemo(
    () => mediaList.filter((item) => item.kind === "image"),
    [mediaList]
  );

  if (project === undefined) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-10 py-12">
        <p className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
          Loading project…
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-10 py-12">
        <Link href="/" className="text-sm text-[var(--muted)]">
          Back to home
        </Link>
        <p className="mt-6 text-lg" style={{ fontFamily: "var(--font-display), serif" }}>
          Project not found
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <ThemeToggle />
      <div className="px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={role === "owner" ? "/dashboard" : "/"}
            className="text-sm text-[var(--muted)]"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            {role === "owner" ? "← Back to dashboard" : "← Back to home"}
          </Link>
          <span className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
            {role === "owner" ? "Owner" : "Collaborator"}
          </span>
        </div>

        <section className="mt-6 border border-[var(--border)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                Project
              </p>
              <h1 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display), serif" }}>
                {project.name}
              </h1>
            </div>
            <p className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
              {mediaList.length} assets
            </p>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
            {role === "owner"
              ? "Upload video or photo files. Click any thumbnail to open the viewer."
              : "View and annotate assets. Uploads are disabled for collaborators."}
          </p>

          {role === "owner" &&
            (shareUrl ? (
              <div className="mt-5 border border-[var(--border)] p-4">
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  Share link (view + notes only)
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-[var(--foreground)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
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
                    className="border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {shareCopied ? "Copied" : "Copy link"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 border border-[var(--border)] p-4">
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
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
                    className="border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    Generate link
                  </button>
                  {shareError && (
                    <span className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                      {shareError}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </section>

        <div className="mt-8 space-y-8">
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
            <MediaGrid items={videos} kind="video" projectId={project._id} />
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
            <MediaGrid items={photos} kind="image" projectId={project._id} />
          </section>

          {uploadError && (
            <p className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
              {uploadError}
            </p>
          )}
        </div>
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
  inputRef: React.RefObject<HTMLInputElement>;
};

function UploadZone({ title, description, hint, kind, onFiles, disabled, inputRef }: UploadZoneProps) {
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
      className={`border border-[var(--border)] p-5 transition ${
        dragging ? "border-[var(--accent)]" : "hover:border-[var(--accent)]"
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
          <h4 className="mt-3 text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
            {description}
          </h4>
          <p className="mt-3 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
            {hint}
          </p>
        </div>
        <div className="h-10 w-10 border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
          {kind === "video" ? <VideoIcon /> : <ImageIcon />}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="bg-[var(--accent)] px-3 py-2 text-sm text-[var(--background)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          Add {kind === "video" ? "videos" : "photos"}
        </button>
        <span className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
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
  projectId: string;
};

function MediaGrid({ items, kind, projectId }: MediaGridProps) {
  if (items.length === 0) {
    return (
    <div className="border border-dashed border-[var(--border)] p-6 text-center">
        <p className="text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
          {kind === "video" ? "No videos yet." : "No photos yet."}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
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
          href={`/project/${projectId}/media/${item._id}`}
          className="group block border border-[var(--border)] p-3 text-left transition hover:border-[var(--accent)]"
        >
          <div className="relative overflow-hidden border border-[var(--border)] bg-[#0B120A]">
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
              className="absolute bottom-3 left-3 border border-[var(--border)] bg-[#0D130C] px-3 py-1 text-xs"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              Open
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
              {item.name}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
              {formatBytes(item.size)} · {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </Link>
      ))}
    </div>
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
