"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Image as ImgIcon, Trash } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
interface PostImageUploadProps {
  onFileSelected: (file: File[]) => void;
  attachments: UploadFileType[];
  onRemoveAttachment: (mediaId: string, idx: number) => void;
  disabled?: boolean;
}

export interface UploadFileType {
  file: File;
  mediaId: string;
  isUploading: boolean;
  progress: number; // 0-100
}
export function PostImageUpload({
  onFileSelected,
  attachments,
  onRemoveAttachment,
  disabled = false,
}: PostImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {attachments && (
        <div
          className={cn(
            "flex flex-col gap-3",
            attachments.length > 1 && "sm:grid sm:grid-cols-2",
          )}
        >
          {attachments.map((fileData, idx) => (
            <AttachmentPreview
              key={idx}
              attachment={fileData}
              onRemoveClick={() => onRemoveAttachment(fileData.mediaId, idx)}
            />
          ))}{" "}
        </div>
      )}
      <Button
        size="icon"
        variant={"ghost"}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        <ImgIcon className="text-primary" size={20} />
      </Button>
      <input
        type="file"
        className="sr-only hidden"
        accept="image/*, video/*"
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

interface AttachmentPreviewProps {
  attachment: UploadFileType;
  onRemoveClick?: () => void;
}

export function AttachmentPreview({
  attachment: { file, isUploading, progress },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    setSrc(URL.createObjectURL(file));
    return () => URL.revokeObjectURL(src); // clean up
  }, [file]);

  return (
    <div
      className={`relative mx-auto size-fit ${isUploading ? "opacity-50" : ""}`}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
          <div className="text-center text-white">
            <div className="text-lg font-medium">Uploading...</div>
            <div className="mt-1 text-sm">{progress}%</div>
            <div className="mt-2 h-2 w-40 rounded bg-white/30">
              <div
                className="h-full rounded bg-green-400"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Remove button */}
      {onRemoveClick && (
        <Button
          className="absolute top-2 right-2"
          onClick={onRemoveClick}
          size="icon"
          disabled={isUploading}
          variant="destructive"
        >
          <Trash size={25} />
        </Button>
      )}
    </div>
  );
}
