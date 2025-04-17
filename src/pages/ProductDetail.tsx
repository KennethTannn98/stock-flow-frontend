import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Package,
  Tag,
  Edit,
  Trash2,
  AlertCircle,
  Calendar,
  PlusCircle,
  MinusCircle,
  FileText,
  User,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  History,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  getProduct, 
  updateProduct, 
  deleteProduct,
  getProductTransactions,
  Product,
  Transaction,
  ProductUpdate
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch product details
  const { 
    data: product,
    isLoading: isLoadingProduct,
    error: productError
  } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => getProduct(productId),
    enabled: !isNaN(productId),
  });

  // Fetch product transactions
  const { 
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = useQuery({
    queryKey: ['products', productId, 'transactions'],
    queryFn: () => getProductTransactions(productId),
    enabled: !isNaN(productId),
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const productUpdate: ProductUpdate = {
        name: values.name,
        quantity: values.quantity,
        price: values.price,
        sku: values.sku,
        category: values.category,
        reorder: values.reorder,
      };
      return updateProduct(productId, productUpdate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success('Product updated successfully');
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error updating product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      navigate('/products');
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Form setup for editing product
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: productToFormValues(product),
  });

  // Update form values when product data changes
  useState(() => {
    if (product) {
      form.reset(productToFormValues(product));
    }
  });

  // Handle edit form submission
  const onSubmit = (values: ProductFormValues) => {
    updateMutation.mutate(values);
  };

  // Determine stock status
  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { label: 'Out of Stock', className: 'border-red-500 text-red-500' };
    if (product.quantity <= product.reorder) return { label: 'Low Stock', className: 'border-yellow-500 text-yellow-500' };
    return { label: 'In Stock', className: 'border-green-500 text-green-500' };
  };

  // Format transaction date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  // Get icon for transaction type
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'OUT':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'ADJUSTMENT':
        return <ArrowDownUp className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // Get badge for transaction type
  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'IN':
        return <Badge variant="outline" className="border-green-500 text-green-500">In</Badge>;
      case 'OUT':
        return <Badge variant="outline" className="border-red-500 text-red-500">Out</Badge>;
      case 'ADJUSTMENT':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Adjustment</Badge>;
      default:
        return null;
    }
  };

  // Error state
  if (productError) {
    return (
      <>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-destructive/10 p-3 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Error loading product</h3>
            <p className="text-muted-foreground text-center mb-4">
              There was an error loading the product data. Please try again later.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['products', productId] })}
              >
                Retry
              </Button>
              <Button onClick={() => navigate('/products')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Loading state
  if (isLoadingProduct || !product) {
    return (
      <>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </>
    );
  }

  const status = getStockStatus(product);

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Button>
            <h1 className="text-2xl font-semibold mt-2">{product.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Tag className="h-4 w-4" />
              <span>{product.sku}</span>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Edit className="mr-2 h-4 w-4" /> Edit
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
                                disabled={true}
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
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <Edit className="mr-2 h-4 w-4" /> Update
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold">{product.quantity}</div>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Reorder Point</span>
                <span>{product.reorder}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" /> Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">
                ${product.price.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>Total Value</span>
                <span>${(product.price * product.quantity).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{product.category}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <History className="h-4 w-4" /> Transaction History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all transactions for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : transactionsError ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                    <p className="text-muted-foreground">Error loading transactions</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['products', productId, 'transactions'] })}
                    >
                      Retry
                    </Button>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <History className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No transactions found for this product</p>
                    <Link to="/transactions">
                      <Button variant="outline" size="sm" className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Transaction
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Created By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction: Transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {formatDate(transaction.transactionDate)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTransactionTypeIcon(transaction.transactionType)}
                                {getTransactionTypeBadge(transaction.transactionType)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {transaction.quantity}
                            </TableCell>
                            <TableCell>
                              {transaction.reference || '-'}
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {transaction.createdBy}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/50">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/transactions">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Transaction
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProductDetail;
