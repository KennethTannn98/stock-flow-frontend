// Alerts.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  Search,
  Plus,
  // Filter, // Filter icon wasn't used, removed for clarity
  RefreshCcw,
  // Bell // Bell icon wasn't used, removed for clarity
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, getAlerts, updateAlert, deleteAlert, createAlert, AlertCreate, AlertUpdate } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import AlertTable from '@/components/alerts/AlertTable';
import AddAlertDialog from '@/components/alerts/AlertDialog'; // Renamed import for clarity, assuming AlertDialog.tsx is the Add dialog

// --- Import AlertDialog components for Delete ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
// --- End Import ---

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('unresolved');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete confirmation dialog

  const queryClient = useQueryClient();

  // Fetch alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
  });

  // Create alert mutation
  const createMutation = useMutation({
    mutationFn: (newAlert: AlertCreate) => createAlert(newAlert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert created successfully');
      setIsAddDialogOpen(false);
      form.reset(); // Reset form after successful creation
    },
    onError: (error) => {
      toast.error('Failed to create alert');
      console.error('Error creating alert:', error);
    },
  });

  // Update alert mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, alert }: { id: number; alert: AlertUpdate }) =>
      updateAlert(id, alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update alert');
      console.error('Error updating alert:', error);
    },
  });

  // Delete alert mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert deleted successfully');
      setIsDeleteDialogOpen(false); // Close the dialog on success
      setSelectedAlert(null); // Clear selected alert
    },
    onError: (error) => {
      toast.error('Failed to delete alert');
      console.error('Error deleting alert:', error);
      // Optionally keep the dialog open on error:
      // setIsDeleteDialogOpen(true);
    },
  });

  // Form for creating alerts
  const form = useForm<AlertCreate>({
    defaultValues: {
      productId: 0, // Should likely be dynamically set or handled server-side if SKU is primary key
      productSku: '',
      productName: '', // Should likely be fetched server-side based on SKU
      resolved: false,
      createdBy: 'system', // Consider replacing 'system' with actual logged-in user if available
      updatedBy: 'system', // Consider replacing 'system' with actual logged-in user if available
    },
  });

  const onSubmitAddAlert = (data: AlertCreate) => {
    // Potentially fetch productName/productId based on SKU before mutating
    // For now, assumes API handles this or they aren't strictly needed for creation via SKU
    createMutation.mutate({
      ...data,
      // Ensure default values are set if not provided by form (like resolved)
      resolved: data.resolved || false,
      createdBy: data.createdBy || 'system', // Replace 'system' with actual user context if possible
      updatedBy: data.updatedBy || 'system', // Replace 'system' with actual user context if possible
    });
  };

  // Toggle alert resolved status
  const handleToggleResolved = (alert: Alert) => {
    updateMutation.mutate({
      id: alert.id,
      alert: {
        resolved: !alert.resolved,
        updatedBy: 'system', // Replace 'system' with actual user context if possible
      },
    });
  };

  // Function to handle delete confirmation (called by the confirmation dialog)
  const handleDeleteConfirm = () => {
    if (selectedAlert) {
      deleteMutation.mutate(selectedAlert.id);
    }
  };

  // Filter alerts based on search query and status filter
  const filteredAlerts = alerts.filter((alert) => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    const matchesSearch =
      alert.productName?.toLowerCase().includes(lowerSearchQuery) || // Added null check
      alert.productSku?.toLowerCase().includes(lowerSearchQuery); // Added null check

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'resolved') return matchesSearch && alert.resolved;
    if (statusFilter === 'unresolved') return matchesSearch && !alert.resolved;

    return matchesSearch; // Default case (should be covered by 'all')
  });

  // Format date for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      // Attempt to parse as ISO string first
      const parsedDate = parseISO(dateString);
      return format(parsedDate, 'dd/MM/yyyy')
    } catch (e) {
      // If parsing fails, try creating a Date object directly (less reliable)
      try {
        const dateObj = new Date(dateString);
        // Check if the date object is valid
        if (!isNaN(dateObj.getTime())) {
          return format(dateObj, 'dd/MM/yyyy HH:mm');
        } else {
          return dateString; // Return original string if invalid
        }
      } catch (innerError) {
        return dateString; // Fallback to original string on any error
      }
    }
  };


  // This function is passed to AlertTable and called when the delete icon is clicked
  const handleDeleteAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDeleteDialogOpen(true); // Open the *confirmation* dialog
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Alerts</h1>
            <p className="text-muted-foreground">Monitor and manage inventory alerts</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Alert
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="alert-search" className="text-sm font-medium mb-1 block text-muted-foreground">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="alert-search"
                    placeholder="Search by Product Name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status-filter" className="text-sm font-medium mb-1 block text-muted-foreground">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="all">All Alerts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('unresolved');
                  }}
                  className="h-10 w-full md:w-auto" // Adjusted width for responsiveness
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <AlertTable
              alerts={alerts} // Pass original alerts for potential full list needs
              isLoading={isLoading}
              filteredAlerts={filteredAlerts} // Pass filtered list for display
              formatDate={formatDate}
              handleToggleResolved={handleToggleResolved}
              // Pass the function that opens the *delete confirmation* dialog
              setSelectedAlert={setSelectedAlert} // Keep this if AlertTable uses it directly elsewhere
              setIsDeleteDialogOpen={setIsDeleteDialogOpen} // Pass the setter for the delete dialog
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Adding Alerts */}
      <AddAlertDialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          form.reset(); // Reset form when closing manually too
        }}
        onSubmit={onSubmitAddAlert} // Use the specific handler for adding
        form={form}
      />

      {/* --- Delete Confirmation Dialog --- */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the alert
              for product SKU: <span className="font-semibold">{selectedAlert?.productSku ?? 'N/A'}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm} // Call the delete confirm handler
              disabled={deleteMutation.isPending} // Disable button while deleting
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Destructive styling
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* --- End Delete Confirmation Dialog --- */}
    </>
  );
};

export default Alerts;