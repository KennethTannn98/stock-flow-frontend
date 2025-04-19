import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  Plus,
  RefreshCcw,
  Search,
  Sliders,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Transaction,
  TransactionCreate,
  Product,
  getTransactions,
  getProducts,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/services/api';

import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionDialog from '@/components/transactions/TransactionDialog';

const transactionSchema = z.object({
  productId: z.number().optional(),
  productSku: z.string().min(1, "Product SKU is required"),
  quantity: z.number({
    required_error: "Quantity is required",
    invalid_type_error: "Quantity must be a number",
  }).positive("Quantity must be positive").min(1, "Quantity must be at least 1"),
  transactionType: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    required_error: "Transaction type is required",
  }),
  reference: z.string().min(1, "Reference is required"),
  transactionDate: z.string().min(1, "Date is required")
      .refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  createdBy: z.string().min(1, "Creator name is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const Transactions: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading, isError, error: queryError } = useQuery<Transaction[], Error>({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });

  const { data: products = [] } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      productId: undefined,
      productSku: '',
      quantity: 1,
      transactionType: 'IN',
      reference: '',
      transactionDate: new Date().toISOString(),
      createdBy: 'admin',
    },
  });

  const createMutation = useMutation<Transaction, Error, TransactionCreate>({
    mutationFn: (newTransactionData) => createTransaction(newTransactionData),
    onSuccess: () => {
      toast.success('Transaction created successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      handleDialogClose();
    },
    onError: (err) => {
      toast.error(`Failed to create transaction: ${err.message}`);
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
    },
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: (id) => deleteTransaction(id),
    onSuccess: () => {
      toast.success('Transaction deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (err) => {
      toast.error(`Failed to delete transaction: ${err.message}`);
    },
  });

  const onSubmit = (values: TransactionFormData) => {
    const quantityAsNumber = Number(values.quantity);
    if (isNaN(quantityAsNumber)) {
        form.setError("quantity", { type: "manual", message: "Invalid number." });
        return;
    }

    const formattedDate = new Date(values.transactionDate).toISOString();

    const submissionBaseData = {
        ...values,
        quantity: quantityAsNumber,
        transactionDate: formattedDate,
    };

    if (editingTransaction) {
      const { productSku, productId, ...updateData } = submissionBaseData;
      updateMutation.mutate({
        id: editingTransaction.id,
        data: updateData,
      });
    } else {
      const selectedProduct = products.find(p => p.sku === values.productSku);
      if (!selectedProduct) {
        form.setError("productSku", { type: "manual", message: `Product SKU "${values.productSku}" not found.` });
        return;
      }

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
    form.reset();
  };

  const handleAddNewClick = () => {
    setEditingTransaction(null);
    form.reset();
    setOpenDialog(true);
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    form.reset({
      productId: transaction.productId,
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
    deleteMutation.mutate(id);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = typeFilter === 'ALL' || transaction.transactionType === typeFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      transaction.productName?.toLowerCase().includes(searchLower) ||
      transaction.reference?.toLowerCase().includes(searchLower) ||
      transaction.productSku?.toLowerCase().includes(searchLower);

    return matchesType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

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

  return (
    <>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Description */}
        <div className="flex flex-col gap-1 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">
              Manage inventory transactions including stock ins, outs, and adjustments.
            </p>
          </div>
          <Button onClick={handleAddNewClick}>
            <Plus className="h-4 w-4 mr-2" /> Add Transaction
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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

              <div className="flex justify-end md:justify-start">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('ALL');
                  }}
                  className="w-full md:w-auto"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Table */}
        <Card>
          <CardContent className="p-0">
            <TransactionTable
              transactions={filteredTransactions}
              isLoading={isLoading}
              isError={isError}
              error={queryError ?? undefined}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
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
        onSubmit={form.handleSubmit(onSubmit)}
        form={form}
        products={products}
        isEditing={!!editingTransaction}
      />
    </>
  );
};

export default Transactions;
