"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { ThemeToggle } from "@/components/theme-toggle";

type MediaDetailClientProps = {
  userId: string;
  mediaId: string;
  backHref: string;
  backLabel: string;
};

type NoteDraft = {
  body: string;
  timestamp: string;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatTimestamp = (value: number) => {
  if (!Number.isFinite(value)) return "0:00";
  const totalSeconds = Math.max(0, Math.floor(value));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const parseTimestamp = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  const parts = trimmed.split(":").map((part) => part.trim());
  if (parts.length === 2) {
    const [mins, secs] = parts;
    if (!/^[0-9]+$/.test(mins) || !/^[0-9]+(\.[0-9]+)?$/.test(secs)) return null;
    return Number(mins) * 60 + Number(secs);
  }
  if (parts.length === 3) {
    const [hours, mins, secs] = parts;
    if (!/^[0-9]+$/.test(hours) || !/^[0-9]+$/.test(mins) || !/^[0-9]+(\.[0-9]+)?$/.test(secs)) {
      return null;
    }
    return Number(hours) * 3600 + Number(mins) * 60 + Number(secs);
  }
  return null;
};

export default function MediaDetailClient({
  userId,
  mediaId,
  backHref,
  backLabel,
}: MediaDetailClientProps) {
  const media = useQuery(
    api.media.getById,
    mediaId ? { userId: userId as any, mediaId: mediaId as any } : "skip"
  );

  const notes = useQuery(
    api.notes.listByMedia,
    media?._id ? { userId: userId as any, mediaId: media._id } : "skip"
  );

  const addNote = useMutation(api.notes.addNote);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [noteDraft, setNoteDraft] = useState<NoteDraft>({ body: "", timestamp: "0:00" });
  const [noteError, setNoteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isVideo = media?.kind === "video";

  useEffect(() => {
    if (!isVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const handleTime = () => setCurrentTime(video.currentTime || 0);
    const handleDuration = () => setDuration(video.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTime);
    video.addEventListener("loadedmetadata", handleDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTime);
      video.removeEventListener("loadedmetadata", handleDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [isVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleUseCurrent = () => {
    setNoteDraft((prev) => ({ ...prev, timestamp: formatTimestamp(currentTime) }));
  };

  const handleAddNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!media?._id) return;
    setSaving(true);
    setNoteError(null);
    try {
      const timestamp = isVideo ? parseTimestamp(noteDraft.timestamp) : null;
      if (isVideo && timestamp === null) {
        throw new Error("Enter a valid timestamp (mm:ss or seconds). A value like 01:24 works.");
      }
      await addNote({
        userId: userId as any,
        mediaId: media._id,
        body: noteDraft.body,
        timestamp: isVideo ? timestamp : null,
      });
      setNoteDraft({ body: "", timestamp: isVideo ? formatTimestamp(currentTime) : "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add note";
      setNoteError(message);
    } finally {
      setSaving(false);
    }
  };

  const sortedNotes = useMemo(() => notes ?? [], [notes]);

  if (media === undefined) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-10 py-12">
        <p className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
          Loading media…
        </p>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-10 py-12">
        <Link href={backHref} className="text-sm text-[var(--muted)]">
          {backLabel}
        </Link>
        <p className="mt-6 text-lg" style={{ fontFamily: "var(--font-display), serif" }}>
          Media not found
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
            href={backHref}
            className="text-sm text-[var(--muted)]"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            {backLabel}
          </Link>
          <span className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
            {media.kind === "video" ? "Video" : "Photo"}
          </span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <section className="rounded-[28px] border border-[var(--border)] bg-[rgba(14,18,12,0.25)] p-5">
            <h1
              className="text-[clamp(28px,3vw,44px)]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {media.name}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
              {formatBytes(media.size)} · {new Date(media.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0B120A]">
              {media.url ? (
                isVideo ? (
                  <video
                    ref={videoRef}
                    src={media.url}
                    className="h-[360px] w-full object-contain"
                    playsInline
                    onClick={togglePlay}
                  />
                ) : (
                  <div className="flex h-[360px] items-center justify-center">
                    <img src={media.url} alt={media.name} className="max-h-full max-w-full object-contain" />
                  </div>
                )
              ) : (
                <div className="flex h-[360px] items-center justify-center text-sm text-[var(--muted)]">
                  Preview unavailable
                </div>
              )}
            </div>

            {isVideo && (
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[rgba(14,18,12,0.35)] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs text-[var(--background)]"
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{ fontFamily: "var(--font-mono), monospace" }}
                  >
                    {isMuted ? "Unmute" : "Mute"}
                  </button>
                  <div className="ml-auto text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                    {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={(event) => handleSeek(Number(event.target.value))}
                  className="mt-4 h-2 w-full cursor-pointer accent-[var(--accent)]"
                />
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-[var(--border)] bg-[rgba(14,18,12,0.25)] p-5">
            <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
              Notes
            </h2>
            <p className="mt-2 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
              {isVideo
                ? "Add notes tied to exact timestamps."
                : "Add general notes for this photo."}
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleAddNote}>
              {isVideo && (
                <div>
                  <label className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                    Timestamp
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={noteDraft.timestamp}
                      onChange={(event) =>
                        setNoteDraft((prev) => ({ ...prev, timestamp: event.target.value }))
                      }
                      placeholder="01:24"
                      className="h-10 w-full rounded-2xl border border-[var(--border)] bg-transparent px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                      style={{ fontFamily: "var(--font-mono), monospace" }}
                    />
                    <button
                      type="button"
                      onClick={handleUseCurrent}
                      className="rounded-full border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      style={{ fontFamily: "var(--font-mono), monospace" }}
                    >
                      Use current
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  Note
                </label>
                <textarea
                  value={noteDraft.body}
                  onChange={(event) => setNoteDraft((prev) => ({ ...prev, body: event.target.value }))}
                  placeholder="Add your feedback here…"
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-[var(--border)] bg-transparent px-3 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                />
              </div>
              {noteError && (
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  {noteError}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm text-[var(--background)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                {saving ? "Saving…" : "Add note"}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {sortedNotes.length === 0 && (
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  No notes yet.
                </p>
              )}
              {sortedNotes.map((note) => (
                <div
                  key={note._id}
                  className="rounded-2xl border border-[var(--border)] bg-[rgba(14,18,12,0.25)] p-4 transition hover:border-[var(--accent)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                      {note.timestamp !== null && isVideo
                        ? formatTimestamp(note.timestamp)
                        : "General"}
                    </span>
                    <span className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                      {note.authorName}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                    {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <p className="mt-3 text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
                    {note.body}
                  </p>
                  {isVideo && note.timestamp !== null && (
                    <button
                      type="button"
                      onClick={() => handleSeek(note.timestamp ?? 0)}
                      className="mt-3 inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--accent)] transition hover:border-[var(--accent)]"
                      style={{ fontFamily: "var(--font-mono), monospace" }}
                    >
                      Jump to time
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
