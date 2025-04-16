import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { ExternalLink, Edit, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

const ProductTable = ({ products, filteredProducts, getStockStatus, setEditingProduct, setDeleteConfirmId, deleteMutation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const itemsPerPage = 10;
  const offset = currentPage * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(offset, offset + itemsPerPage);

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

  const sortedProducts = [...paginatedProducts].sort((a, b) => {
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
              onClick={() => handleSort('name')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Product {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('sku')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                SKU {getSortIcon('sku')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('category')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Category {getSortIcon('category')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('quantity')}
              className="cursor-pointer hover:bg-muted text-right"
            >
              <div className="flex items-center justify-end">
                Qty {getSortIcon('quantity')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('reorder')}
              className="cursor-pointer hover:bg-muted text-right"
            >
              <div className="flex items-center justify-end">
                Reorder At {getSortIcon('reorder')}
              </div>
            </TableHead>
            <TableHead 
              onClick={() => handleSort('price')}
              className="cursor-pointer hover:bg-muted text-right"
            >
              <div className="flex items-center justify-end">
                Price {getSortIcon('price')}
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => {
            const status = getStockStatus(product);
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <Link to={`/products/${product.id}`} className="hover:underline flex items-center gap-1">
                    <span className="font-medium">{product.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </Link>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">{product.quantity}</TableCell>
                <TableCell className="text-right">{product.reorder}</TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("w-fit", status.className)}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirmId(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Pagination className="mt-2 pb-4">
        <PaginationPrevious
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
        />
        <PaginationContent>
          {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, index) => (
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
              Math.min(prev + 1, Math.ceil(filteredProducts.length / itemsPerPage) - 1)
            )
          }
        />
      </Pagination>
    </div>
  );
};

export default ProductTable;