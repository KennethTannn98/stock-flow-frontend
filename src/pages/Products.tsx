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
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
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

// Available product categories
const CATEGORIES = [
  "GPU", "CPU", "MOBO", "RAM", "SSD", "PSU", "FAN", "CASE", "PERI"
];

const Products = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
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
      // Ensure all required fields are present for create
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
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Filter products based on search query and category
  const filteredProducts = useCallback(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === 'all' || product.category.toLowerCase() === categoryFilter.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
  };

  // Calculate unique categories from actual data
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  
  // Determine stock status
  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { label: 'Out of Stock', className: 'border-red-500 text-red-500' };
    if (product.quantity <= product.reorder) return { label: 'Low Stock', className: 'border-yellow-500 text-yellow-500' };
    return { label: 'In Stock', className: 'border-green-500 text-green-500' };
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <p className="text-muted-foreground">View, add, edit, and remove products</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ProductTable
            products={products}
            filteredProducts={filteredProducts()}
            getStockStatus={getStockStatus}
            setEditingProduct={setEditingProduct}
            setDeleteConfirmId={setDeleteConfirmId}
            deleteMutation={deleteMutation}
          />
        </CardContent>
      </Card>

      <ProductDialog
        open={isAddDialogOpen || !!editingProduct}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={onSubmit}
        form={form}
        categories={CATEGORIES}
        isEditing={!!editingProduct}
      />
    </AppLayout>
  );
};

export default Products;
