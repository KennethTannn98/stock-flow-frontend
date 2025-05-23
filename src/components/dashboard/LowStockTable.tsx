
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LowStockProduct } from "@/services/api";

interface LowStockTableProps {
  products: LowStockProduct[];
}

const LowStockTable = ({ products }: LowStockTableProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Products that need to be reordered</CardDescription>
          </div>
          <Badge className="bg-red-500 hover:bg-red-600">{products.length} Items</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Reorder At</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">{product.quantity}</TableCell>
                <TableCell className="text-right">{product.reorder}</TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell>
  <Badge variant="secondary" className={
    product.quantity === 0 
      ? "bg-red-100 text-red-800 hover:bg-red-100 border-0" 
      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0"
  }>
    {product.quantity === 0 ? "OOS" : "Low"}
  </Badge>
</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LowStockTable;
