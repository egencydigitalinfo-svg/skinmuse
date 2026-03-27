// ProductCardSkeleton.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full bg-background text-foreground border-none rounded-2xl animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-foreground/10 rounded-t-2xl relative" />

      {/* Content */}
      <CardContent className="p-4 sm:p-5 flex flex-col flex-grow space-y-3">
        <div className="h-4 bg-foreground/10 rounded w-1/3" /> {/* Brand */}
        <div className="h-5 bg-foreground/10 rounded w-3/4" /> {/* Name */}
        <div className="h-3 bg-foreground/10 rounded w-full" /> {/* Desc line 1 */}
        <div className="h-3 bg-foreground/10 rounded w-5/6" /> {/* Desc line 2 */}
        <div className="h-4 bg-foreground/10 rounded w-1/2 mt-3" /> {/* Price */}
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 sm:p-5 pt-0 mt-auto">
        <div className="h-9 sm:h-10 bg-foreground/10 rounded-md w-full" />
      </CardFooter>
    </Card>
  );
}
