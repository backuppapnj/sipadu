import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    className?: string;
    iconClassName?: string;
}

/**
 * Kartu statistik untuk dashboard.
 */
export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    className,
    iconClassName,
}: StatsCardProps) {
    return (
        <Card className={cn('', className)}>
            <CardContent className="flex items-center gap-4">
                <div className={cn('rounded-lg bg-primary/10 p-3', iconClassName)}>
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
