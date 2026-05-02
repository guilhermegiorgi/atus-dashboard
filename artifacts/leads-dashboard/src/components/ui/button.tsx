"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-150 outline-none select-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/90 rounded-md px-4 py-2",
        outline:
          "border border-white/10 text-white hover:bg-white/5 hover:border-white/20 rounded-md",
        secondary:
          "bg-white/5 text-white hover:bg-white/10 border border-white/5 rounded-md",
        ghost: "text-white/60 hover:text-white hover:bg-white/5",
        destructive:
          "text-white/70 hover:text-white hover:bg-white/5 border border-white/10 rounded-md",
        link: "text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3.5",
        xs: "h-6 px-2 text-xs rounded",
        sm: "h-7 px-2.5 text-xs rounded-md",
        lg: "h-9 px-4 rounded-md",
        icon: "size-8 rounded-md",
        "icon-xs": "size-6 rounded",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
