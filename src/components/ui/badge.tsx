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
        default:
          "bg-dd-surface-overlay text-dd-on-surface px-2 py-0.5 rounded-full",
        secondary:
          "bg-dd-surface-raised text-dd-on-muted px-2 py-0.5 rounded-full",
        destructive:
          "bg-dd-accent-red/10 text-dd-accent-red px-2 py-0.5 rounded-full",
        outline:
          "text-dd-on-muted border border-dd-border px-2 py-0.5 rounded-full",
        ghost: "text-dd-on-muted",
        new: "bg-dd-accent-green/15 text-dd-accent-green px-2 py-0.5 rounded-full",
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
