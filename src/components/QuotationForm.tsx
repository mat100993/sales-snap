
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { Quotation } from '@/types';
import { quotationSchema, QuotationFormValues } from './quotation/quotationSchema';
import QuotationHeaderFields from './quotation/QuotationHeaderFields';
import QuotationItemFields from './quotation/QuotationItemFields';

interface QuotationFormProps {
  onSubmit: (data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  quotation?: Quotation;
  onCancel?: () => void;
}

const QuotationForm: React.FC<QuotationFormProps> = ({ 
  onSubmit, 
  quotation, 
  onCancel 
}) => {
  const { clients, products } = useData();
  const [total, setTotal] = useState(0);
  
  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      clientId: quotation?.clientId || '',
      items: quotation?.items || [{ productId: '', quantity: 1, price: 0 }],
      status: quotation?.status || 'draft',
    },
  });
  
  // Watch items for total calculation
  const watchedItems = form.watch('items');
  
  // Calculate total when items change
  useEffect(() => {
    const calculateTotals = () => {
      const itemSubtotal = watchedItems.reduce((sum, item) => {
        const lineTotal = item.price * item.quantity;
        const discountAmount = item.discount ? lineTotal * (item.discount / 100) : 0;
        return sum + (lineTotal - discountAmount);
      }, 0);
      
      setTotal(itemSubtotal);
    };
    
    calculateTotals();
  }, [watchedItems]);

  const handleSubmit = (data: QuotationFormValues) => {
    // Ensure all required properties are properly provided
    onSubmit({
      clientId: data.clientId,
      items: data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount
      })),
      status: data.status,
      total,
      createdBy: '1',
    });
  };
  
  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <QuotationHeaderFields clients={clients} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <QuotationItemFields products={products} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {quotation ? 'Update' : 'Create'} Quotation
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default QuotationForm;
