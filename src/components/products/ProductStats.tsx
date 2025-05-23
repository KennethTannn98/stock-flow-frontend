
import { Package, Tag, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Product } from '@/services/api';

interface ProductStatsProps {
  product: Product;
}

export const ProductStats = ({ product }: ProductStatsProps) => {
  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { 
      label: 'OOS', 
      className: 'bg-red-100 text-red-800 hover:bg-red-100 border-0' 
    };
    if (product.quantity <= product.reorder) return { 
      label: 'Low', 
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0' 
    };
    return { 
      label: 'Available', 
      className: 'bg-green-100 text-green-800 hover:bg-green-100 border-0' 
    };
  };

  const status = getStockStatus(product);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold">{product.quantity}</div>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground flex justify-between">
            <span>Reorder Point</span>
            <span>{product.reorder}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" /> Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-4">
            ${product.price.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground flex justify-between">
            <span>Total Value</span>
            <span>${(product.price * product.quantity).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SKU:</span>
            <span className="font-medium">{product.sku}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{product.category}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
