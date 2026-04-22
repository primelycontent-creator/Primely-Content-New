"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type CreatorVideo = {
  name: string;
  niche: string;
  src: string;
  poster?: string;
};

type Props = {
  items: CreatorVideo[];
  intervalMs?: number; // auto-advance (when not manually playing)
};

export default function CreatorCarousel({ items, intervalMs = 7000 }: Props) {
  const safeItems = useMemo(() => items?.filter(Boolean) ?? [], [items]);
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [manualPlay, setManualPlay] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);

  const current = safeItems[index];

  // Auto advance unless user clicked to play manually (or lightbox open)
  useEffect(() => {
    if (!safeItems.length) return;
    if (manualPlay) return;
    if (isLightboxOpen) return;

    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeItems.length);
    }, intervalMs);

    return () => window.clearInterval(t);
  }, [safeItems.length, intervalMs, manualPlay, isLightboxOpen]);

  // When index changes: reset manualPlay, keep muted default, restart video
  useEffect(() => {
    setManualPlay(false);
    setMuted(true);

    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [index]);

  // Escape closes lightbox
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsLightboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!current) return null;

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    const v = videoRef.current;
    if (v) v.muted = next;
  }

  function openLightbox() {
    setIsLightboxOpen(true);
    setManualPlay(true);

    // Sync play in lightbox
    window.setTimeout(() => {
      const lv = lightboxVideoRef.current;
      if (!lv) return;
      lv.muted = false; // lightbox: sound on by default (feel free to change)
      lv.currentTime = 0;
      lv.play().catch(() => {});
    }, 0);
  }

  function closeLightbox() {
    setIsLightboxOpen(false);
    const lv = lightboxVideoRef.current;
    if (lv) {
      lv.pause();
      lv.currentTime = 0;
    }
  }

  return (
    <>
      {/* Main video frame */}
      <div
        className="group relative overflow-hidden rounded-3xl border bg-black shadow-sm"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Aspect ratio: taller so it feels like “right half hero” */}
        <div className="relative aspect-[4/5] w-full md:aspect-[16/15] lg:aspect-[4/5]">
          <video
            ref={videoRef}
            key={current.src}
            className="absolute inset-0 h-full w-full object-cover"
            src={current.src}
            poster={current.poster}
            playsInline
            muted={muted}
            autoPlay
            loop={!manualPlay} // if user clicks, we stop looping behavior in main view
            controls={false}
            onClick={() => {
              setManualPlay(true);
              openLightbox();
            }}
          />

          {/* Gradient overlay + name/niche */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-gray-900 backdrop-blur">
              <span className="truncate">{current.name}</span>
              <span className="text-gray-500">•</span>
              <span className="truncate text-gray-600">{current.niche}</span>
            </div>
          </div>

          {/* Top-right actions (show on hover) */}
          <div
            className={
              "absolute right-3 top-3 flex items-center gap-2 transition " +
              (hover ? "opacity-100" : "opacity-0")
            }
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-gray-900 backdrop-blur hover:bg-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? "Sound off" : "Sound on"}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLightbox();
              }}
              className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-gray-900 backdrop-blur hover:bg-white"
              aria-label="Open fullscreen"
            >
              Fullscreen
            </button>
          </div>

          {/* Small dots (optional) – no thumbnails/cards */}
          {safeItems.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {safeItems.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={
                    "h-2 w-2 rounded-full transition " +
                    (i === index ? "bg-white" : "bg-white/40 hover:bg-white/70")
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  aria-label={`Go to creator ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full">
              <video
                ref={lightboxVideoRef}
                key={`lightbox-${current.src}`}
                className="absolute inset-0 h-full w-full object-contain"
                src={current.src}
                poster={current.poster}
                playsInline
                controls
              />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
              <div className="min-w-0 text-sm text-white">
                <div className="truncate font-semibold">{current.name}</div>
                <div className="truncate text-white/70">{current.niche}</div>
              </div>

              <button
                type="button"
                onClick={closeLightbox}
                className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}