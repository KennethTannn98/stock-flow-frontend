
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, MoreVertical, Sliders } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Transaction } from '@/services/api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type SortField = 'productName' | 'productSku' | 'transactionType' | 'quantity' | 'reference' | 'transactionDate' | 'createdBy' | null;
type SortDirection = 'asc' | 'desc';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const ITEMS_PER_PAGE = 10;

export default function TransactionTable({ 
  transactions, 
  isLoading, 
  error, 
  onEdit, 
  onDelete 
}: TransactionTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortField) return 0;
    
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'productName':
        return a.productName.localeCompare(b.productName) * modifier;
      case 'productSku':
        return a.productSku.localeCompare(b.productSku) * modifier;
      case 'transactionType':
        return a.transactionType.localeCompare(b.transactionType) * modifier;
      case 'quantity':
        return (a.quantity - b.quantity) * modifier;
      case 'reference':
        return a.reference.localeCompare(b.reference) * modifier;
      case 'transactionDate':
        return (new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()) * modifier;
      case 'createdBy':
        return a.createdBy.localeCompare(b.createdBy) * modifier;
      default:
        return 0;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate middle pages
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          if (i <= totalPages) pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 3; i <= totalPages - 1; i++) {
          if (i > 1) pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
      }
      
      // Always include last page
      if (!pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }
    }
    
    // Add ellipsis indicators
    const result = [];
    for (let i = 0; i < pageNumbers.length; i++) {
      if (i > 0 && pageNumbers[i] - pageNumbers[i - 1] > 1) {
        result.push(-1); // -1 represents an ellipsis
      }
      result.push(pageNumbers[i]);
    }
    
    return result;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yy');
    } catch (err) {
      return dateString;
    }
  };

  // Get badge color based on transaction type
  const getTransactionBadgeColor = (type: string) => {
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

  // Get icon based on transaction type
  const getTransactionIcon = (type: string) => {
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('productName')}
              >
                <div className="flex items-center gap-1">
                  Product
                  {sortField === 'productName' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('transactionType')}
              >
                <div className="flex items-center gap-1">
                  Type
                  {sortField === 'transactionType' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center gap-1">
                  Quantity
                  {sortField === 'quantity' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="hidden md:table-cell cursor-pointer"
                onClick={() => handleSort('reference')}
              >
                <div className="flex items-center gap-1">
                  Reference
                  {sortField === 'reference' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="hidden md:table-cell cursor-pointer"
                onClick={() => handleSort('transactionDate')}
              >
                <div className="flex items-center gap-1">
                  Transaction Date
                  {sortField === 'transactionDate' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="hidden md:table-cell cursor-pointer"
                onClick={() => handleSort('createdBy')}
              >
                <div className="flex items-center gap-1">
                  Created By
                  {sortField === 'createdBy' && (
                    sortDirection === 'asc' ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  )}
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
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-red-500">
                  Error loading transactions: {error.message}
                </TableCell>
              </TableRow>
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
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
                        <DropdownMenuItem onClick={() => onEdit(transaction)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onDelete(transaction)}
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
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedTransactions.length)} of {sortedTransactions.length} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((pageNum, index) => (
                  <PaginationItem key={index}>
                    {pageNum === -1 ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}
