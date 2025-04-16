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
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';

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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('name')}>Product</TableHead>
            <TableHead onClick={() => handleSort('sku')}>SKU</TableHead>
            <TableHead onClick={() => handleSort('category')}>Category</TableHead>
            <TableHead onClick={() => handleSort('quantity')} className="text-right">Qty</TableHead>
            <TableHead onClick={() => handleSort('reorder')} className="text-right">Reorder At</TableHead>
            <TableHead onClick={() => handleSort('price')} className="text-right">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product) => {
            const status = getStockStatus(product);
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <Link to={`/products/${product.id}`} className="hover:underline flex items-center gap-1">
                    {product.name}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </Link>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">{product.quantity}</TableCell>
                <TableCell className="text-right">{product.reorder}</TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => setEditingProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive"
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
      <Pagination className="mt-4">
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