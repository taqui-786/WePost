"use client";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "./style.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/ui/LoadingButton";
import { Card, CardContent } from "@/components/ui/card";
function PostEditor() {
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
    mutation.mutate(input, {
      onSuccess: () => {
        editor?.commands.clearContent();
      },
    });
  }

  return (
    <Card>
      <CardContent>
        <div className="flex">
          <EditorContent
            editor={editor}
            className="max-h-[20rem] w-full overflow-y-auto rounded-xl bg-background px-5 py-3"
          />
        </div>
        <div className="flex justify-end">
          {" "}
          <LoadingButton
            onClick={onSubmit}
            disabled={!input.trim() || mutation.isPending}
            className="min-w-20 mt-4"
            size='sm'
            loading={mutation.isPending}
          >
            Post
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
    // <div className="bg-card flex flex-col gap-5 rounded-2xl p-5 shadow-sm">
    // <div className="flex">
    //   <EditorContent
    //     editor={editor}
    //     className="max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-gray-100 px-5 py-3"
    //   />
    // </div>
    // <div className="flex justify-end">
    //   {" "}
    //   <LoadingButton
    //     onClick={onSubmit}
    //     disabled={!input.trim() || mutation.isPending}
    //     className="min-w-20"
    //     loading={mutation.isPending}
    //   >
    //     Post
    //   </LoadingButton>
    // </div>
    // </div>
  );
}

export default PostEditor;
