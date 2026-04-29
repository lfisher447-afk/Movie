import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-shimmer skeleton-bg rounded-xl", className)} {...props} />
  );
}

export function MovieCardSkeleton() {
  return <Skeleton className="min-w-[160px] md:min-w-[240px] aspect-[2/3] rounded-2xl" />;
}
