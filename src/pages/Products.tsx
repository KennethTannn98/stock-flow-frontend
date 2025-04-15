
import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Products
              </CardTitle>
              <CardDescription>
                Manage your inventory products
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new product
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter SKU" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="reorder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reorder At</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" /> Save Product
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Error loading products</h3>
              <p className="text-muted-foreground text-center mb-4">
                There was an error loading the product data. Please try again later.
              </p>
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
              >
                Retry
              </Button>
            </div>
          ) : filteredProducts().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-accent p-3 mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No products found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || categoryFilter !== 'all' 
                  ? "No products match your search criteria. Try adjusting your filters."
                  : "You haven't added any products yet. Add your first product to get started."}
              </p>
              {searchQuery || categoryFilter !== 'all' ? (
                <Button variant="outline" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" /> Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Reorder At</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts().map((product) => {
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
                            <Button variant="outline" size="icon" asChild>
                              <Link to={`/products/${product.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Dialog open={!!editingProduct && editingProduct.id === product.id} onOpenChange={(open) => {
                              if (!open) setEditingProduct(null);
                              else setEditingProduct(product);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => setEditingProduct(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Product</DialogTitle>
                                  <DialogDescription>
                                    Update the details for this product
                                  </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name="name"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Product Name</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="sku"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>SKU</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="category"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Category</FormLabel>
                                          <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {CATEGORIES.map(category => (
                                                <SelectItem key={category} value={category}>
                                                  {category}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <div className="grid grid-cols-1 gap-4">
                                      <FormField
                                        control={form.control}
                                        name="reorder"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Reorder At</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                min="0"
                                                step="1"
                                                {...field}
                                                onChange={e => field.onChange(Number(e.target.value))}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <FormField
                                      control={form.control}
                                      name="price"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Price ($)</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              min="0.01"
                                              step="0.01"
                                              {...field}
                                              onChange={e => field.onChange(Number(e.target.value))}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <DialogFooter>
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setEditingProduct(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button type="submit">
                                        <Save className="h-4 w-4 mr-2" /> Update Product
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog 
                              open={deleteConfirmId === product.id} 
                              onOpenChange={(open) => {
                                if (!open) setDeleteConfirmId(null);
                              }}
                            >
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteConfirmId(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteMutation.mutate(product.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredProducts().length}</strong> of <strong>{products.length}</strong> products
          </div>
        </CardFooter>
      </Card>
    </AppLayout>
  );
};

export default Products;
