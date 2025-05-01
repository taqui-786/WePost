"use client";

import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export function PostShareButton({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);

  const copyToClipboard = () => {
    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${postId}`;
    navigator.clipboard.writeText(link).then(() => {
      setTimeout(() => setOpen(false), 1000);
      toast.success("Link copied to clipboard");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex">
          <Share2 className="mr-2 size-5" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share post link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={`${process.env.NEXT_PUBLIC_BASE_URL}/posts/${postId}`}
              readOnly
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={copyToClipboard}
          >
            <span className="sr-only">Copy</span>
            <Copy />
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
