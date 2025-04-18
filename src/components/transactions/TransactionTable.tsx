
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import TransactionTableHeader from './TransactionTableHeader';
import TransactionActions from './TransactionActions';
import { formatDate, getTransactionBadgeColor, getTransactionIcon } from './utils/transactionUtils';
import { Transaction } from '@/services/api';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  filteredTransactions: Transaction[];
  handleEditTransaction: (transaction: Transaction) => void;
  deleteMutation: any;
}

const TransactionTable = ({
  transactions,
  isLoading,
  isError,
  error,
  filteredTransactions,
  handleEditTransaction,
  deleteMutation
}: TransactionTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const itemsPerPage = 10;
  const offset = currentPage * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(offset, offset + itemsPerPage);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = [...paginatedTransactions].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key as keyof Transaction];
      const bValue = b[sortConfig.key as keyof Transaction];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TransactionTableHeader sortConfig={sortConfig} onSort={handleSort} />
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                Loading transactions...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-red-500">
                Error loading transactions: {error instanceof Error ? error.message : 'Unknown error'}
              </TableCell>
            </TableRow>
          ) : filteredTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.productName}</div>
                  <div className="text-sm text-muted-foreground">{transaction.productSku}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("flex items-center w-fit", getTransactionBadgeColor(transaction.transactionType))}>
                    {getTransactionIcon(transaction.transactionType)}
                    {transaction.transactionType}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell className="hidden md:table-cell">{transaction.reference}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(transaction.transactionDate)}</TableCell>
                <TableCell className="hidden md:table-cell">{transaction.createdBy}</TableCell>
                <TableCell className="text-right">
                  <TransactionActions
                    transaction={transaction}
                    onEdit={handleEditTransaction}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Pagination className="mt-2 pb-4">
        <PaginationPrevious
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
        />
        <PaginationContent>
          {Array.from({ length: Math.ceil(filteredTransactions.length / itemsPerPage) }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                isActive={index === currentPage}
                onClick={() => setCurrentPage(index)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
        <PaginationNext
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(filteredTransactions.length / itemsPerPage) - 1)
            )
          }
        />
      </Pagination>
    </div>
  );
};

export default TransactionTable;
