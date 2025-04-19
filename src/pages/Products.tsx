// Products.tsx
import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Plus,
  AlertCircle,
  X,
  RefreshCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // <-- Import AlertDialog components
import {
  Product,
  ProductCreate,
  ProductUpdate,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '@/services/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ProductTable from '@/components/products/ProductTable';
import ProductDialog from '@/components/products/ProductDialog';

// Schema for product form validation
const productSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  quantity: z.number().min(0, { message: "Quantity must be 0 or more" }),
  price: z.number().min(0.01, { message: "Price must be greater than 0" }),
  sku: z.string().min(1, { message: "SKU is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  reorder: z.number().min(0, { message: "Reorder point must be 0 or more" }),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Convert to form values
const productToFormValues = (product?: Product): ProductFormValues => {
  return {
    name: product?.name || '',
    quantity: product?.quantity || 0,
    price: product?.price || 0.01,
    sku: product?.sku || '',
    category: product?.category || '',
    reorder: product?.reorder || 0,
  };
};

// Available product categories (can be dynamic as well, but good for the form dropdown)
const CATEGORIES = [
  "GPU", "CPU", "MOBO", "RAM", "SSD", "PSU", "FAN", "CASE", "PERI"
];

const Products = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null); 
  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const product: ProductCreate = {
        name: values.name,
        quantity: values.quantity,
        price: values.price,
        sku: values.sku,
        category: values.category,
        reorder: values.reorder,
      };
      return createProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added successfully');
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error adding product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ProductFormValues }) => {
      const product: ProductUpdate = {
        name: values.name,
        quantity: values.quantity,
        price: values.price,
        sku: values.sku,
        category: values.category,
        reorder: values.reorder,
      };
      return updateProduct(id, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
      setEditingProduct(null);
    },
    onError: (error) => {
      toast.error(`Error updating product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct, // The function to call (expects product ID)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      setDeleteConfirmId(null); // Close the confirmation dialog on success
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeleteConfirmId(null); // Close the confirmation dialog on error as well
    },
  });

  // Form setup for adding/editing products
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: productToFormValues(),
  });

  // Reset form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      form.reset(productToFormValues(editingProduct));
    } else {
      form.reset(productToFormValues());
    }
  }, [editingProduct, form]);

  // Handle form submit
  const onSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  // Determine stock status
  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { 
      label: 'OOS', 
      className: 'bg-red-100 text-red-800 hover:bg-red-100 border-0' 
    };
    if (product.quantity <= product.reorder) return { 
      label: 'Low', 
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0' 
    };
    return { 
      label: 'Available', 
      className: 'bg-green-100 text-green-800 hover:bg-green-100 border-0' 
    };
  };

  // Filter products based on search query, category, and status
  const filteredProducts = useCallback(() => {
    if (!products) return []; // Handle initial loading state
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || product.category.toLowerCase() === categoryFilter.toLowerCase();
      
      // Add status filtering
      const status = getStockStatus(product).label;
      const matchesStatus =
        statusFilter === 'all' || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  // Calculate unique categories from actual data for the filter dropdown
  const uniqueCategories = [...new Set(products.map(p => p.category))];

  // --- Delete Confirmation Handlers ---
  const handleDeleteConfirm = () => {
    if (deleteConfirmId !== null) {
      deleteMutation.mutate(deleteConfirmId);
      // No need to setDeleteConfirmId(null) here; onSuccess/onError handles it.
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null); // Just close the dialog
  };
  // --- End Delete Confirmation Handlers ---


  if (isLoading) {
      return <div>Loading products...</div>; // Or a spinner component
  }

  if (error) {
      return <div className="text-red-500">Error loading products: {error.message}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
  <div>
    {/* Apply the consistent style */}
    <h1 className="text-3xl font-bold">Products</h1> {/* Changed classes */}
    <p className="text-muted-foreground">Manage your product inventory</p>
  </div>
  <Button onClick={() => setIsAddDialogOpen(true)}>
    <Plus className="h-4 w-4 mr-2" /> Add Product
  </Button>
</div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {/* Use unique categories derived from data */}
                    {uniqueCategories.sort().map(category => (
                      <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="oos">OOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="h-10" // Ensure button aligns with inputs
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {/* Pass setDeleteConfirmId to the table */}
            <ProductTable
              products={products}
              filteredProducts={filteredProducts()}
              getStockStatus={getStockStatus}
              setEditingProduct={setEditingProduct}
              setDeleteConfirmId={setDeleteConfirmId}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Product Dialog */}
      <ProductDialog
        open={isAddDialogOpen || !!editingProduct}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingProduct(null);
          form.reset(productToFormValues()); // Reset form on close
        }}
        onSubmit={onSubmit}
        form={form}
        categories={CATEGORIES} // Use predefined categories for the form dropdown
        isEditing={!!editingProduct}
      />

      {/* --- Delete Confirmation Dialog --- */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(isOpen) => !isOpen && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove it from inventory records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending} // Disable button while deleting
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Style as destructive action
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* --- End Delete Confirmation Dialog --- */}
    </>
  );
};

export default Products;