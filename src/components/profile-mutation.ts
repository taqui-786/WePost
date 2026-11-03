"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  generateSafeStorageKey,
  uploadBufferToR2,
  validateUploadFile,
} from "@/lib/r2";

export async function handleAvatarUpdate(
  file: File,
  userId: string | undefined,
) {
  try {
    const { user } = await validateRequest();
    if (!user || (userId && user.id !== userId)) {
      return false;
    }

    const targetUserId = userId || user.id;

    const validation = validateUploadFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      console.warn("[Avatar Upload Invalid]:", validation.error);
      return false;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeKey = generateSafeStorageKey(targetUserId, "avatars", file.type);
    const publicUrl = await uploadBufferToR2(buffer, safeKey, file.type);

    await prisma.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        avatarUrl: publicUrl,
      },
    });

    return true;
  } catch (error) {
    console.error("Avatar update error:", error);
    return false;
  }
}
