import * as React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.ComponentProps<'textarea'> {
    /** Tampilkan penghitung karakter */
    showCount?: boolean;
    /** Batas karakter untuk penghitung */
    maxCharacters?: number;
}

function Textarea({
    className,
    showCount = false,
    maxCharacters,
    ...props
}: TextareaProps) {
    const [count, setCount] = React.useState(
        typeof props.value === 'string' ? props.value.length : 0,
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCount(e.target.value.length);
        props.onChange?.(e);
    };

    return (
        <div className="relative">
            <textarea
                data-slot="textarea"
                className={cn(
                    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                {...props}
                onChange={handleChange}
            />
            {showCount && (
                <div
                    className={cn(
                        'mt-1 text-right text-xs',
                        maxCharacters && count > maxCharacters
                            ? 'text-red-500'
                            : 'text-muted-foreground',
                    )}
                    aria-live="polite"
                >
                    {count}
                    {maxCharacters ? ` / ${maxCharacters}` : ''} karakter
                </div>
            )}
        </div>
    );
}

export { Textarea };
