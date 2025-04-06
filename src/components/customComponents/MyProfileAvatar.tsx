"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { handleAvatarUpdate } from "../profile-mutation";

interface MyProfileAvatarProps {
  userAvatarUrl: string | null;
  userName: string | null;
  className?: string;
  size?: number;
  userId?: string;
}

function MyProfileAvatar({
  userName,
  userAvatarUrl,
  className,
  userId,
  size = 48,
}: MyProfileAvatarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    const underscoreIndex = name.indexOf("_");
    const hyphenIndex = name.indexOf("-");

    const theIndex =
      underscoreIndex !== -1 && hyphenIndex !== -1
        ? Math.min(underscoreIndex, hyphenIndex)
        : Math.max(underscoreIndex, hyphenIndex);

    const result =
      theIndex !== -1
        ? name.charAt(0) + name.charAt(theIndex + 1)
        : name.charAt(0) + name.charAt(name.length - 1);

    return result.toUpperCase();
  };

  const handleFileChange = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (objectUrl) {
      try {
        setIsUploading(true);
       const res =  await handleAvatarUpdate(file, userId);
       if (res) return toast.success("Avatar updated Successfully")
        return toast.error("Failed to update Avatar")
      } catch (error) {
        console.error("Error uploading file:", error);
        setPreviewUrl(userAvatarUrl);
        toast.error("Internal Server Error")
      } finally {
        setIsUploading(false);
        setIsDialogOpen(false);
      }
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      <div className="group relative">
        <Avatar
          className={cn(
            `h-${size / 4} w-${size / 4}`,
            `h-[${size}px] w-[${size}px]`,
            "transition-all duration-200 ease-in-out",
            className,
          )}
        >
          {previewUrl ? (
            <AvatarImage
              src={previewUrl}
              width={size}
              height={size}
              className="aspect-square object-cover"
              alt={userName || "User avatar"}
            />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary aspect-square flex-none">
              {userName ? getInitials(userName) : "U"}
            </AvatarFallback>
          )}
           {/* Upload overlay with plus icon */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="absolute size-fit m-auto inset-0 flex items-center justify-center rounded-full bg-black/40  transition-opacity duration-200 "
          aria-label="Change profile picture"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </button>
        </Avatar>

       
      </div>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change profile picture</DialogTitle>
          </DialogHeader>

          <div
            className={cn(
              "mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
                <p className="text-muted-foreground text-sm">
                  Updating Your Avatar...
                </p>
              </div>
            ) : (
              <>
                <Upload className="text-muted-foreground mb-4 h-10 w-10" />
                <p className="mb-2 text-center text-sm">
                  <span className="font-medium">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-muted-foreground mb-4 text-center text-xs">
                  PNG, JPG or GIF (max. 2MB)
                </p>
                <input
                  ref={fileInputRef || userAvatarUrl}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Image
                </Button>
              </>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MyProfileAvatar;
