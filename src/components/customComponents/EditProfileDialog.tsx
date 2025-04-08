"use client";
import { BadgePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useRef, useState } from "react";
import { toast } from "sonner";
import kyInstance from "@/lib/ky";
import { handleFirebaseImageUpload } from "@/lib/Firebase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormSchema, UpdateProfileFormValues } from "@/lib/validation";

interface ProfileFormProps {
  defaultValues?: {
    userId: string;
    name: string;
    username: string;
    avatar: string | null;
    bio: string | null;
    location?: string;
    website?: string;
    twitter?: string;
    instagram?: string;
  };
}

export default function EditProfileDialog({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultValues!.avatar,
  );
  const [newImage, setNewImage] = useState<File | null>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue, getValues,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      displayName: defaultValues?.name || "",
      avatarUrl: defaultValues?.avatar || "",
      bio: defaultValues?.bio || "",
    },
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const objectUrl = URL.createObjectURL(e.target?.files?.[0] as File);
    setPreviewUrl(objectUrl);

    setNewImage(e.target?.files?.[0] as File);
  };
  const updateData = async () => {
    try {
      setIsLoading(true);
      if (newImage) {
        const getImageUrl = await handleFirebaseImageUpload(newImage as File);
        setValue("avatarUrl", getImageUrl.file.url);
      }
      const finalValues = getValues()
      const res = await kyInstance.put("/api/users/edit", {
        json: finalValues,
      });
      if (res.status === 200)
        return toast.success("Profile updated Successfully.");
      return toast.error("Failed to update Profile!");
    } catch (error) {
      console.log(error);
      toast.error("Internal Server Error!");
    } finally {
      router.refresh();
      setOpen(false)
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(updateData)}
          className="mx-auto w-full max-w-2xl space-y-8 rounded-xl bg-white/50 p-6 shadow-xs backdrop-blur-xs dark:border-zinc-800/80 dark:bg-zinc-950/50"
        >
          <div className="flex items-center justify-center gap-6">
            <Avatar className="h-24 w-24 rounded-full border-2 border-zinc-200/80 shadow-xs dark:border-zinc-800/80">
              <AvatarImage
                src={previewUrl || defaultValues?.avatar || ""}
                className="rounded-full object-cover"
              />
              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900">
                SC
              </AvatarFallback>
            </Avatar>
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-200/80 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800/80 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50">
              <Input
                className="absolute z-50 m-auto size-full cursor-pointer opacity-0"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                name="avatarUrl"
                onChange={handleInputChange}
              />
              <BadgePlus className="size-6 text-zinc-600 dark:text-zinc-400" />
            </div>
          </div>

          <p className="w-full text-center text-sm text-zinc-700 hover:cursor-pointer dark:text-zinc-300">
            Upload / Change your avatar
          </p>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-zinc-700 dark:text-zinc-300"
              >
                Display Name
              </Label>
              <Input
                id="displayName"
                placeholder="Your full name"
                autoComplete="off"
                {...register("displayName")}
              />
              {errors.displayName && (
                <p className="text-sm text-red-500">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* <div className="grid gap-2">
              <Label
                htmlFor="username"
                className="text-zinc-700 dark:text-zinc-300"
              >
                Username
              </Label>
              <Input
                id="username"
                placeholder="@username"
                autoComplete="off"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div> */}

            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-zinc-700 dark:text-zinc-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                rows={4}
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
