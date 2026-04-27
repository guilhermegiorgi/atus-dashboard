import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full rounded-md border border-white/10 bg-black px-3 py-1 text-sm text-white shadow-sm transition-colors placeholder:text-white/25 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
