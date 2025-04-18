import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { useForm } from 'react-hook-form'; // Keep if parent uses it
import { zodResolver } from '@hookform/resolvers/zod'; // Keep if parent uses it
import * as z from 'zod'; // Keep if parent uses it

const TransactionDialog = ({
  open,
  onClose,
  onSubmit,
  form,
  // products prop might not be needed anymore if not used elsewhere
  // but keeping it doesn't hurt if the parent component still passes it
  products,
  isEditing,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of the existing transaction.'
              : 'Create a new inventory transaction.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Changed Product SKU from Select to Input */}
            <FormField
              control={form.control}
              name="productSku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product SKU</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product SKU"
                      {...field} // Use spread operator for value, onChange, onBlur, etc.
                      disabled={isEditing} // Keep SKU disabled when editing
                    />
                  </FormControl>
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
                      // Ensure value passed to react-hook-form is a number
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string for clearing, otherwise parse as number
                        field.onChange(value === '' ? '' : parseInt(value, 10) || 0);
                      }}
                      // Ensure the input displays the correct value from the form state
                      value={field.value === 0 ? '0' : field.value || ''}
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
                    <Input
                      type="date"
                      {...field}
                      // Format value for the date input, handle potential undefined/null initial value
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        // Get date string (YYYY-MM-DD)
                        const dateString = e.target.value;
                        if (dateString) {
                           // Convert to Date object, setting time to noon UTC avoids timezone issues
                          const selectedDate = new Date(dateString + 'T12:00:00Z');
                           field.onChange(selectedDate.toISOString()); // Store as ISO string
                        } else {
                          field.onChange(''); // Handle empty date
                        }
                      }}
                    />
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;