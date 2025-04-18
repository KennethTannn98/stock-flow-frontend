import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  variant = 'default' 
}: StatCardProps) => {
  // Color variants based on the theme
  const variantStyles = {
    default: {
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      trendPositive: 'text-green-500',
      trendNegative: 'text-red-500'
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-green-600'
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trendPositive: 'text-green-500',
      trendNegative: 'text-red-500'
    },
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      trendPositive: 'text-green-500',
      trendNegative: 'text-red-600'
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trendPositive: 'text-green-500',
      trendNegative: 'text-red-500'
    }
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn("overflow-hidden shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={trend.positive ? styles.trendPositive : styles.trendNegative}>
                  {trend.positive ? '↑ ' : '↓ '}{Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">from last month</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", styles.iconBg)}>
            <Icon className={cn("h-6 w-6", styles.iconColor)} strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;