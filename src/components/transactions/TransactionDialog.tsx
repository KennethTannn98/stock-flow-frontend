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
// Keep these if the PARENT component uses them to create the 'form' prop
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const TransactionDialog = ({
  open,
  onClose,
  onSubmit,
  form, // The form instance created in the parent component
  products, // Keep if used elsewhere or passed by parent
  isEditing,
}) => {
  // Helper function to get today's date in YYYY-MM-DD format (local timezone)
  const getTodayDateString = () => {
    const today = new Date();
    // 'en-CA' locale reliably gives YYYY-MM-DD format
    return today.toLocaleDateString('en-CA');
  };

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

        {/* Form is passed from the parent */}
        <Form {...form}>
          {/* onSubmit is handled by the parent's form instance */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Product SKU Input */}
            <FormField
              control={form.control}
              name="productSku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product SKU</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product SKU"
                      {...field}
                      disabled={isEditing} // Keep SKU disabled when editing
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transaction Type Select */}
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // Use value prop for controlled component
                    defaultValue={field.value} // Can also use defaultValue if needed
                  >
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

            {/* Quantity Input */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1" // Ensure positive integer in HTML
                      placeholder="Enter quantity"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string, otherwise parse as int. Zod handles actual validation.
                        field.onChange(value === '' ? '' : parseInt(value, 10));
                      }}
                      // Value needs careful handling for type='number' and RHF
                      value={field.value ?? ''} // Use nullish coalescing for better empty handling
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference Input */}
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    {/* Ensure value is not null/undefined for the input */}
                    <Input placeholder="e.g., PO12345, SO6789" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transaction Date Input */}
            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      max={getTodayDateString()} // Add max attribute to prevent future dates in UI
                      {...field}
                      // Format value from ISO string (or Date) to YYYY-MM-DD for input
                      value={field.value ? new Date(field.value).toLocaleDateString('en-CA') : ''}
                      onChange={(e) => {
                        const dateString = e.target.value; // YYYY-MM-DD
                        if (dateString) {
                           // Convert to Date object (or keep as ISO string, depends on schema/backend)
                           // Using ISO string is common for consistency
                           const selectedDate = new Date(dateString + 'T12:00:00Z'); // Noon UTC avoids timezone shifts crossing date boundaries
                           field.onChange(selectedDate.toISOString()); // Store as ISO string
                        } else {
                          field.onChange(''); // Handle empty date
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage /> {/* Zod error message will appear here */}
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}> {/* Optionally disable during submit */}
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

// --- IMPORTANT: Add this validation in your PARENT component's Zod schema ---
/*
import * as z from 'zod';

// Define the end of today (local time) for comparison
const getEndOfToday = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

export const transactionFormSchema = z.object({
  productSku: z.string().min(1, 'Product SKU is required'),
  transactionType: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    required_error: 'Transaction type is required',
  }),
  // Ensure quantity is treated as a number and is positive
  quantity: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)), // Handle empty string
    z.number({ invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be a whole number')
      .positive('Quantity must be greater than 0')
  ),
  reference: z.string().optional(), // Or make required: .min(1, 'Reference is required')
  transactionDate: z.string() // Expecting ISO string from the input's onChange
    .min(1, 'Transaction date is required') // Check if it's not empty
    .refine((val) => !isNaN(Date.parse(val)), { // Check if it's a valid date string
      message: 'Invalid date format',
    })
    .refine((val) => new Date(val) <= getEndOfToday(), { // Check if date is not in the future
      message: 'Transaction date cannot be in the future',
    }),
});

// In your parent component where you use useForm:
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { transactionFormSchema } from './path/to/schema'; // Adjust path

// const form = useForm<z.infer<typeof transactionFormSchema>>({
//   resolver: zodResolver(transactionFormSchema),
//   defaultValues: {
//     productSku: '',
//     transactionType: undefined, // Or a default like 'IN'
//     quantity: '', // RHF prefers empty string for empty number input
//     reference: '',
//     transactionDate: new Date().toISOString(), // Default to today's ISO string
//     // ... other default values if needed ...
//   },
// });

*/