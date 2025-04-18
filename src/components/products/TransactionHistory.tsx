
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  History,
  AlertCircle,
  PlusCircle,
  ArrowDown,
  ArrowUp,
  ArrowDownUp,
  Loader2,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaction } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  productId: number;
}

export const TransactionHistory = ({ transactions, isLoading, error, productId }: TransactionHistoryProps) => {
  const queryClient = useQueryClient();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'OUT':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'ADJUSTMENT':
        return <ArrowDownUp className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'IN':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">IN</Badge>;
      case 'OUT':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0">OUT</Badge>;
      case 'ADJUSTMENT':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">ADJ</Badge>;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-muted-foreground">Error loading transactions</p>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['products', productId, 'transactions'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <History className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No transactions found for this product</p>
        <Link to="/transactions">
          <Button variant="outline" size="sm" className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Transaction
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction: Transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {formatDate(transaction.transactionDate)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTransactionTypeIcon(transaction.transactionType)}
                  {getTransactionTypeBadge(transaction.transactionType)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {transaction.quantity}
              </TableCell>
              <TableCell>
                {transaction.reference || '-'}
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                {transaction.createdBy}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CardFooter className="pt-4 border-t bg-muted/50">
        <Button variant="outline" size="sm" asChild>
          <Link to="/transactions">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Transaction
          </Link>
        </Button>
      </CardFooter>
    </div>
  );
};
