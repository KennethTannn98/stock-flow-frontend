import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  getUsers, 
  createUser, 
  updateUserRole, 
  deleteUser,
  UserCreate 
} from '@/services/api';
import { Plus, Users } from 'lucide-react';
import UserTable from '@/components/settings/UserTable';
import UserDialog from '@/components/settings/UserDialog';

const Settings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (user: UserCreate) => createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create user');
      console.error('Error creating user:', error);
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ username, role }: { username: string; role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER' }) => 
      updateUserRole(username, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
    },
  });

  const handleCreateUser = (userData: UserCreate) => {
    createUserMutation.mutate(userData);
  };

  const handleUpdateRole = (username: string, role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER') => {
    updateRoleMutation.mutate({ username, role });
  };

  const handleDeleteUser = (userId: number) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete !== null) {
      deleteUserMutation.mutate(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage users and system configuration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5" />
          User Management
        </div>
        <UserTable 
          users={users}
          isLoading={isLoading}
          onDeleteUser={handleDeleteUser}
          onUpdateRole={handleUpdateRole}
        />
      </div>

      <UserDialog 
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleCreateUser}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
