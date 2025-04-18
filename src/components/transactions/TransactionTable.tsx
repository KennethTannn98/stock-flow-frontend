
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  // Icons below are passed as props via getTransactionIcon
  // ArrowDown,
  // ArrowUp,
  // Sliders,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
// format is passed as prop via formatDate
// import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Transaction } from '@/services/api'; // Import Transaction type

// Define the expected props interface
interface TransactionTableProps {
  transactions: Transaction[]; // Expects the pre-filtered list
  isLoading: boolean;
  isError: boolean;
  error?: Error; // Make error optional
  onEdit: (transaction: Transaction) => void; // Expects the edit handler function
  onDelete: (id: number) => void; // Expects the delete handler function
  // Expect helper functions as props
  formatDate: (dateString: string) => string;
  getTransactionBadgeColor: (type: string) => string;
  getTransactionIcon: (type: string) => React.ReactNode;
}

// Define the type for sort configuration
interface SortConfig {
    key: keyof Transaction | null; // Key must be a valid key of Transaction
    direction: 'asc' | 'desc';
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  // Destructure props based on the interface
  transactions,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  formatDate, // Use passed-in function
  getTransactionBadgeColor, // Use passed-in function
  getTransactionIcon, // Use passed-in function
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const itemsPerPage = 10;

  // Sorting Logic - applied to the full transactions list received via props
  const sortedTransactions = React.useMemo(() => {
    const sortableItems = [...transactions]; // Use the 'transactions' prop directly
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!]; // Use non-null assertion as key is checked
        const bValue = b[sortConfig.key!];

        // Basic comparison (adjust for different data types if needed)
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [transactions, sortConfig]);

  // Pagination Logic - applied after sorting
  const pageCount = Math.ceil(sortedTransactions.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(offset, offset + itemsPerPage);

  // --- Internal Helper Functions for Sorting ---
  const handleSort = (key: keyof Transaction) => { // Add type for key
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(0); // Reset to first page on sort
  };

  const getSortIcon = (key: keyof Transaction) => { // Add type for key
    if (sortConfig.key !== key) return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  // --- Render Logic ---
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Ensure sort keys match Transaction property names */}
            <TableHead
              onClick={() => handleSort('productName')}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center">
                Product {getSortIcon('productName')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('transactionType')}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center">
                Type {getSortIcon('transactionType')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('quantity')}
              className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
            >
              <div className="flex items-center justify-end">
                Quantity {getSortIcon('quantity')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('reference')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center">
                Reference {getSortIcon('reference')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('transactionDate')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center">
                Date {getSortIcon('transactionDate')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('createdBy')}
              className="hidden lg:table-cell cursor-pointer hover:bg-muted/50 transition-colors" // Show on lg+
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
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                Loading transactions...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-destructive">
                Error loading transactions: {error?.message ?? 'Unknown error'}
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? ( // Check original transactions length for "no data yet"
             <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                No transactions recorded yet.
              </TableCell>
            </TableRow>
           ) : paginatedTransactions.length === 0 ? ( // Check paginated length for "no results matching filter"
             <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                No transactions match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            paginatedTransactions.map((transaction) => (
              <TableRow key={transaction.id} data-state={transaction.id === -1 ? 'selected' : undefined}> {/* Example for potential selection state */}
                <TableCell>
                  <div className="font-medium">{transaction.productName ?? 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">{transaction.productSku}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("flex items-center w-fit gap-1", getTransactionBadgeColor(transaction.transactionType))}>
                    {getTransactionIcon(transaction.transactionType)}
                    {transaction.transactionType === 'ADJUSTMENT' ? 'ADJ' : transaction.transactionType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {transaction.quantity}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {transaction.reference}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(transaction.transactionDate)}
                </TableCell>
                <TableCell className="hidden lg:table-cell"> {/* Show on lg+ */}
                  {transaction.createdBy}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Open actions menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* Use onEdit prop */}
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        Edit Transaction
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                        // Use onDelete prop
                        onClick={() => {
                          // Consider a more robust confirmation modal than browser confirm
                          if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
                            onDelete(transaction.id);
                          }
                        }}
                      >
                        Delete Transaction
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {pageCount > 1 && (
         <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
                 Page {currentPage + 1} of {pageCount} ({transactions.length} total transactions)
            </div>
            <Pagination>
                <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                    // Add disabled state if needed: disabled={currentPage === 0}
                    />
                </PaginationItem>

                {/* Consider rendering fewer page numbers for many pages */}
                {Array.from({ length: pageCount }, (_, index) => (
                    <PaginationItem key={index}>
                    <PaginationLink
                        isActive={index === currentPage}
                        onClick={() => setCurrentPage(index)}
                    >
                        {index + 1}
                    </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1))}
                    // Add disabled state if needed: disabled={currentPage === pageCount - 1}
                    />
                </PaginationItem>
                </PaginationContent>
            </Pagination>
         </div>
      )}
    </div>
  );
};

export default TransactionTable;
