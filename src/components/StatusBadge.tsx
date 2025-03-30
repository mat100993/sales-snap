
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Quotation, Product } from '@/types';

interface QuotationStatusBadgeProps {
  status: Quotation['status'];
}

export const QuotationStatusBadge: React.FC<QuotationStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'declined':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Badge className={`${getStatusStyles()} rounded-full`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

interface ProductStatusBadgeProps {
  status: Product['status'];
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-700';
      case 'out-of-stock':
        return 'bg-red-100 text-red-700';
      case 'on-command':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'in-stock':
        return 'In Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      case 'on-command':
        return 'On Command';
      default:
        return status;
    }
  };

  return (
    <Badge className={`${getStatusStyles()} rounded-full`}>
      {getStatusLabel()}
    </Badge>
  );
};
