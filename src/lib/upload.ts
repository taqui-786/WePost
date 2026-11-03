import { toast } from "sonner";
import { ALLOWED_MIME_TYPES, MAX_FILES_PER_POST, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "./r2";

export interface UploadedFile {
  name: string;
  type: string;
  url: string;
}

export interface UploadResult {
  success: boolean;
  error?: string;
  files?: UploadedFile[];
  file?: UploadedFile;
}

/**
 * Upload a single file to Cloudflare R2 via `/api/upload`.
 */
export async function handleR2ImageUpload(
  file: File,
  folder: "posts" | "avatars" = "avatars",
): Promise<{ success: boolean; file: { url: string }; error?: string }> {
  // Pre-validate client-side
  if (!ALLOWED_MIME_TYPES[file.type]) {
    toast.error("Unsupported file type. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM.");
    return { success: false, file: { url: "" }, error: "Unsupported file type" };
  }

  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const limitMb = Math.round(maxSize / (1024 * 1024));
    toast.error(`File is too large. Max limit is ${limitMb}MB.`);
    return { success: false, file: { url: "" }, error: "File too large" };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Upload failed");
      return { success: false, file: { url: "" }, error: data.error };
    }

    return {
      success: true,
      file: {
        url: data.file?.url || data.files?.[0]?.url || "",
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Upload failed. Please check your connection.");
    return { success: false, file: { url: "" }, error: "Network error" };
  }
}

/**
 * Upload multiple files to Cloudflare R2 with per-file progress tracking.
 */
export async function handleMultipleR2Uploads(
  files: File[],
  onProgress?: (index: number, progress: number) => void,
): Promise<UploadResult> {
  if (files.length > MAX_FILES_PER_POST) {
    toast.warning(`You can upload a maximum of ${MAX_FILES_PER_POST} files.`);
    return {
      success: false,
      error: `You can upload a maximum of ${MAX_FILES_PER_POST} files.`,
    };
  }

  // Pre-validate all files
  for (const file of files) {
    if (!ALLOWED_MIME_TYPES[file.type]) {
      toast.error(`Unsupported file type: ${file.name}`);
      return { success: false, error: `Unsupported file type: ${file.name}` };
    }
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const limitMb = Math.round(maxSize / (1024 * 1024));
      toast.error(`File ${file.name} exceeds ${limitMb}MB limit.`);
      return { success: false, error: `File exceeds limit` };
    }
  }

  const uploadPromises = files.map((file, index) => {
    return new Promise<UploadedFile>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "posts");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(index, progress);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && response.success) {
            const uploaded = response.file || response.files?.[0];
            resolve({
              name: file.name,
              url: uploaded.url,
              type: uploaded.type || (file.type.startsWith("video/") ? "VIDEO" : "IMAGE"),
            });
          } else {
            reject(new Error(response.error || `Upload failed with status ${xhr.status}`));
          }
        } catch (e) {
          reject(e);
        }
      };

      xhr.onerror = () => reject(new Error("Network error during file upload"));
      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  });

  // ponytail: no success toast here — the post composer shows per-file progress in the attachment tiles.
  try {
    const uploadedFiles = await Promise.all(uploadPromises);
    return {
      success: true,
      files: uploadedFiles,
    };
  } catch (error: unknown) {
    console.error("Batch upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload media";
    toast.error(message);
    return {
      success: false,
      error: message,
    };
  }
}
