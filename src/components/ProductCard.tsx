
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductStatusBadge } from './StatusBadge';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          <ProductStatusBadge status={product.status} />
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{product.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Price:</span>
            <span className="font-medium">{formatCurrency(product.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Category:</span>
            <span>{product.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Stock:</span>
            <span>{product.stock}</span>
          </div>
        </div>
        {product.tags && product.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {product.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end space-x-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
