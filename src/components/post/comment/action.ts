"use server"

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment({ post, content }: { post: PostData, content: string }) {
    const { user } = await validateRequest()
    if (!user) throw new Error("Unauthorized")
    const { content: contentValidated } = createCommentSchema.parse({ content })
    const [newComment] = await prisma.$transaction([
        prisma.comment.create({
            data: {
                content: contentValidated,
                postId: post.id,
                userId: user.id
            },
            include: getCommentDataInclude(user.id)
        }),
        ...(post.user.id !== user.id ? [
            prisma.notification.create({
                data: {
                    issuerId: user.id,
                    recipientId: post.user.id,
                    postId: post.id,
                    type: "COMMENT"
                }
            })
        ] : [])
    ])

    return newComment;
}


export async function deleteComment(commentId: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error("Unauthorized")
    const comment = await prisma.comment.findUnique({
        where: { id: commentId }
    });
    if (!comment) throw new Error("Comment Not Found.")
    if (comment.userId !== user.id) throw new Error("Unauthorized")
    const deletedComment = await prisma.comment.delete({
        where: { id: commentId },
        include: getCommentDataInclude(user.id)

    })
    return deletedComment;
}

export async function notificationInitialState() {
    const { user } = await validateRequest()
    if (!user) throw new Error("Unauthorized")
    const unreadNotifications = await prisma.notification.count({
        where: {
            recipientId: user.id,
            read: false
        }
    })
    return unreadNotifications
}