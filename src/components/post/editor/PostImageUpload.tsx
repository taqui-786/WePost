"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Image as ImgIcon, Loader2, RotateCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export interface UploadFileType {
  file: File;
  mediaId: string;
  isUploading: boolean;
  progress: number; // 0-100
  error?: string;
  /** Populated once the file finishes uploading to R2. */
  media?: {
    url: string;
    type: "IMAGE" | "VIDEO";
  };
}

interface PostImageUploadProps {
  onFileSelected: (file: File[]) => void;
  disabled?: boolean;
}

/**
 * Toolbar button that opens the native file picker for images & videos.
 */
export function PostImageUpload({
  onFileSelected,
  disabled = false,
}: PostImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        title="Add photos or a video"
        aria-label="Add photos or a video"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="gap-2 text-primary hover:text-primary"
      >
        <ImgIcon className="size-5" />
        <span className="hidden lg:inline">Media</span>
      </Button>
      <input
        type="file"
        className="sr-only hidden"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        multiple
        ref={fileInputRef}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFileSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewListProps {
  attachments: UploadFileType[];
  onRemove: (mediaId: string) => void;
  onRetry: (mediaId: string) => void;
}

/**
 * Responsive grid of attachment previews with live upload progress,
 * failure state and retry support.
 */
export function AttachmentPreviewList({
  attachments,
  onRemove,
  onRetry,
}: AttachmentPreviewListProps) {
  if (!attachments.length) return null;

  const count = attachments.length;

  return (
    <div
      className={cn(
        "mt-3 grid gap-2",
        count === 1 ? "grid-cols-1" : "grid-cols-2",
        count === 3 && "sm:grid-cols-3",
      )}
      role="list"
      aria-label="Attachments"
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.mediaId}
          attachment={attachment}
          onRemoveClick={() => onRemove(attachment.mediaId)}
          onRetryClick={() => onRetry(attachment.mediaId)}
          single={count === 1}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: UploadFileType;
  onRemoveClick?: () => void;
  onRetryClick?: () => void;
  single?: boolean;
}

export function AttachmentPreview({
  attachment: { file, isUploading, progress, error },
  onRemoveClick,
  onRetryClick,
  single = false,
}: AttachmentPreviewProps) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!file || !src) {
    return null;
  }

  const isImage = file.type.startsWith("image");
  const hasError = Boolean(error);

  return (
    <div
      role="listitem"
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-muted",
        single ? "aspect-video" : "aspect-square",
      )}
    >
      {isImage ? (
        <Image
          src={src}
          alt={file.name || "Attachment preview"}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, 320px"
          className="object-cover"
        />
      ) : (
        <video
          controls
          className="h-full w-full object-cover"
          preload="metadata"
        >
          <source src={src} type={file.type} />
        </video>
      )}

      {/* Live upload progress overlay */}
      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white backdrop-blur-[1px]">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-xs font-medium tabular-nums">
            Uploading {progress}%
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error overlay with retry */}
      {hasError && !isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-destructive/85 p-3 text-center text-white">
          <AlertCircle className="size-6" />
          <span className="text-xs font-medium">
            {error === "Upload failed" ? "Upload failed" : error}
          </span>
          {onRetryClick && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 gap-1 px-2 text-xs"
              onClick={onRetryClick}
            >
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Remove button */}
      {onRemoveClick && !isUploading && (
        <Button
          type="button"
          className="absolute top-2 right-2 size-8 rounded-full opacity-90 transition-opacity group-hover:opacity-100"
          onClick={onRemoveClick}
          size="icon"
          variant="destructive"
          title="Remove attachment"
          aria-label="Remove attachment"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}
