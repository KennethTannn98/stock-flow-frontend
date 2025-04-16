import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowDown, ArrowUp, Package, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction, getTodaysTransactions } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

const RecentActivityPanel = () => {
  const [activeTab, setActiveTab] = useState('all');

  const { data: todaysTransactions, isLoading, isError } = useQuery({
    queryKey: ['todaysTransactions'],
    queryFn: getTodaysTransactions,
  });

  const filteredActivity = todaysTransactions 
    ? (activeTab === 'all' 
      ? todaysTransactions
      : todaysTransactions.filter(item => 
          activeTab === 'in' ? item.transactionType === 'IN' : item.transactionType === 'OUT'))
        .slice(0, 5)
    : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric'
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading today's activity...
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm text-red-500">
                Error loading activity data
              </p>
            </div>
          ) : filteredActivity.length > 0 ? (
            filteredActivity.map(item => (
              <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  item.transactionType === 'IN' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-amber-500/10 text-amber-500'
                )}>
                  {item.transactionType === 'IN' ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {item.productName}
                    </p>
                    <Badge variant={item.transactionType === 'IN' ? 'outline' : 'secondary'} className={cn(
                      "ml-2",
                      item.transactionType === 'IN' 
                        ? 'border-green-500 text-green-500'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    )}>
                      {item.transactionType === 'IN' ? '+' : '-'}{item.quantity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.transactionDate)} • by {item.createdBy}
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
      </CardContent>
    </Card>
  );
};

export default RecentActivityPanel;
