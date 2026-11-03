"use server"

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";
import { publishToUser } from "@/lib/realtime";

export async function submitComment({ post, content }: { post: PostData, content: string }) {
    const { user } = await validateRequest()
    if (!user) throw new Error("Unauthorized")
    const { content: contentValidated } = createCommentSchema.parse({ content })
    const shouldNotify = post.user.id !== user.id

    const [newComment] = await prisma.$transaction(async (tx) => {
        const comment = await tx.comment.create({
            data: {
                content: contentValidated,
                postId: post.id,
                userId: user.id
            },
            include: getCommentDataInclude(user.id)
        })
        await tx.post.update({
            where: { id: post.id },
            data: { commentCount: { increment: 1 } },
        })
        if (shouldNotify) {
            await tx.notification.create({
                data: {
                    issuerId: user.id,
                    recipientId: post.user.id,
                    postId: post.id,
                    type: "COMMENT"
                }
            })
        }
        return [comment]
    })

    if (shouldNotify) {
        await publishToUser(post.user.id, {
            type: "notification",
            payload: { type: "COMMENT", postId: post.id },
        });
    }

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
    const [deletedComment] = await prisma.$transaction(async (tx) => {
        const result = await tx.comment.delete({
            where: { id: commentId },
            include: getCommentDataInclude(user.id)
        })
        await tx.post.update({
            where: { id: comment.postId },
            data: { commentCount: { decrement: 1 } },
        })
        return [result]
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