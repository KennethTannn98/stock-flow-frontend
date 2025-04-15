
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Search, Filter, ArrowUpDown } from 'lucide-react';

// This is a placeholder component for future implementation
const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  // Placeholder empty state
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">View and manage your product inventory</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="gpu">GPU</SelectItem>
                <SelectItem value="cpu">CPU</SelectItem>
                <SelectItem value="mobo">Motherboard</SelectItem>
                <SelectItem value="ram">RAM</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
              <Button variant="outline">Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Products
              </CardTitle>
              <CardDescription>
                Manage your inventory products
              </CardDescription>
            </div>
            <Button>Add Product</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-accent p-3 mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No products to display</h3>
            <p className="text-muted-foreground text-center mb-4">
              Use the dashboard to navigate to low stock items or add new products
            </p>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>0</strong> of <strong>0</strong> products
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>
    </AppLayout>
  );
};

export default Inventory;
