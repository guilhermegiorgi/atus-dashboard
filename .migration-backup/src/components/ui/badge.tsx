"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-white/80 px-2 py-0.5 rounded-full",
        secondary: "bg-white/5 text-white/50 px-2 py-0.5 rounded-full",
        destructive: "bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full",
        outline:
          "text-white/40 border border-white/10 px-2 py-0.5 rounded-full",
        ghost: "text-white/40",
        new: "bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
