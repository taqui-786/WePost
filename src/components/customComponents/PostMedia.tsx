"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface PostMediaProps {
  media: string;
}

function isVideoUrl(url: string) {
  return (
    url.includes("2Fvideo") || /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)
  );
}

/**
 * Renders a post attachment (image or video) with:
 *  - native lazy loading (heavy media only downloads when scrolled near)
 *  - a themed skeleton shimmer while the file is still in flight
 *  - a fade-in once the media paints, avoiding a blank/broken box
 *
 * Images are served straight from R2 (sized + re-encoded to webp at upload
 * time) instead of via the /_next/image optimizer, which 504s on large files.
 */
export default function PostMedia({ media }: PostMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!media || typeof media !== "string") return null;

  const isVideo = isVideoUrl(media);

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl bg-muted",
        !loaded && !failed && "min-h-[14rem]",
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
        <img
          src={media}
          alt="Post attachment"
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "mx-auto block max-h-[30rem] w-auto max-w-full rounded-2xl transition-opacity duration-500 ease-out",
            loaded ? "opacity-100" : "opacity-0",
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
