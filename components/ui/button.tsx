import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
                secondary:
                    'bg-[hsl(var(--surface-light))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-lighter))] border border-[hsl(var(--border))]',
                outline:
                    'border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--surface))] text-[hsl(var(--foreground))]',
                ghost:
                    'hover:bg-[hsl(var(--surface))] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
                accent:
                    'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600 shadow-lg shadow-cyan-500/25',
                danger:
                    'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-12 rounded-xl px-8 text-base',
                xl: 'h-14 rounded-xl px-10 text-lg',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
