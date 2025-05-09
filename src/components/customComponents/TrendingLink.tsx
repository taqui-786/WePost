'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // if you're using classnames util

interface TrendingLinkProps {
  title: string;
  hashtag: string;
  count: number;
}

export default function TrendingLink({ title, hashtag, count }: TrendingLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === `/hashtag/${title}`;

  return (
    <Link href={`/hashtag/${title}`} className="block">
      <p
        className={cn(
          'line-clamp-1 text-card-foreground break-all hover:underline',
          isActive && 'text-primary'
        )}
        title={hashtag}
      >
        {hashtag}
      </p>
      <p className="text-muted-foreground text-sm">
        {count.toLocaleString()} {count === 1 ? 'post' : 'posts'}
      </p>
    </Link>
  );
}
