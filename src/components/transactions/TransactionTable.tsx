import React, { useState, useMemo } from 'react'; // Added useMemo
import { jwtDecode } from 'jwt-decode'; // Added jwtDecode
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
  // DropdownMenuLabel, // Not used
  // DropdownMenuSeparator, // Not used
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Transaction } from '@/services/api'; // Import Transaction type

// --- Define JwtPayload Interface ---
interface JwtPayload {
  sub?: string; // Subject (usually username)
  roles?: { authority: string }[]; // Array of role objects
  exp?: number;
  iat?: number;
  // Add any other claims you expect in your token
}
// --- End JwtPayload Interface ---

// Define the expected props interface (userRole is not needed here)
interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
  formatDate: (dateString: string) => string;
  getTransactionBadgeColor: (type: string) => string;
  getTransactionIcon: (type: string) => React.ReactNode;
}

// Define the type for sort configuration
interface SortConfig {
    key: keyof Transaction | null;
    direction: 'asc' | 'desc';
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  formatDate,
  getTransactionBadgeColor,
  getTransactionIcon,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

  // --- Role Checking Logic (moved inside the component) ---
  const userRole = useMemo(() => {
    // Ensure this code runs only on the client-side
    if (typeof window === 'undefined' || !window.localStorage) {
        return null; // Cannot access localStorage on server or if unavailable
    }
    const token = localStorage.getItem('token');
    if (!token) {
      return null; // No token, no specific role
    }
    try {
      // Decode the token
      const decoded = jwtDecode<JwtPayload>(token);
      // Extract the first role
      if (decoded.roles && decoded.roles.length > 0) {
        return decoded.roles[0]?.authority; // e.g., "ROLE_ADMIN", "ROLE_USER"
      }
      return null; // No roles claim found
    } catch (err) { // Use specific error variable 'err'
      console.error("Failed to decode JWT or invalid token:", err);
      return null;
    }
  }, []); // Empty dependency array: check role only once on component mount
  // --- End Role Checking Logic ---

  // Determine if actions should be shown based on the locally checked role
  const showActions = userRole !== 'ROLE_USER';

  const itemsPerPage = 10;

  // Sorting Logic
  const sortedTransactions = React.useMemo(() => {
    const sortableItems = [...transactions];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Simple comparison logic (can be expanded for different types)
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [transactions, sortConfig]);

  // Pagination Logic
  const pageCount = Math.ceil(sortedTransactions.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(offset, offset + itemsPerPage);

  // --- Internal Helper Functions for Sorting ---
  const handleSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(0);
  };

  const getSortIcon = (key: keyof Transaction) => {
    if (sortConfig.key !== key) return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  // --- Delete Dialog Handlers ---
  const handleDeleteClick = (id: number) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete !== null) {
      onDelete(transactionToDelete);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  // Calculate column span based on whether actions are shown
  const colSpan = showActions ? 7 : 6;

  // --- Render Logic ---
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Column Headers */}
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
                className="hidden lg:table-cell cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center">
                  Created By {getSortIcon('createdBy')}
                </div>
              </TableHead>

              {/* Conditionally render the Actions header */}
              {showActions && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-10 text-muted-foreground">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-10 text-destructive">
                  Error loading transactions: {error?.message ?? 'Unknown error'}
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
               <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-10 text-muted-foreground">
                  No transactions recorded yet.
                </TableCell>
              </TableRow>
             ) : paginatedTransactions.length === 0 ? (
               <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-10 text-muted-foreground">
                  No transactions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  {/* Data Cells */}
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
                  <TableCell className="hidden lg:table-cell">
                    {transaction.createdBy}
                  </TableCell>

                  {/* Conditionally render the Actions cell */}
                  {showActions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <span className="sr-only">Open actions menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(transaction)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                            onClick={() => handleDeleteClick(transaction.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
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
                        // Disable if on the first page
                        className={cn(currentPage === 0 && 'pointer-events-none opacity-50')}
                      />
                  </PaginationItem>
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
                        // Disable if on the last page
                        className={cn(currentPage >= pageCount - 1 && 'pointer-events-none opacity-50')}
                      />
                  </PaginationItem>
                  </PaginationContent>
              </Pagination>
           </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white" // Keep destructive style for delete
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TransactionTable;