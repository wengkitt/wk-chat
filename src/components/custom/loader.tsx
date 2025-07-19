import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
  className?: string;
}

const sizeMap: Record<NonNullable<LoaderProps["size"]>, string> = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export default function Loader({
  size = "xl",
  color = "text-primary/60",
  className,
}: LoaderProps) {
  return (
    <Loader2 className={cn("animate-spin", sizeMap[size], color, className)} />
  );
}
