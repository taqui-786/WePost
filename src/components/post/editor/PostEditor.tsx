"use client";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { submitPost } from "./action";
import { Button } from "@/components/ui/button";
import "./style.css"
function PostEditor() {
  const editor = useEditor({
    immediatelyRender:false,
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
        await submitPost(input);
        editor?.commands.clearContent();
    }


  return <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm ">
    <div className="flex ">
        <EditorContent editor={editor}  className="w-full max-h-[20rem] overflow-y-auto bg-gray-100 rounded-2xl px-5 py-3" />

    </div>
    <div className="flex justify-end"> <Button onClick={onSubmit} disabled={!input.trim()} className="min-w-20">Post</Button></div>
  </div>;
}

export default PostEditor;
