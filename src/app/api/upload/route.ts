import { validateRequest } from "@/auth";
import {
  checkRateLimit,
  generateSafeStorageKey,
  MAX_FILES_PER_POST,
  uploadBufferToR2,
  validateUploadFile,
} from "@/lib/r2";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. IP & User rate limiting (Prevent DDoS / Flood attacks)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown-ip";

    const userRate = checkRateLimit(`user:${user.id}`, 20, 60 * 1000);
    const ipRate = checkRateLimit(`ip:${ip}`, 40, 60 * 1000);

    if (!userRate.allowed || !ipRate.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many upload requests. Please slow down and try again in a minute.",
        },
        { status: 429 },
      );
    }

    // 3. Payload length check (Reject oversized bodies before buffering)
    const contentLength = Number(req.headers.get("content-length") || "0");
    const maxTotalPayload = 65 * 1024 * 1024; // 65MB max payload
    if (contentLength > maxTotalPayload) {
      return NextResponse.json(
        { error: "Payload too large. Total upload exceeds 65MB limit." },
        { status: 413 },
      );
    }

    // 4. Parse FormData
    const formData = await req.formData();
    const folder =
      formData.get("folder") === "avatars" ? "avatars" : "posts";

    const rawFiles = formData.getAll("files");
    const singleFile = formData.get("file");

    const files: File[] = [];
    if (rawFiles.length > 0) {
      for (const item of rawFiles) {
        if (item instanceof File) files.push(item);
      }
    } else if (singleFile instanceof File) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided." },
        { status: 400 },
      );
    }

    if (files.length > MAX_FILES_PER_POST) {
      return NextResponse.json(
        { error: `You can upload at most ${MAX_FILES_PER_POST} files at once.` },
        { status: 400 },
      );
    }

    // 5. Validate all files before uploading
    for (const file of files) {
      const validation = validateUploadFile({
        name: file.name,
        type: file.type,
        size: file.size,
      });

      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // 6. Upload files to Cloudflare R2
    const uploadedFiles: {
      name: string;
      url: string;
      type: "IMAGE" | "VIDEO";
    }[] = [];

    for (const file of files) {
      let buffer: Buffer = Buffer.from(await file.arrayBuffer());
      let contentType = file.type;
      let keyMime = file.type;

      // Downscale + re-encode images so feed images stay light. 7MB+ originals
      // make Next's image optimizer time out (504) and render broken.
      const isOptimizableImage =
        file.type.startsWith("image/") && file.type !== "image/gif";
      if (isOptimizableImage) {
        try {
          const maxWidth = folder === "avatars" ? 512 : 1600;
          buffer = await sharp(buffer)
            .rotate() // honour EXIF orientation
            .resize({
              width: maxWidth,
              height: maxWidth,
              fit: "inside",
              withoutEnlargement: true,
            })
            .webp({ quality: 82 })
            .toBuffer();
          contentType = "image/webp";
          keyMime = "image/webp";
        } catch (error) {
          console.error(
            "[Upload API] Image optimization failed, using original:",
            error,
          );
        }
      }

      const safeKey = generateSafeStorageKey(user.id, folder, keyMime);
      const publicUrl = await uploadBufferToR2(buffer, safeKey, contentType);

      uploadedFiles.push({
        name: file.name,
        url: publicUrl,
        type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      file: uploadedFiles[0], // for single upload compatibility
    });
  } catch (error) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 },
    );
  }
}
