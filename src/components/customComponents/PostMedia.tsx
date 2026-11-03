"use client";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

/** Soft neutral blur used while a heavy photo is still downloading. */
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAD1BMVEUwMDUjIygpKS43Nz0dHSCRWP9iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAdUlEQVR4nKWRUQ6AIAxDu633P7MRWhyJURP7Be8xAhsyM+HkmYggiYalYhiIF2rVRBN1ZivBwlY5Sx5FXcEnUbvAj6vw/lx00X7eCuKuie7VZsQllvE4NI8ZL8SJCKvFLZoaePAptgxMgtrrtDlBWjUqcaWZAxx7A/4Ad0IKAAAAAElFTkSuQmCC";

interface PostMediaProps {
  media: string;
  /** Skips lazy loading + eager-decodes. Use for above-the-fold media. */
  priority?: boolean;
  className?: string;
}

function isVideoUrl(url: string) {
  return (
    url.includes("2Fvideo") || /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)
  );
}

/**
 * Renders a post attachment (image or video) with:
 *  - native lazy loading (heavy images only download when scrolled near)
 *  - a themed skeleton shimmer while the file is still in flight
 *  - a blur-up fade-in once the media is ready, avoiding a blank/broken box
 */
export default function PostMedia({
  media,
  priority = false,
  className,
}: PostMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!media || typeof media !== "string") return null;

  const isVideo = isVideoUrl(media);

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl bg-muted",
        !loaded && !failed && "min-h-[14rem]",
        className,
      )}
    >
      {/* Skeleton shimmer shown until the media paints */}
      {!loaded && !failed && (
        <div
          aria-hidden
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted-foreground/10 to-muted"
        />
      )}

      {isVideo ? (
        <video
          src={media}
          controls
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "mx-auto h-full max-h-[30rem] w-auto rounded-2xl object-contain transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : (
        <Image
          src={media}
          alt="Post attachment"
          width={720}
          height={720}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 640px) 100vw, 640px"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "mx-auto size-fit max-h-[30rem] rounded-2xl transition-[opacity,filter] duration-500 ease-out",
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
          )}
        />
      )}

      {/* Broken / unsupported media fallback */}
      {failed && (
        <div className="flex min-h-[10rem] flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="size-6" />
          <span className="text-xs">Media unavailable</span>
        </div>
      )}
    </div>
  );
}
