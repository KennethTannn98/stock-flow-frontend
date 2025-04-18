
import React from 'react';
import { User } from '@/services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Trash2 } from 'lucide-react';

interface UserTableProps {
  users: User[];
  onDeleteUser: (userId: number) => void;
  onUpdateRole: (username: string, role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER') => void;
  isLoading: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onDeleteUser,
  onUpdateRole,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="flex justify-center p-4">Loading users...</div>;
  }

  if (!users.length) {
    return <div className="text-center p-4">No users found.</div>;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
  
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created Date</TableHead>
          <TableHead>Updated Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell className="font-medium">{user.username}</TableCell>
            <TableCell>
              <Select
                value={user.role}
                onValueChange={(value: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER') => 
                  onUpdateRole(user.username, value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={user.role} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROLE_USER">User</SelectItem>
                  <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                  <SelectItem value="ROLE_MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{formatDate(user.createdDate)}</TableCell>
            <TableCell>{formatDate(user.updatedDate)}</TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteUser(user.id)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
