
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface TransactionTableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

const TransactionTableHeader = ({ sortConfig, onSort }: TransactionTableHeaderProps) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          onClick={() => onSort('productName')}
          className="cursor-pointer hover:bg-muted"
        >
          <div className="flex items-center">
            Product {getSortIcon('productName')}
          </div>
        </TableHead>
        <TableHead 
          onClick={() => onSort('transactionType')}
          className="cursor-pointer hover:bg-muted"
        >
          <div className="flex items-center">
            Type {getSortIcon('transactionType')}
          </div>
        </TableHead>
        <TableHead 
          onClick={() => onSort('quantity')}
          className="cursor-pointer hover:bg-muted"
        >
          <div className="flex items-center">
            Quantity {getSortIcon('quantity')}
          </div>
        </TableHead>
        <TableHead 
          onClick={() => onSort('reference')}
          className="hidden md:table-cell cursor-pointer hover:bg-muted"
        >
          <div className="flex items-center">
            Reference {getSortIcon('reference')}
          </div>
        </TableHead>
        <TableHead 
          onClick={() => onSort('transactionDate')}
          className="hidden md:table-cell cursor-pointer hover:bg-muted"
        >
          <div className="flex items-center">
            Transaction Date {getSortIcon('transactionDate')}
          </div>
        </TableHead>
        <TableHead 
          onClick={() => onSort('createdBy')}
          className="hidden md:table-cell cursor-pointer hover:bg-muted"
        >
          <div className="flex items-center">
            Created By {getSortIcon('createdBy')}
          </div>
        </TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TransactionTableHeader;
