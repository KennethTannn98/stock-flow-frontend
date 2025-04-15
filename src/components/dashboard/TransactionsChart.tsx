
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MonthlyTransaction } from '@/services/api';

interface TransactionsChartProps {
  transactions: MonthlyTransaction[];
}

const TransactionsChart = ({ transactions }: TransactionsChartProps) => {
  const [formattedData, setFormattedData] = useState<any[]>([]);

  useEffect(() => {
    const formatted = transactions.map(item => ({
      ...item,
      month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      diff: item.inSum - item.outSum
    }));
    setFormattedData(formatted);
  }, [transactions]);

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle>Inventory Transactions</CardTitle>
        <CardDescription>
          Monthly overview of inventory flow (in vs out)
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'inSum') return [value, 'Stock In'];
                if (name === 'outSum') return [value, 'Stock Out'];
                return [value, name];
              }}
            />
            <Legend 
              formatter={(value) => {
                if (value === 'inSum') return 'Stock In';
                if (value === 'outSum') return 'Stock Out';
                return value;
              }}
            />
            <Bar dataKey="inSum" fill="#8884d8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outSum" fill="#82ca9d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TransactionsChart;
