"use server";

import { handleFirebaseImageUpload } from "@/lib/Firebase";
import prisma from "@/lib/prisma";

export async function handleAvatarUpdate(
  file: File,
  userId: string | undefined,
) {
  try {
    const uploading = await handleFirebaseImageUpload(file);
    if (uploading.success === true) {
        await prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              avatarUrl: uploading.file.url,
            },
          });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
}
