// AlertTable.tsx
import React, { useState, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trash2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils'; // Make sure cn is available

// --- Define JwtPayload Interface ---
interface JwtPayload {
  sub?: string;
  roles?: { authority: string }[];
  exp?: number;
  iat?: number;
}
// --- End JwtPayload Interface ---

// Define the Alert type (ensure it matches the one in api.ts and Alerts.tsx)
interface Alert {
    id: number; // Changed back to number to match api.ts and likely usage
    productId: number;
    productSku: string;
    productName: string;
    resolved: boolean;
    createdDate: string; // Keep as string if API returns ISO string
    updatedDate: string; // Keep as string if API returns ISO string
    createdBy: string;
    updatedBy: string;
}

// Define the props interface - UPDATED
interface AlertTableProps {
    alerts: Alert[]; // Original list, might be useful for calculations not dependent on filters
    isLoading: boolean;
    filteredAlerts: Alert[]; // List to display after filtering/searching
    formatDate: (dateString: string | null | undefined) => string; // Match signature in Alerts.tsx
    handleToggleResolved: (alert: Alert) => void;
    onDeleteClick: (alert: Alert) => void; // Handler function passed from parent
}

// Define the type for sort configuration
interface SortConfig {
    key: keyof Alert | null;
    direction: 'asc' | 'desc';
}


const AlertTable: React.FC<AlertTableProps> = ({
    alerts, // Keep original list if needed elsewhere, otherwise can be removed
    isLoading,
    filteredAlerts, // Use this for display and sorting
    formatDate,
    handleToggleResolved,
    onDeleteClick // Use the handler prop
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdDate', direction: 'desc' }); // Default sort

  // --- Role Checking Logic ---
  const userRole = useMemo(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return null;
    }
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      // Check if roles exist and have at least one element
      return decoded.roles?.[0]?.authority ?? null;
    } catch (error) {
      console.error("Failed to decode JWT or invalid token:", error);
      return null;
    }
  }, []);
  // --- End Role Checking Logic ---

  const canDelete = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_MANAGER'; // Allow Admin and Manager to delete
  const itemsPerPage = 10;

  // Sorting Logic - Applied to the filtered list
  const sortedFilteredAlerts = useMemo(() => {
    const sortableItems = [...filteredAlerts]; // Sort the filtered list
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Handle potential null/undefined values for sorting keys if needed
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Basic comparison, adjust for specific types (dates, numbers) if necessary
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredAlerts, sortConfig]); // Depend on filteredAlerts

  // Pagination Logic - Applied to the sorted filtered list
  const pageCount = Math.ceil(sortedFilteredAlerts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const paginatedAlerts = sortedFilteredAlerts.slice(offset, offset + itemsPerPage);

  const handleSort = (key: keyof Alert) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      // Optional: Allow cycling back to ascending or removing sort on third click
       direction = 'asc'; // Cycle back to ascending
      // setSortConfig({ key: null, direction: 'asc' }); // Remove sort
      // return;
    }
    setSortConfig({ key, direction });
    setCurrentPage(0); // Reset to first page on sort change
  };

  const getSortIcon = (key: keyof Alert) => {
    if (sortConfig.key !== key) return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  // No internal handleDeleteAlert function needed here

  const colSpan = 8; // Status, Product, SKU, Created, Updated, CreatedBy, UpdatedBy, Actions

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
           <TableRow>
            {/* Status Column */}
            <TableHead
              onClick={() => handleSort('resolved')}
              className="cursor-pointer hover:bg-muted w-[120px]" // Fixed width example
            >
              <div className="flex items-center">
                Status {getSortIcon('resolved')}
              </div>
            </TableHead>
            {/* Product Column */}
            <TableHead
              onClick={() => handleSort('productName')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Product {getSortIcon('productName')}
              </div>
            </TableHead>
             {/* SKU Column */}
             <TableHead
              onClick={() => handleSort('productSku')}
              className="cursor-pointer hover:bg-muted w-[150px]" // Fixed width example
            >
              <div className="flex items-center">
                SKU {getSortIcon('productSku')}
              </div>
            </TableHead>
            {/* Created Date Column */}
            <TableHead
              onClick={() => handleSort('createdDate')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted w-[180px]" // Fixed width example
            >
              <div className="flex items-center">
                Created {getSortIcon('createdDate')}
              </div>
            </TableHead>
            {/* Updated Date Column */}
            <TableHead
              onClick={() => handleSort('updatedDate')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted w-[180px]" // Fixed width example
            >
              <div className="flex items-center">
                Updated {getSortIcon('updatedDate')}
              </div>
            </TableHead>
            {/* Created By Column */}
            <TableHead
              onClick={() => handleSort('createdBy')}
              className="hidden lg:table-cell cursor-pointer hover:bg-muted w-[150px]" // Show on large screens
            >
              <div className="flex items-center">
                Created By {getSortIcon('createdBy')}
              </div>
            </TableHead>
            {/* Updated By Column */}
             <TableHead
              onClick={() => handleSort('updatedBy')}
              className="hidden lg:table-cell cursor-pointer hover:bg-muted w-[150px]" // Show on large screens
            >
              <div className="flex items-center">
                Updated By {getSortIcon('updatedBy')}
              </div>
            </TableHead>
            {/* Actions Column */}
            <TableHead className="text-right w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center py-10">
                Loading alerts...
              </TableCell>
            </TableRow>
          ) : paginatedAlerts.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={colSpan} className="text-center py-10 text-muted-foreground">
                      {/* Check original filtered list length to differentiate between no results and empty page */}
                      {filteredAlerts.length === 0 ? "No alerts found matching your criteria." : "No alerts on this page."}
                  </TableCell>
              </TableRow>
           ) : (
            paginatedAlerts.map((alert) => (
              <TableRow key={alert.id} className={cn(alert.resolved ? "" : "bg-red-50 dark:bg-red-950/30")}> {/* Example: Highlight active alerts */}
                <TableCell>
                  <Badge
                    variant={alert.resolved ? "outline" : "destructive"}
                    className="flex items-center gap-1 w-fit"
                  >
                    {alert.resolved ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Resolved
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Active
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{alert.productName}</TableCell>
                <TableCell>{alert.productSku}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(alert.createdDate)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                   <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(alert.updatedDate)}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{alert.createdBy}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs">{alert.updatedBy}</TableCell>
                <TableCell className="text-right">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Alert Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleToggleResolved(alert)}
                        className="gap-2 cursor-pointer"
                      >
                        {alert.resolved ? (
                          <>
                            <X className="h-4 w-4" />
                            Mark as Active
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Mark as Resolved
                          </>
                        )}
                      </DropdownMenuItem>
                      {/* Conditional delete based on role */}
                      {canDelete && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                           // Call the onDeleteClick prop passed from the parent
                          onClick={() => onDeleteClick(alert)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Alert
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

        {/* Pagination Controls - Render only if there's more than one page */}
        {pageCount > 1 && (
            <Pagination className="mt-4 pb-4 px-4 flex justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#" // Use href="#" or button variant for accessibility if not routing
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage((prev) => Math.max(prev - 1, 0));
                            }}
                            className={cn(currentPage === 0 && "pointer-events-none opacity-50")}
                        />
                    </PaginationItem>
                    {/* Generate page numbers - Consider showing a limited range for many pages */}
                    {Array.from({ length: pageCount }, (_, index) => (
                        <PaginationItem key={index}>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(index);
                            }}
                            isActive={index === currentPage}
                        >
                            {index + 1}
                        </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                             href="#"
                             onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1));
                            }}
                             className={cn(currentPage === pageCount - 1 && "pointer-events-none opacity-50")}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )}
    </div>
  );
};

export default AlertTable;