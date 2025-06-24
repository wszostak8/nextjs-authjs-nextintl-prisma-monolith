import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: "border-input bg-transparent !py-6 rounded-xl",
                destructive: "border-destructive text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
                ghost: "border-transparent bg-transparent hover:border-input focus-visible:border-ring",
                filled: "bg-muted border-transparent focus-visible:bg-background",
            },
            inputSize: {
                default: "h-9 px-3 py-1 text-base md:text-sm",
                sm: "h-8 px-2.5 py-1 text-sm",
                lg: "h-11 px-4 py-2 text-base",
            },
            file: {
                default: "file:h-7 file:text-sm",
                sm: "file:h-6 file:text-xs",
                lg: "file:h-8 file:text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            inputSize: "default",
            file: "default",
        },
    }
)

function Input({
                   className,
                   type,
                   variant,
                   inputSize,
                   file,
                   ...props
               }: React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(inputVariants({ variant, inputSize, file, className }))}
            {...props}
        />
    )
}

export { Input, inputVariants }