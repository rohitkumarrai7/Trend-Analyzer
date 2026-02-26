import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, ...props }, ref) => {
        return (
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))]">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))]',
                        'hover:border-[hsla(var(--primary),0.5)]',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        icon && 'pl-10',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = 'Input';

const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'icon'>>(
    ({ className, ...props }, ref) => {
        return (
            <Input
                ref={ref}
                icon={<Search className="h-4 w-4" />}
                className={className}
                {...props}
            />
        );
    }
);
SearchInput.displayName = 'SearchInput';

export { Input, SearchInput };
