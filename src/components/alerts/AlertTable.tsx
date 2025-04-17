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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
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
import { cn } from '@/lib/utils';

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

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
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
            <TableHead 
              onClick={() => handleSort('resolved')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Status {getSortIcon('resolved')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('productName')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Product {getSortIcon('productName')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('productSku')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                SKU {getSortIcon('productSku')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('createdDate')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Created {getSortIcon('createdDate')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('updatedDate')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Updated {getSortIcon('updatedDate')}
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
            <TableHead 
              onClick={() => handleSort('updatedBy')}
              className="hidden md:table-cell cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Updated By {getSortIcon('updatedBy')}
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                Loading alerts...
              </TableCell>
            </TableRow>
          ) : sortedAlerts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                No alerts found.
              </TableCell>
            </TableRow>
          ) : (
            sortedAlerts.map((alert) => (
              <TableRow key={alert.id}>
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
                <TableCell className="hidden md:table-cell">{alert.updatedBy}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleToggleResolved(alert)}
                        className="gap-2"
                      >
                        {alert.resolved ? (
                          <>
                            <X className="h-4 w-4" />
                            Mark as Unresolved
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Mark as Resolved
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive gap-2"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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