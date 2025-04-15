
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowDown, ArrowUp, Package, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'in' | 'out';
  product: string;
  quantity: number;
  date: string;
  user: string;
}

// Placeholder recent activity data
const recentActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'in',
    product: 'Intel Core i9-14900K',
    quantity: 5,
    date: '2025-04-15T09:30:00',
    user: 'John'
  },
  {
    id: '2',
    type: 'out',
    product: 'NVIDIA GeForce RTX 4080',
    quantity: 2,
    date: '2025-04-14T16:45:00',
    user: 'Sarah'
  },
  {
    id: '3',
    type: 'in',
    product: 'Samsung 990 PRO SSD 2TB',
    quantity: 10,
    date: '2025-04-14T11:20:00',
    user: 'Mike'
  },
  {
    id: '4',
    type: 'out',
    product: 'MSI MAG Z590',
    quantity: 1,
    date: '2025-04-13T14:15:00',
    user: 'John'
  },
  {
    id: '5',
    type: 'out',
    product: 'Corsair Vengeance RGB Pro 32GB',
    quantity: 3,
    date: '2025-04-13T10:05:00',
    user: 'Sarah'
  }
];

const RecentActivityPanel = () => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredActivity = activeTab === 'all' 
    ? recentActivity
    : recentActivity.filter(item => item.type === activeTab);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="in">Stock In</TabsTrigger>
            <TabsTrigger value="out">Stock Out</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredActivity.length > 0 ? (
            filteredActivity.map(item => (
              <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  item.type === 'in' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-amber-500/10 text-amber-500'
                )}>
                  {item.type === 'in' ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {item.product}
                    </p>
                    <Badge variant={item.type === 'in' ? 'outline' : 'secondary'} className={cn(
                      "ml-2",
                      item.type === 'in' 
                        ? 'border-green-500 text-green-500'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    )}>
                      {item.type === 'in' ? '+' : '-'}{item.quantity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.date)} • by {item.user}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No recent activity found
              </p>
            </div>
          )}
        </div>

        <Button variant="ghost" className="w-full mt-2 text-muted-foreground text-sm">
          View All Activity <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentActivityPanel;
