import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, ArrowDown, ArrowUp, Sliders, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';

const TransactionTable = ({ transactions, isLoading, isError, error, filteredTransactions, handleEditTransaction, deleteMutation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const itemsPerPage = 10;
  const offset = currentPage * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(offset, offset + itemsPerPage);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (err) {
      return dateString;
    }
  };

  const getTransactionBadgeColor = (type) => {
    switch (type) {
      case 'IN':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'OUT':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'ADJUSTMENT':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return '';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'IN':
        return <ArrowDown className="h-4 w-4 mr-1" />;
      case 'OUT':
        return <ArrowUp className="h-4 w-4 mr-1" />;
      case 'ADJUSTMENT':
        return <Sliders className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const sortedTransactions = [...paginatedTransactions].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              onClick={() => handleSort('productName')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Product {getSortIcon('productName')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('transactionType')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Type {getSortIcon('transactionType')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('quantity')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Quantity {getSortIcon('quantity')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('reference')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Reference {getSortIcon('reference')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('transactionDate')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Transaction Date {getSortIcon('transactionDate')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('createdBy')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Created By {getSortIcon('createdBy')}
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
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
                <TableCell>
                  {transaction.quantity}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {transaction.reference}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(transaction.transactionDate)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {transaction.createdBy}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
                            deleteMutation.mutate(transaction.id);
                          }
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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