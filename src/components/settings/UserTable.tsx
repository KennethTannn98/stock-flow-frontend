
import React, { useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Edit, Trash2, Search, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const itemsPerPage = 10;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
  
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  const filteredAndSortedUsers = useMemo(() => {
    if (isLoading) return [];

    let filtered = [...users];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = sortConfig.key === 'createdDate' || sortConfig.key === 'updatedDate'
          ? new Date(a[sortConfig.key] || '').getTime()
          : a[sortConfig.key as keyof User];
        const bValue = sortConfig.key === 'createdDate' || sortConfig.key === 'updatedDate'
          ? new Date(b[sortConfig.key] || '').getTime()
          : b[sortConfig.key as keyof User];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchQuery, roleFilter, sortConfig, isLoading]);

  const paginatedUsers = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredAndSortedUsers.slice(start, start + itemsPerPage);
  }, [filteredAndSortedUsers, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4" /> 
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading users...</div>;
  }

  if (!users.length) {
    return <div className="text-center p-4">No users found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ROLE_USER">User</SelectItem>
              <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
              <SelectItem value="ROLE_MANAGER">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                onClick={() => handleSort('username')}
                className="cursor-pointer hover:bg-muted"
              >
                <div className="flex items-center">
                  Username {getSortIcon('username')}
                </div>
              </TableHead>
              <TableHead 
                onClick={() => handleSort('role')}
                className="cursor-pointer hover:bg-muted"
              >
                <div className="flex items-center">
                  Role {getSortIcon('role')}
                </div>
              </TableHead>
              <TableHead 
                onClick={() => handleSort('createdDate')}
                className="cursor-pointer hover:bg-muted"
              >
                <div className="flex items-center">
                  Created Date {getSortIcon('createdDate')}
                </div>
              </TableHead>
              <TableHead 
                onClick={() => handleSort('updatedDate')}
                className="cursor-pointer hover:bg-muted"
              >
                <div className="flex items-center">
                  Updated Date {getSortIcon('updatedDate')}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-center py-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                    className={cn(
                      currentPage === 0 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i)}
                      isActive={currentPage === i}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => 
                      Math.min(prev + 1, totalPages - 1)
                    )}
                    className={cn(
                      currentPage >= totalPages - 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
