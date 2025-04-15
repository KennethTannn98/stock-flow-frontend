
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
}

const StatCard = ({ title, value, description, icon: Icon, trend, className }: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={trend.positive ? "text-green-500" : "text-red-500"}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">from last month</span>
              </div>
            )}
          </div>
          <div className="bg-primary/10 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
