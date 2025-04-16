
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  Filter,
  MoreVertical,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Sliders,
} from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';

import {
  Transaction,
  TransactionCreate,
  getTransactions,
  getProducts,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/services/api';

// Form schema for transaction validation
const transactionSchema = z.object({
  productId: z.number({
    required_error: "Product is required",
  }),
  quantity: z.number({
    required_error: "Quantity is required",
  }).positive("Quantity must be positive"),
  transactionType: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    required_error: "Transaction type is required",
  }),
  reference: z.string().min(1, "Reference is required"),
  transactionDate: z.string().min(1, "Date is required"),
  createdBy: z.string().min(1, "Creator name is required"),
});

const Transactions = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Fetch transactions
  const { data: transactions = [], isLoading, isError, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });

  // Fetch products for the dropdown
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: (transaction: TransactionCreate) => createTransaction(transaction),
    onSuccess: () => {
      toast.success('Transaction created successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setOpenDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast.error('Failed to create transaction');
      console.error('Create transaction error:', error);
    },
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, transaction }: { id: number; transaction: Partial<Transaction> }) => 
      updateTransaction(id, transaction),
    onSuccess: () => {
      toast.success('Transaction updated successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setOpenDialog(false);
      setEditingTransaction(null);
      form.reset();
    },
    onError: (error) => {
      toast.error('Failed to update transaction');
      console.error('Update transaction error:', error);
    },
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      toast.success('Transaction deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error('Failed to delete transaction');
      console.error('Delete transaction error:', error);
    },
  });

  // Transaction form
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      productId: 0,
      quantity: 1,
      transactionType: 'IN',
      reference: '',
      transactionDate: new Date().toISOString().slice(0, 16),
      createdBy: 'admin',
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof transactionSchema>) => {
    if (editingTransaction) {
      updateMutation.mutate({ 
        id: editingTransaction.id, 
        transaction: values 
      });
    } else {
      // Find the selected product to get its details
      const selectedProduct = products.find(p => p.id === values.productId);
      if (!selectedProduct) {
        toast.error("Selected product not found");
        return;
      }

      // Ensure all required fields are included for TransactionCreate
      const newTransaction: TransactionCreate = {
        productId: values.productId,
        quantity: values.quantity,
        transactionType: values.transactionType,
        reference: values.reference,
        transactionDate: values.transactionDate,
        createdBy: values.createdBy,
        productSku: selectedProduct.sku,
        productName: selectedProduct.name,
      };
      
      createMutation.mutate(newTransaction);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    form.reset();
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    // Pre-populate form with transaction data
    form.reset({
      productId: transaction.productId,
      quantity: transaction.quantity,
      transactionType: transaction.transactionType,
      reference: transaction.reference,
      transactionDate: new Date(transaction.transactionDate).toISOString().slice(0, 16),
      createdBy: transaction.createdBy,
    });
    setOpenDialog(true);
  };

  // Filter and search transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Apply type filter if set
    const matchesType = !typeFilter || transaction.transactionType === typeFilter;
    
    // Apply search term to product name, reference, or SKU
    const matchesSearch = !searchTerm || 
      transaction.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.productSku.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yy');
    } catch (err) {
      return dateString;
    }
  };

  // Get badge color based on transaction type
  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'OUT':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'ADJUSTMENT':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return '';
    }
  };

  // Get icon based on transaction type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <ArrowDown className="h-4 w-4 mr-1" />;
      case 'OUT':
        return <ArrowUp className="h-4 w-4 mr-1" />;
      case 'ADJUSTMENT':
        return <Sliders className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Transaction
          </Button>
        </div>

        <Card className="mb-6">
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
                    placeholder="Search by product, reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Type</label>
                <Select 
                  value={typeFilter} 
                  onValueChange={setTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="IN">Stock In</SelectItem>
                    <SelectItem value="OUT">Stock Out</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('');
                  }}
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="hidden md:table-cell">Reference</TableHead>
                    <TableHead className="hidden md:table-cell">Transaction Date</TableHead>
                    <TableHead className="hidden md:table-cell">Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-red-500">
                        Error loading transactions: {error instanceof Error ? error.message : 'Unknown error'}
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="font-medium">{transaction.productName}</div>
                          <div className="text-sm text-muted-foreground">{transaction.productSku}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("flex items-center w-fit", getTransactionBadgeColor(transaction.transactionType))}>
                            {getTransactionIcon(transaction.transactionType)}
                            {transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.quantity}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {transaction.reference}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(transaction.transactionDate)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {transaction.createdBy}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
                                    deleteMutation.mutate(transaction.id);
                                  }
                                }}
                              >
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={openDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction 
                ? 'Update the details of the existing transaction.' 
                : 'Create a new inventory transaction.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      disabled={Boolean(editingTransaction)}
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN">Stock In</SelectItem>
                        <SelectItem value="OUT">Stock Out</SelectItem>
                        <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter quantity"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PO12345, SO6789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="createdBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Created By</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Transactions;

