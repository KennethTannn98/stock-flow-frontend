
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { Product } from '@/services/api';

interface ProductHeaderProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProductHeader = ({ product, onEdit, onDelete }: ProductHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <h1 className="text-2xl font-semibold mt-2">{product.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <Tag className="h-4 w-4" />
          <span>{product.sku}</span>
          <Badge variant="secondary">{product.category}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
};
