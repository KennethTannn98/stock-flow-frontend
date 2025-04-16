
import { Filter, RefreshCcw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionFiltersProps {
  searchTerm: string;
  typeFilter: string;
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onResetFilters: () => void;
}

export default function TransactionFilters({ 
  searchTerm, 
  typeFilter,
  startDate,
  endDate,
  onSearchChange, 
  onTypeFilterChange,
  onStartDateChange,
  onEndDateChange,
  onResetFilters 
}: TransactionFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by product, reference..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Type</label>
            <Select 
              value={typeFilter} 
              onValueChange={onTypeFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="IN">Stock In</SelectItem>
                <SelectItem value="OUT">Stock Out</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">From Date</label>
            <Input 
              type="date" 
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-10"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">To Date</label>
            <Input 
              type="date" 
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="h-10"
            />
          </div>
          
          <div className="flex items-end md:col-span-4 justify-end">
            <Button 
              variant="outline" 
              onClick={onResetFilters}
              className="h-10"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
