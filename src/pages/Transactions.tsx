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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionDialog from '@/components/transactions/TransactionDialog';

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
    // Apply type filter if set and not "ALL"
    const matchesType = typeFilter === 'ALL' || !typeFilter || transaction.transactionType === typeFilter;

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
      return format(parseISO(dateString), 'dd/MM/yyyy');
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
    <>
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
            <TransactionTable
              transactions={transactions}
              isLoading={isLoading}
              isError={isError}
              error={error}
              filteredTransactions={filteredTransactions}
              handleEditTransaction={handleEditTransaction}
              deleteMutation={deleteMutation}
            />
          </CardContent>
        </Card>
      </div>

      <TransactionDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSubmit={onSubmit}
        form={form}
        products={products}
        isEditing={!!editingTransaction}
      />
    </>
  );
};

export default Transactions;