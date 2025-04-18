import React, { useState } from 'react'; // Import React explicitly
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  // Filter, // Filter icon not used directly in this revised code
  // MoreVertical, // MoreVertical icon not used directly in this revised code
  Plus,
  RefreshCcw,
  Search,
  // Settings, // Settings icon not used directly in this revised code
  Sliders,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// UI Components (ensure paths are correct)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Table components are likely used within TransactionTable, keep imports if needed elsewhere
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// Dropdown components are likely used within TransactionTable, keep imports if needed elsewhere
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Badge } from '@/components/ui/badge'; // Badge likely used within TransactionTable
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { cn } from '@/lib/utils'; // cn likely used within TransactionTable or Dialog

// API Services and Types (ensure paths are correct)
import {
  Transaction,
  TransactionCreate,
  Product, // Import Product type
  getTransactions,
  getProducts,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/services/api';

// Custom Components (ensure paths are correct)
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionDialog from '@/components/transactions/TransactionDialog';

// --- Form Schema ---
const transactionSchema = z.object({
  // productId is needed internally for creation payload, but not directly in the form input
  productId: z.number().optional(), // Optional in the form data itself
  productSku: z.string().min(1, "Product SKU is required"), // Main identifier in the form
  quantity: z.number({
    required_error: "Quantity is required",
    invalid_type_error: "Quantity must be a number",
  }).positive("Quantity must be positive").min(1, "Quantity must be at least 1"),
  transactionType: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    required_error: "Transaction type is required",
  }),
  reference: z.string().min(1, "Reference is required"),
  // Storing as ISO string from the date input
  transactionDate: z.string().min(1, "Date is required")
      .refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  createdBy: z.string().min(1, "Creator name is required"),
});

// Infer the type from the schema
type TransactionFormData = z.infer<typeof transactionSchema>;

const Transactions: React.FC = () => { // Use React.FC for functional components
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL'); // Default to 'ALL'
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // --- React Query Hooks ---
  const { data: transactions = [], isLoading, isError, error: queryError } = useQuery<Transaction[], Error>({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });

  const { data: products = [] } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  // --- Form Definition ---
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      productId: undefined, // Initialize as undefined
      productSku: '',
      quantity: 1,
      transactionType: 'IN',
      reference: '',
      transactionDate: new Date().toISOString(), // Store full ISO string
      createdBy: 'admin', // TODO: Replace with actual logged-in user logic
    },
  });

  // --- Mutations ---
  const createMutation = useMutation<Transaction, Error, TransactionCreate>({
    mutationFn: (newTransactionData) => createTransaction(newTransactionData),
    onSuccess: () => {
      toast.success('Transaction created successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      handleDialogClose();
    },
    onError: (err) => {
      toast.error(`Failed to create transaction: ${err.message}`);
      console.error('Create transaction error:', err);
    },
  });

  const updateMutation = useMutation<Transaction, Error, { id: number; data: Partial<TransactionFormData> }>({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onSuccess: () => {
      toast.success('Transaction updated successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      handleDialogClose();
    },
    onError: (err) => {
      toast.error(`Failed to update transaction: ${err.message}`);
      console.error('Update transaction error:', err);
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (id) => deleteTransaction(id),
    onSuccess: () => {
      toast.success('Transaction deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // No need to close dialog here as delete is usually from the table
    },
    onError: (err) => {
      toast.error(`Failed to delete transaction: ${err.message}`);
      console.error('Delete transaction error:', err);
    },
  });

  // --- Event Handlers ---
  const onSubmit = (values: TransactionFormData) => {
    // Convert quantity just in case it comes as string from form sometimes
    const quantityAsNumber = Number(values.quantity);
    if (isNaN(quantityAsNumber)) {
        form.setError("quantity", { type: "manual", message: "Invalid number." });
        return;
    }

    // Ensure date is a valid ISO string before sending
    const formattedDate = new Date(values.transactionDate).toISOString();

    const submissionBaseData = {
        ...values,
        quantity: quantityAsNumber,
        transactionDate: formattedDate,
    };

    if (editingTransaction) {
      // For update, only send fields that should be updatable.
      // Exclude productSku (disabled) and productId (usually not updated).
      const { productSku, productId, ...updateData } = submissionBaseData;
      updateMutation.mutate({
        id: editingTransaction.id,
        data: updateData,
      });
    } else {
      // For creation, find the product by SKU to get ID and Name
      const selectedProduct = products.find(p => p.sku === values.productSku);
      if (!selectedProduct) {
        form.setError("productSku", { type: "manual", message: `Product SKU "${values.productSku}" not found.` });
        return;
      }

      // Construct the payload matching the TransactionCreate type for the API
      const newTransaction: TransactionCreate = {
        productId: selectedProduct.id,
        productSku: values.productSku,
        productName: selectedProduct.name,
        quantity: submissionBaseData.quantity,
        transactionType: submissionBaseData.transactionType,
        reference: submissionBaseData.reference,
        transactionDate: submissionBaseData.transactionDate,
        createdBy: submissionBaseData.createdBy,
      };
      createMutation.mutate(newTransaction);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    form.reset(); // Reset form to default values
  };

  const handleAddNewClick = () => {
    setEditingTransaction(null); // Ensure not in editing mode
    form.reset(); // Reset to default values before opening
    setOpenDialog(true);
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    // Pre-populate form, ensuring date is in full ISO format for consistency
    form.reset({
      productId: transaction.productId, // Keep for potential internal use if needed
      productSku: transaction.productSku,
      quantity: transaction.quantity,
      transactionType: transaction.transactionType,
      reference: transaction.reference,
      transactionDate: new Date(transaction.transactionDate).toISOString(),
      createdBy: transaction.createdBy,
    });
    setOpenDialog(true);
  };

  const handleDeleteTransaction = (id: number) => {
    // Optional: Add a confirmation dialog here
    deleteMutation.mutate(id);
  };

  // --- Filtering Logic ---
  const filteredTransactions = transactions.filter(transaction => {
    // Check type filter
    const matchesType = typeFilter === 'ALL' || transaction.transactionType === typeFilter;

    // Check search term (case-insensitive) against relevant fields
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      transaction.productName?.toLowerCase().includes(searchLower) ||
      transaction.reference?.toLowerCase().includes(searchLower) ||
      transaction.productSku?.toLowerCase().includes(searchLower);

    return matchesType && matchesSearch;
  });

  // --- Helper Functions (could be moved to utils if complex/reused) ---
  const formatDate = (dateString: string) => {
    try {
      // Ensure parsing is robust, might need date-fns-tz if timezones are complex
      return format(parseISO(dateString), 'dd MMM yyyy HH:mm'); // Example format
    } catch (err) {
      console.warn("Failed to format date:", dateString, err);
      return dateString; // Fallback
    }
  };

  // These helpers are likely used inside TransactionTable/TransactionDialog,
  // but kept here if needed directly or passed as props.
  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
      case 'OUT': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700';
      case 'ADJUSTMENT': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowDown className="h-4 w-4" />;
      case 'OUT': return <ArrowUp className="h-4 w-4" />;
      case 'ADJUSTMENT': return <Sliders className="h-4 w-4" />;
      default: return null;
    }
  };

  // --- Render Logic ---
  return (
    <>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-semibold">Inventory Transactions</h1>
          <Button onClick={handleAddNewClick}>
            <Plus className="h-4 w-4 mr-2" /> Add Transaction
          </Button>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Search Input */}
              <div>
                <label htmlFor="search-input" className="text-sm font-medium mb-1 block text-muted-foreground">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-input"
                    placeholder="Search Product, SKU, Reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              {/* Type Filter */}
              <div>
                <label htmlFor="type-select" className="text-sm font-medium mb-1 block text-muted-foreground">
                  Transaction Type
                </label>
                <Select
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <SelectTrigger id="type-select">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="IN">Stock In</SelectItem>
                    <SelectItem value="OUT">Stock Out</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Reset Button */}
              <div className="flex justify-end md:justify-start">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('ALL'); // Reset to 'ALL'
                  }}
                  className="w-full md:w-auto"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table Card */}
        <Card>
          <CardContent className="p-0">
            {/* Pass Corrected Props to TransactionTable */}
            <TransactionTable
              transactions={filteredTransactions} // Pass the filtered data
              isLoading={isLoading}
              isError={isError}
              error={queryError ?? undefined} // Pass error object or undefined
              onEdit={handleEditTransaction} // Pass the edit callback
              onDelete={handleDeleteTransaction} // Pass the delete callback
              // Pass helper functions if they are used inside TransactionTable
              formatDate={formatDate}
              getTransactionBadgeColor={getTransactionBadgeColor}
              getTransactionIcon={getTransactionIcon}
            />
          </CardContent>
        </Card>
      </div>

      {/* Transaction Dialog */}
      <TransactionDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSubmit={form.handleSubmit(onSubmit)} // Important: Wrap onSubmit
        form={form} // Pass the react-hook-form instance
        products={products} // Pass products list (needed for validation/lookup on create)
        isEditing={!!editingTransaction} // Determine mode based on state
      />
    </>
  );
};

export default Transactions;