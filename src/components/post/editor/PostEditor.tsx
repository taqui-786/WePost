"use client";
import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "./style.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/ui/LoadingButton";
import { Card, CardContent } from "@/components/ui/card";
import { PostImageUpload, UploadFileType } from "./PostImageUpload";
import { handleMultipleFirebaseUploads } from "@/lib/Firebase";
import { mediaType } from "./action";
function PostEditor() {
  const [myFiles, setMyFiles] = useState<UploadFileType[]>([]);
  const [readyFiles, setReadyFiles] = useState<mediaType[]>([]);
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const removeFile = (mediaId: string, idx: number) => {
    setMyFiles((prev) => prev.filter((media) => media.mediaId !== mediaId));
    const theFile = readyFiles[idx]
    setReadyFiles((files) => files.filter((itm) => itm.url !== theFile.url))
  };
  const mutation = useSubmitPostMutation();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "what's crack-a-lackin ?",
      }),
    ],
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  async function onSubmit() {
    mutation.mutate(
      {
        content: input,
        attachments: readyFiles || [],
      },
      {
        onSuccess: () => {
          setMyFiles([])
          setReadyFiles([])
          editor?.commands.clearContent();
        },
      },
    );
  }
  const testingImageUpload = async (files: File[]) => {
    setIsMediaUploading(true);
    const fileWrappers: UploadFileType[] = files.map((file) => ({
      file,
      mediaId: crypto.randomUUID(),
      isUploading: true,
      progress: 0,
    }));

    // Add to local state before uploading
    setMyFiles((prev) => [...prev, ...fileWrappers]);
    const uploadedMedia = await handleMultipleFirebaseUploads(
      files,
      (index, progress) => {
        setMyFiles((prev) =>
          prev.map((file, idx) =>
            idx === prev.length - files.length + index
              ? { ...file, progress, isUploading: progress < 100 }
              : file,
          ),
        );
      },
    );

    if (!uploadedMedia) return;

    const mediaFormatted: mediaType[] = uploadedMedia?.files!.map((item) => ({
      url: item.url,
      type: item.type.startsWith("image") ? "IMAGE" : "VIDEO",
    }));
    if (uploadedMedia.success) {
      setIsMediaUploading(false);
    }

    setReadyFiles((prev) => [...prev, ...mediaFormatted]);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex">
          <EditorContent
            editor={editor}
            className="bg-background max-h-[20rem] w-full overflow-y-auto rounded-xl px-5 py-3"
          />
        </div>
        <div className="flex items-end justify-end gap-2">
          <PostImageUpload
            onFileSelected={testingImageUpload}
            attachments={myFiles}
            onRemoveAttachment={removeFile}
          />
          <LoadingButton
            onClick={onSubmit}
            disabled={!input.trim() || isMediaUploading || mutation.isPending}
            className="mt-4 min-w-20"
            size="sm"
            loading={mutation.isPending}
          >
            Post
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );
}

export default PostEditor;
