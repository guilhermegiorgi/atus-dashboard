import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full rounded-md border border-dd-border bg-dd-primary px-3 py-1 text-sm text-dd-on-primary shadow-sm transition-colors placeholder:text-dd-on-muted focus:border-dd-border focus:outline-none focus:ring-1 focus:ring-dd-on-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
