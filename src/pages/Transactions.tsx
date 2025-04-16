
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionForm from '@/components/transactions/TransactionForm';

const Transactions = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
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

  // Handle form submission
  const onSubmit = (values: any) => {
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
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setOpenDialog(true);
  };

  // Handle delete transaction
  const handleDeleteTransaction = (transaction: Transaction) => {
    if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      deleteMutation.mutate(transaction.id);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Apply type filter if set
    const matchesType = !typeFilter || transaction.transactionType === typeFilter;
    
    // Apply search term to product name, reference, or SKU
    const matchesSearch = !searchTerm || 
      transaction.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.productSku.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply date filters
    let matchesDates = true;
    if (startDate) {
      const transactionDate = new Date(transaction.transactionDate);
      const filterStartDate = new Date(startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      matchesDates = matchesDates && transactionDate >= filterStartDate;
    }
    
    if (endDate) {
      const transactionDate = new Date(transaction.transactionDate);
      const filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      matchesDates = matchesDates && transactionDate <= filterEndDate;
    }
    
    return matchesType && matchesSearch && matchesDates;
  });

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Transaction
          </Button>
        </div>

        <TransactionFilters 
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          startDate={startDate}
          endDate={endDate}
          onSearchChange={setSearchTerm}
          onTypeFilterChange={setTypeFilter}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onResetFilters={handleResetFilters}
        />

        <Card>
          <CardContent className="p-0">
            <TransactionTable 
              transactions={filteredTransactions}
              isLoading={isLoading}
              error={isError ? (error instanceof Error ? error : new Error('Unknown error')) : null}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
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

          <TransactionForm 
            products={products}
            onSubmit={onSubmit}
            onClose={handleDialogClose}
            initialValues={editingTransaction || undefined}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Transactions;
