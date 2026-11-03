"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "./style.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/ui/LoadingButton";
import { Card, CardContent } from "@/components/ui/card";
import {
  AttachmentPreviewList,
  PostImageUpload,
  UploadFileType,
} from "./PostImageUpload";
import { handleMultipleR2Uploads } from "@/lib/upload";
import { mediaType } from "./action";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/customComponents/UserAvatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MAX_FILES_PER_POST } from "@/lib/r2";
import { ImagePlus } from "lucide-react";

const MAX_CHARS = 280;

function PostEditor() {
  const { user } = useSession();
  const [myFiles, setMyFiles] = useState<UploadFileType[]>([]);
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const mutation = useSubmitPostMutation();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    editorProps: {
      attributes: {
        class: "min-h-[3rem] max-h-[20rem] overflow-y-auto outline-none",
      },
    },
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  const trimmedLength = input.trim().length;
  const remaining = MAX_CHARS - trimmedLength;
  const isOverLimit = remaining < 0;
  // Backend schema requires non-empty content (createPostSchema.requiredString).
  const canSubmit =
    trimmedLength > 0 &&
    !isOverLimit &&
    !isMediaUploading &&
    !mutation.isPending;

  const resetComposer = useCallback(() => {
    setMyFiles([]);
    editor?.commands.clearContent();
  }, [editor]);

  const onSubmit = useCallback(() => {
    if (!canSubmit) return;
    const attachments: mediaType[] = myFiles
      .filter((f) => f.media)
      .map((f) => f.media as mediaType);

    mutation.mutate(
      {
        content: input.trim(),
        attachments,
      },
      {
        onSuccess: () => {
          resetComposer();
        },
      },
    );
  }, [canSubmit, input, myFiles, mutation, resetComposer]);

  const uploadFiles = useCallback(
    async (entries: { file: File; mediaId: string }[]) => {
      if (!entries.length) return;
      setIsMediaUploading(true);
      try {
        const uploaded = await handleMultipleR2Uploads(
          entries.map((entry) => entry.file),
          (index, progress) => {
            const id = entries[index]?.mediaId;
            setMyFiles((prev) =>
              prev.map((f) =>
                f.mediaId === id
                  ? { ...f, progress, isUploading: progress < 100 }
                  : f,
              ),
            );
          },
        );

        if (!uploaded?.success || !uploaded.files) {
          setMyFiles((prev) =>
            prev.map((f) =>
              entries.some((entry) => entry.mediaId === f.mediaId)
                ? { ...f, isUploading: false, error: "Upload failed" }
                : f,
            ),
          );
          return;
        }

        const uploadedFiles = uploaded.files;
        setMyFiles((prev) =>
          prev.map((f) => {
            const idx = entries.findIndex(
              (entry) => entry.mediaId === f.mediaId,
            );
            if (idx === -1) return f;
            const item = uploadedFiles[idx];
            if (!item) {
              return { ...f, isUploading: false, error: "Upload failed" };
            }
            return {
              ...f,
              isUploading: false,
              progress: 100,
              error: undefined,
              media: {
                url: item.url,
                type:
                  item.type.startsWith("image") || item.type === "IMAGE"
                    ? "IMAGE"
                    : "VIDEO",
              },
            };
          }),
        );
      } finally {
        setIsMediaUploading(false);
      }
    },
    [],
  );

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const available = MAX_FILES_PER_POST - myFiles.length;
      if (available <= 0) {
        toast.warning(
          `You can attach a maximum of ${MAX_FILES_PER_POST} files.`,
        );
        return;
      }
      const accepted = files.slice(0, available);
      if (accepted.length < files.length) {
        toast.warning(
          `Only ${available} more file${available === 1 ? "" : "s"} can be added.`,
        );
      }
      const entries = accepted.map((file) => ({
        file,
        mediaId: crypto.randomUUID(),
      }));
      setMyFiles((prev) => [
        ...prev,
        ...entries.map((entry) => ({
          file: entry.file,
          mediaId: entry.mediaId,
          isUploading: true,
          progress: 0,
        })),
      ]);
      void uploadFiles(entries);
    },
    [myFiles.length, uploadFiles],
  );

  const handleRemove = useCallback((mediaId: string) => {
    setMyFiles((prev) => prev.filter((f) => f.mediaId !== mediaId));
  }, []);

  const handleRetry = useCallback(
    (mediaId: string) => {
      const target = myFiles.find((f) => f.mediaId === mediaId);
      if (!target) return;
      setMyFiles((prev) =>
        prev.map((f) =>
          f.mediaId === mediaId
            ? { ...f, isUploading: true, progress: 0, error: undefined }
            : f,
        ),
      );
      void uploadFiles([{ file: target.file, mediaId }]);
    },
    [myFiles, uploadFiles],
  );

  // Keyboard shortcut: Cmd/Ctrl + Enter to publish.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSubmit]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.types.includes("Files")) return;
    dragCounter.current += 1;
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) handleFilesSelected(files);
  };

  // Paste image(s) from clipboard straight into the composer (Ctrl/⌘+V).
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles = Array.from(items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => !!file);

    if (imageFiles.length) {
      e.preventDefault();
      handleFilesSelected(imageFiles);
    }
  };

  return (
    <Card
      className="overflow-hidden shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary/30"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <CardContent className="relative p-4 sm:p-5">
        {isDragging && (
          <div className="pointer-events-none absolute inset-1 z-10 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary bg-background/85 text-primary backdrop-blur-sm">
            <ImagePlus className="size-6" />
            <span className="text-sm font-medium">Drop media to attach</span>
          </div>
        )}

        <div className="flex gap-3">
          <UserAvatar
            userAvatarUrl={user.avatarUrl}
            userName={user.displayName}
            size={44}
            className="mt-0.5 flex-none"
          />

          <div className="min-w-0 flex-1">
            <EditorContent editor={editor} className="w-full" />

            <AttachmentPreviewList
              attachments={myFiles}
              onRemove={handleRemove}
              onRetry={handleRetry}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <div className="flex items-center gap-1">
                <PostImageUpload
                  onFileSelected={handleFilesSelected}
                  disabled={isMediaUploading || mutation.isPending}
                />
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {myFiles.length}/{MAX_FILES_PER_POST}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {trimmedLength > 0 && (
                  <CharRing
                    remaining={remaining}
                    isOverLimit={isOverLimit}
                  />
                )}
                <LoadingButton
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className="min-w-20 rounded-full"
                  size="sm"
                  loading={mutation.isPending}
                  title="Publish (Ctrl/⌘ + Enter)"
                >
                  Post
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PostEditor;

function CharRing({
  remaining,
  isOverLimit,
}: {
  remaining: number;
  isOverLimit: boolean;
}) {
  const MAX = MAX_CHARS;
  const used = Math.min(MAX, MAX - remaining);
  const pct = Math.min(1, used / MAX);
  const radius = 10;
  const circumference = 2 * Math.PI * radius;

  const tone = isOverLimit
    ? "stroke-destructive text-destructive"
    : remaining <= 20
      ? "stroke-amber-500 text-amber-500"
      : "stroke-primary text-primary";

  return (
    <div className="relative flex size-7 items-center justify-center" title={`${remaining} characters left`}>
      <svg viewBox="0 0 24 24" className="size-7 -rotate-90">
        <circle cx="12" cy="12" r={radius} fill="none" strokeWidth="2" className="stroke-muted" />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          strokeLinecap="round"
          className={tone}
        />
      </svg>
      {remaining <= 20 && (
        <span className={cn("absolute text-[9px] font-semibold tabular-nums", tone.split(" ")[1])}>
          {Math.max(remaining, -99)}
        </span>
      )}
    </div>
  );
}
