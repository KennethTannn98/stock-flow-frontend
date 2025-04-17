
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import ChangePasswordDialog from '@/components/settings/ChangePasswordDialog';

const Settings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Manage users and system configuration</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordDialog />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Create, update, or delete user accounts
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </CardHeader>
          <CardContent>
            <UserTable 
              users={users}
              isLoading={isLoading}
              onDeleteUser={handleDeleteUser}
              onUpdateRole={handleUpdateRole}
            />
          </CardContent>
        </Card>
      </div>

      <UserDialog 
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};

export default Settings;
