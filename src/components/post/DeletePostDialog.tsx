"use client";
import { PostData } from "@/lib/types";
import React from "react";
import { useDeletePostMutation } from "./mutation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,

  } from "@/components/ui/dialog"
import { Button } from "../ui/button";
import LoadingButton from "../ui/LoadingButton";
  
function DeletePostDialog({
  post,
  open,
  onClose,
}: {
  post: PostData;
  open: boolean;
  onClose: () => void;
}) {
    const mutation = useDeletePostMutation()
const handleOpenChange = (open:boolean) => {
    if(!open || !mutation.isPending){
        onClose()
    }
}
  return <Dialog open={open} onOpenChange={handleOpenChange} >
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Post ?</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this post? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
        <LoadingButton onClick={() => mutation.mutate(post.id,{onSuccess: onClose})} loading={mutation.isPending}>Delete</LoadingButton>
        <Button variant="outline" onClick={onClose} >Cancel</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
;
}

export default DeletePostDialog;
