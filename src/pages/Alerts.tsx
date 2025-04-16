
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Clock,
  X,
  Check,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, getAlerts, updateAlert, deleteAlert, createAlert, AlertCreate, AlertUpdate } from '@/services/api';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState("unresolved");
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
      return format(parseISO(dateString), 'dd/MM/yy');
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

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="hidden md:table-cell">Updated</TableHead>
                <TableHead className="hidden md:table-cell">Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading alerts...
                  </TableCell>
                </TableRow>
              ) : filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No alerts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Badge 
                        variant={alert.resolved ? "outline" : "destructive"}
                        className="gap-1"
                      >
                        {alert.resolved ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Resolved
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3" />
                            Active
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.productName}</TableCell>
                    <TableCell>{alert.productSku}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDate(alert.createdDate)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDate(alert.updatedDate)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{alert.createdBy}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleToggleResolved(alert)}
                          >
                            {alert.resolved ? (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Mark as Unresolved
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Mark as Resolved
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
      </div>

      {/* Add Alert Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Alert</DialogTitle>
            <DialogDescription>
              Create a new alert for a product that needs attention.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product ID</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter product ID" {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productSku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product SKU" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Alert</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this alert? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Alerts;
