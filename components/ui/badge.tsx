import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-[hsl(var(--primary))] text-white',
                secondary: 'bg-[hsl(var(--surface-light))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]',
                outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
                emergency: 'bg-red-500/20 text-red-400 border border-red-500/30',
                politics: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                environment: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                entertainment: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
                sports: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
                technology: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                hate_speech: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
                other: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
