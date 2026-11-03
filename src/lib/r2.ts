import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";

// Max constraints
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_POST = 5;

// Whitelist allowed MIME types
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

// Singleton S3 / R2 Client
let r2Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!r2Client) {
    const accountId = process.env.R2_ACCOUNT_ID?.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error("Missing Cloudflare R2 environment variables");
    }

    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return r2Client;
}

export function getR2BucketName(): string {
  return process.env.R2_BUCKET_NAME?.trim() || "wepost";
}

export function getR2PublicUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_URL?.trim() || "").replace(/\/$/, "");
  const cleanKey = key.replace(/^\//, "");
  return `${base}/${cleanKey}`;
}

export function generateSafeStorageKey(
  userId: string,
  folder: "posts" | "avatars" = "posts",
  mimeType: string,
): string {
  const ext = ALLOWED_MIME_TYPES[mimeType] || "bin";
  const uniqueId = crypto.randomUUID();
  const timestamp = Date.now();
  return `uploads/${folder}/${userId}/${timestamp}-${uniqueId}.${ext}`;
}

// In-memory sliding window rate limiter
// ponytail: in-memory map; upgrade to Redis/Upstash if horizontal scaling multi-server
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 1000,
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean old entries periodically (lazy GC when map size grows)
  if (rateLimitMap.size > 2000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, entry.resetAt - now),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetInMs: Math.max(0, entry.resetAt - now),
  };
}

export function validateUploadFile(
  file: { name: string; type: string; size: number },
): { valid: boolean; error?: string } {
  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV.`,
    };
  }

  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    const sizeInMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File ${file.name} is too large. Max limit for ${isVideo ? "videos" : "images"} is ${sizeInMb}MB.`,
    };
  }

  return { valid: true };
}

export async function uploadBufferToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return getR2PublicUrl(key);
}

export async function deleteObjectFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

