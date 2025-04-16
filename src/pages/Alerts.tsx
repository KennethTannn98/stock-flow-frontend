import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { 
  Search, 
  Plus, 
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, getAlerts, updateAlert, deleteAlert, createAlert, AlertCreate, AlertUpdate } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import AlertTable from '@/components/alerts/AlertTable';
import AlertDialog from '@/components/alerts/AlertDialog';

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('unresolved');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to delete alert');
      console.error('Error deleting alert:', error);
    },
  });

  // Form for creating alerts
  const form = useForm<AlertCreate>({
    defaultValues: {
      productId: 0,
      productSku: '',
      productName: '',
      resolved: false,
      createdBy: 'system',
      updatedBy: 'system',
    },
  });

  const onSubmit = (data: AlertCreate) => {
    createMutation.mutate(data);
  };

  // Toggle alert resolved status
  const handleToggleResolved = (alert: Alert) => {
    updateMutation.mutate({
      id: alert.id,
      alert: { 
        resolved: !alert.resolved,
        updatedBy: 'system'
      },
    });
  };

  // Delete alert confirmation
  const handleDelete = () => {
    if (selectedAlert) {
      deleteMutation.mutate(selectedAlert.id);
    }
  };

  // Filter alerts based on search query and status filter
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.productSku.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'resolved') return matchesSearch && alert.resolved;
    if (statusFilter === 'unresolved') return matchesSearch && !alert.resolved;
    
    return matchesSearch;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/mm/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Alerts</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Alert
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search alerts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="all">All Alerts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertTable
          alerts={alerts}
          isLoading={isLoading}
          filteredAlerts={filteredAlerts}
          formatDate={formatDate}
          handleToggleResolved={handleToggleResolved}
          setSelectedAlert={setSelectedAlert}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        />
      </div>

      <AlertDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={onSubmit}
        form={form}
      />
    </AppLayout>
  );
};

export default Alerts;
