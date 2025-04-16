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
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Trash2,
  X,
  Check,
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

const AlertTable = ({ alerts, isLoading, filteredAlerts, formatDate, handleToggleResolved, setSelectedAlert, setIsDeleteDialogOpen }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const itemsPerPage = 10;
  const offset = currentPage * itemsPerPage;
  const paginatedAlerts = filteredAlerts.slice(offset, offset + itemsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAlerts = [...paginatedAlerts].sort((a, b) => {
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
            <TableHead onClick={() => handleSort('resolved')}>Status</TableHead>
            <TableHead onClick={() => handleSort('productName')}>Product</TableHead>
            <TableHead onClick={() => handleSort('productSku')}>SKU</TableHead>
            <TableHead onClick={() => handleSort('createdDate')} className="hidden md:table-cell">Created</TableHead>
            <TableHead onClick={() => handleSort('updatedDate')} className="hidden md:table-cell">Updated</TableHead>
            <TableHead onClick={() => handleSort('createdBy')} className="hidden md:table-cell">Created By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Loading alerts...
              </TableCell>
            </TableRow>
          ) : sortedAlerts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No alerts found.
              </TableCell>
            </TableRow>
          ) : (
            sortedAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Badge 
                    variant={alert.resolved ? "outline" : "destructive"}
                    className="gap-1"
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
                <TableCell>{alert.productName}</TableCell>
                <TableCell>{alert.productSku}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {formatDate(alert.createdDate)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {formatDate(alert.updatedDate)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{alert.createdBy}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleToggleResolved(alert)}
                      >
                        {alert.resolved ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Mark as Unresolved
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Resolved
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
      <Pagination className="mt-4">
        <PaginationPrevious
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
        />
        <PaginationContent>
          {Array.from({ length: Math.ceil(filteredAlerts.length / itemsPerPage) }, (_, index) => (
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
              Math.min(prev + 1, Math.ceil(filteredAlerts.length / itemsPerPage) - 1)
            )
          }
        />
      </Pagination>
    </div>
  );
};

export default AlertTable;