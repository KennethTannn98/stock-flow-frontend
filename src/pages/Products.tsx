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

const productSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  quantity: z.number().min(0, { message: "Quantity must be 0 or more" }),
  price: z.number().min(0.01, { message: "Price must be greater than 0" }),
  sku: z.string().min(1, { message: "SKU is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  reorder: z.number().min(0, { message: "Reorder point must be 0 or more" }),
});

type ProductFormValues = z.infer<typeof productSchema>;

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

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: productToFormValues(),
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset(productToFormValues(editingProduct));
    } else {
      form.reset(productToFormValues());
    }
  }, [editingProduct, form]);

  const onSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

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

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
  };

  const uniqueCategories = [...new Set(products.map(p => p.category))];
  
  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { label: 'Out of Stock', className: 'border-red-500 text-red-500' };
    if (product.quantity <= product.reorder) return { label: 'Low Stock', className: 'border-yellow-500 text-yellow-500' };
    return { label: 'In Stock', className: 'border-green-500 text-green-500' };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="h-10"
              >
                <RefreshCcw className="h-4 w-4 mr-2" /> Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
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
    </div>
  );
};

export default Products;
