
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LowStockProduct } from "@/services/api";
import { Button } from "@/components/ui/button";

interface LowStockTableProps {
  products: LowStockProduct[];
}

type SortField = 'name' | 'quantity' | 'reorder' | 'price' | null;
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 5;

const LowStockTable = ({ products }: LowStockTableProps) => {
  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0;
    
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * modifier;
      case 'quantity':
        return (a.quantity - b.quantity) * modifier;
      case 'reorder':
        return (a.reorder - b.reorder) * modifier;
      case 'price':
        return (a.price - b.price) * modifier;
      default:
        return 0;
    }
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate middle pages
      if (currentPage <= 2) {
        pageNumbers.push(2, 3);
      } else if (currentPage >= totalPages - 1) {
        pageNumbers.push(totalPages - 2, totalPages - 1);
      } else {
        pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
      }
      
      // Always include last page
      if (totalPages > 3 && !pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="inline h-4 w-4 ml-1" /> 
      : <ChevronDown className="inline h-4 w-4 ml-1" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Products that need to be reordered</CardDescription>
          </div>
          <Badge className="bg-red-500 hover:bg-red-600">{products.length} Items</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                Product {renderSortIndicator('name')}
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('quantity')}>
                Qty {renderSortIndicator('quantity')}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('reorder')}>
                Reorder At {renderSortIndicator('reorder')}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('price')}>
                Price {renderSortIndicator('price')}
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">No products found</TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right">{product.reorder}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      product.quantity === 0 
                        ? "border-red-500 text-red-500" 
                        : "border-yellow-500 text-yellow-500"
                    }>
                      {product.quantity === 0 ? "Out of Stock" : "Low Stock"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index, array) => (
                  <PaginationItem key={page}>
                    {index > 0 && array[index - 1] !== page - 1 ? (
                      <PaginationEllipsis />
                    ) : null}
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
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
      </CardContent>
    </Card>
  );
};

export default LowStockTable;
