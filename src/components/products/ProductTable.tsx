// ProductTable.tsx
import React, { useState, useMemo } from 'react'; // Import useMemo
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
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
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// --- Define JwtPayload Interface ---
interface JwtPayload {
  sub?: string; // Subject (usually username)
  roles?: { authority: string }[]; // Array of role objects
  exp?: number;
  iat?: number;
  // Add any other claims you expect in your token
}
// --- End JwtPayload Interface ---


// Define the props interface 
interface ProductTableProps {
  products: any[]; // Replace 'any' with your actual Product type if available
  filteredProducts: any[]; // Replace 'any' with your actual Product type
  getStockStatus: (product: any) => { label: string; className: string };
  setEditingProduct: (product: any | null) => void;
  setDeleteConfirmId: (id: number | null) => void; 
}

const ProductTable: React.FC<ProductTableProps> = ({
  products, // products prop might be unused if filteredProducts contains everything needed
  filteredProducts,
  getStockStatus,
  setEditingProduct,
  setDeleteConfirmId,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

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
        // Return the authority string, e.g., "ROLE_ADMIN", "ROLE_USER"
        return decoded.roles[0]?.authority;
      }
      return null; // No roles claim found
    } catch (error) {
      console.error("Failed to decode JWT or invalid token:", error);
      // Optional: Handle invalid token (e.g., force logout)
      // localStorage.removeItem('token');
      // localStorage.removeItem('username');
      // navigate('/login'); // Would need useNavigate hook from react-router-dom
      return null;
    }
  }, []); // Empty dependency array: check role only once on component mount
  // --- End Role Checking Logic ---

  const itemsPerPage = 10;
  const offset = currentPage * itemsPerPage;

  // Apply sorting *before* pagination
  const sortedFilteredProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'status') {
            aValue = getStockStatus(a).label;
            bValue = getStockStatus(b).label;
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        // Handle potential null/undefined values for sorting
        const valA = aValue ?? '';
        const valB = bValue ?? '';

        if (typeof valA === 'number' && typeof valB === 'number') {
           return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        // Default to string comparison
        const comparison = String(valA).localeCompare(String(valB));
        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  // Recalculate sorting when filteredProducts or sortConfig changes
  }, [filteredProducts, sortConfig, getStockStatus]);


  const paginatedProducts = useMemo(() => {
    const offset = currentPage * itemsPerPage;
    return sortedFilteredProducts.slice(offset, offset + itemsPerPage);
  // Recalculate pagination when sorted list or current page changes
  }, [sortedFilteredProducts, currentPage, itemsPerPage]);


  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(0); // Reset to first page on sort change
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  // Determine if actions should be shown based on the locally checked role
  const showActions = userRole !== 'ROLE_USER';

  const totalPages = Math.ceil(sortedFilteredProducts.length / itemsPerPage);


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
            <TableHead
              onClick={() => handleSort('status')}
              className="cursor-pointer hover:bg-muted"
            >
              <div className="flex items-center">
                Status {getSortIcon('status')}
              </div>
            </TableHead>

            {/* Conditionally render the Actions header */}
            {showActions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => {
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

                  {/* Conditionally render the Actions cell */}
                  {showActions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingProduct(product)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          ) : (
              <TableRow>
                  <TableCell colSpan={showActions ? 8 : 7} className="h-24 text-center">
                      No products found.
                  </TableCell>
              </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination - only show if there are products */}
      {totalPages > 1 && (
        <Pagination className="mt-2 pb-4">
            <PaginationContent>
            <PaginationItem>
                <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                // Disable if on the first page
                className={cn(currentPage === 0 && 'pointer-events-none opacity-50')}
                />
            </PaginationItem>
            {/* Simple pagination: show current page and neighbors, or use a more complex logic if needed */}
            {Array.from({ length: totalPages }, (_, index) => (
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
                onClick={() =>
                    setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages - 1)
                    )
                }
                // Disable if on the last page
                className={cn(currentPage >= totalPages - 1 && 'pointer-events-none opacity-50')}
                />
            </PaginationItem>
            </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ProductTable;