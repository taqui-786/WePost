'use client'
import { useLikeInfo } from "@/hooks/useLikeInfo";
import { LikeInfoType } from "@/lib/types";
import { Heart } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useOptimisticLike } from "@/hooks/useOptimisticLike";

interface LikeButtonProps {
    postId: string;
    initialState: LikeInfoType;
}

function LikeButton({ initialState, postId }: LikeButtonProps) {
    const { data } = useLikeInfo(postId, initialState);
    const { mutate, isPending } = useOptimisticLike(postId);
    const liked = data.isLikedByUser;

    return (
        <button
            onClick={() => mutate(liked ? "unlike" : "like")}
            disabled={isPending}
            aria-label={liked ? "Unlike post" : "Like post"}
            aria-pressed={liked}
            className={cn(
                "group flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-80",
                liked
                  ? "text-rose-500 hover:bg-rose-500/10"
                  : "text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
            )}
        >
            <span className="relative flex size-5 items-center justify-center">
                <AnimatePresence mode="popLayout">
                    {liked && (
                        <motion.span
                            key="burst"
                            aria-hidden
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute inline-flex size-4 rounded-full bg-rose-500/40"
                        />
                    )}
                </AnimatePresence>
                <motion.span
                    whileTap={{ scale: 0.6 }}
                    animate={{ scale: liked ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="relative"
                >
                    <Heart
                        className={cn(
                            "size-5 transition-colors duration-150",
                            liked && "fill-rose-500 text-rose-500"
                        )}
                    />
                </motion.span>
            </span>
            <NumberFlow
                value={data.likes}
                format={{ notation: "compact" }}
                className="text-sm font-medium tabular-nums leading-none"
            />
            <span className="hidden sm:inline text-[13px] font-medium leading-none">likes</span>
        </button>
    );
}
export default LikeButton
