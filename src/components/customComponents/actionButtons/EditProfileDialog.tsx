"use client";
import {  Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import kyInstance from "@/lib/ky";
import { handleFirebaseImageUpload } from "@/lib/Firebase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileFormSchema, UpdateProfileFormValues } from "@/lib/validation";
import UserAvatar from "../UserAvatar";
import Cropper, {Area} from "react-easy-crop"
import { Slider } from "@/components/ui/slider";
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
  const [isEditing, setIsEditing] = useState(false)
 
  const [newImage, setNewImage] = useState<File | null>();
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
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
    
    const reader = new FileReader()

    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setIsEditing(true)
   
    }

    reader.readAsDataURL(e.target?.files?.[0] as File)
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
  const onCropComplete = useCallback((croppedArea:Area, croppedAreaPixels: Area) => {
    console.log(croppedArea);
    
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])
  const createCroppedImage = useCallback(async () => {
    try {
      if (!selectedImage || !croppedAreaPixels) return

      const image = new Image()
      image.src = selectedImage

      await new Promise((resolve) => {
        image.onload = resolve
      })

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Set canvas dimensions to the cropped size
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      )

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/jpeg")
      console.log({dataUrl});
      
      setCroppedImage(dataUrl)
      const dynamicFilename = `${defaultValues?.username ?? 'user'}-${Date.now()}.jpg`;

      const ConvertedImg = dataURLToFile(dataUrl,dynamicFilename)
      setNewImage(ConvertedImg)
      setIsEditing(false)
    
    } catch (error) {
      console.error("Error creating cropped image:", error)
    }
  }, [selectedImage, croppedAreaPixels])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        {
          !isEditing ? 
        <form
          onSubmit={handleSubmit(updateData)}
          
          className="mx-auto w-full max-w-2xl space-y-8 rounded-xl bg-white/50 p-6 shadow-xs backdrop-blur-xs dark:border-zinc-800/80 dark:bg-zinc-950/50"
        >
          <div className="flex items-center justify-center gap-6">
       
            <UserAvatar userAvatarUrl={croppedImage || defaultValues?.avatar || ""} userName={defaultValues?.username || ""} size={96} className="h-24 w-24 rounded-full border-2 border-zinc-200/80 shadow-xs dark:border-zinc-800/80" />
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-200/80 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800/80 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50">
              <Input
                className="absolute z-50 m-auto size-full cursor-pointer opacity-0"
                type="file"
                accept="image/*"
                disabled={isLoading}
                ref={fileInputRef}
                name="avatarUrl"
                onChange={handleInputChange}
              />
              <Camera className="size-6 text-zinc-600 dark:text-zinc-400" />
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
                disabled={isLoading}
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
                disabled={isLoading}
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
              disabled={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
        : <div className="mx-auto w-full max-w-2xl space-y-8 rounded-xl bg-white/50 p-6 shadow-xs backdrop-blur-xs dark:border-zinc-800/80 dark:bg-zinc-950/50">
            
          <div className="relative h-[300px] w-full">
            {isEditing && newImage && (
              <Cropper
                image={selectedImage as string}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            )}
          </div>

          <div className="grid gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom</label>
              <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(value) => setZoom(value[0])} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rotation</label>
              <Slider value={[rotation]} min={0} max={360} step={1} onValueChange={(value) => setRotation(value[0])} />
            </div>
          </div>
          <DialogFooter className="mt-4">
          
            <Button onClick={createCroppedImage}>Save</Button>
          </DialogFooter>
        </div>
      }
      </DialogContent>
    </Dialog>
  );
}


function dataURLToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}