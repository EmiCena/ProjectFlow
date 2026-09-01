import * as React from "react"
import { cn } from "@/lib/utils"
type Variant = 'default'|'outline'|'ghost'|'destructive'
type Size = 'sm'|'default'|'lg'|'icon'
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant, size?: Size, loading?: boolean }>(
  ({ className, variant='default', size='default', loading, children, disabled, ...props }, ref) => {
    const variants: Record<Variant,string> = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm focus-visible:ring-2 focus-visible:ring-ring",
      outline: "border border-border bg-card dark:bg-slate-900 hover:bg-muted dark:hover:bg-slate-800 text-foreground",
      ghost: "hover:bg-muted text-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    }
    const sizes: Record<Size,string> = {
      sm: "h-8 px-3 text-xs min-h-[32px]",
      default: "h-9 px-4 py-2 text-sm min-h-[36px] min-w-[44px]",
      lg: "h-10 px-6 text-sm min-h-[44px]",
      icon: "h-9 w-9 min-h-[44px] min-w-[44px]"
    }
    return (
      <button
        ref={ref}
        className={cn("inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 ease-out cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none", variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
        {children}
      </button>
    )
  }
)
Button.displayName="Button"
