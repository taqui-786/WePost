"use client";
import { commentData } from "@/lib/types";
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,

  } from "@/components/ui/dialog"
import LoadingButton from "@/components/ui/LoadingButton";
import { Button } from "@/components/ui/button";
import { useDeleteCommentMutation } from "./mutation";

  
function DeleteCommentDialog({
  comment,
  open,
  onClose,
}: {
  comment: commentData;
  open: boolean;
  onClose: () => void;
}) {
    const mutation = useDeleteCommentMutation()
const handleOpenChange = (open:boolean) => {
    if(!open || !mutation.isPending){
        onClose()
    }
}
  return <Dialog open={open} onOpenChange={handleOpenChange} >
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Comment ?</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this comment? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
        <LoadingButton onClick={() => mutation.mutate(comment.id,{onSuccess: onClose})} loading={mutation.isPending}>Delete</LoadingButton>
        <Button variant="outline" onClick={onClose} >Cancel</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
;
}

export default DeleteCommentDialog;
