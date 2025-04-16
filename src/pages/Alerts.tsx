import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { 
  Search, 
  Plus, 
  Filter,
  RefreshCcw,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, getAlerts, updateAlert, deleteAlert, createAlert, AlertCreate, AlertUpdate } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
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
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <AppLayout>
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
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
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
            <AlertTable
              alerts={alerts}
              isLoading={isLoading}
              filteredAlerts={filteredAlerts}
              formatDate={formatDate}
              handleToggleResolved={handleToggleResolved}
              setSelectedAlert={setSelectedAlert}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            />
          </CardContent>
        </Card>
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
