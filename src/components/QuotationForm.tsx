
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Minus } from 'lucide-react';
import { Client, Product, Quotation } from '@/types';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/utils';

const quotationItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discount: z.number().min(0).max(100).optional(),
});

const quotationSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
  status: z.enum(['draft', 'sent', 'accepted', 'declined']),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

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
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Update price when product is selected
  const watchedItems = form.watch('items');
  
  // Calculate total when items change
  useEffect(() => {
    const calculateTotal = () => {
      return watchedItems.reduce((sum, item) => {
        const lineTotal = item.price * item.quantity;
        const discountAmount = item.discount ? lineTotal * (item.discount / 100) : 0;
        return sum + (lineTotal - discountAmount);
      }, 0);
    };
    
    setTotal(calculateTotal());
  }, [watchedItems]);

  const handleAddItem = () => {
    append({ productId: '', quantity: 1, price: 0 });
  };
  
  const handleProductChange = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.price`, product.price);
      form.setValue(`items.${index}.quantity`, 1);
    }
  };

  const handleSubmit = (data: QuotationFormValues) => {
    onSubmit({
      ...data,
      total,
      createdBy: '1', // In a real app, this would be the current user's ID
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel>Client</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} {client.surname} - {client.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium">Quotation Items</h3>
              <Button
                type="button"
                onClick={handleAddItem}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 mb-6 items-end">
                <div className="col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleProductChange(value, index);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id} disabled={product.stock === 0}>
                                {product.name} {product.stock === 0 && '(Out of stock)'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <div className="flex">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-r-none"
                            onClick={() => {
                              const currentValue = field.value || 0;
                              if (currentValue > 1) {
                                field.onChange(currentValue - 1);
                              }
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <FormControl>
                            <Input
                              className="rounded-none text-center"
                              type="number"
                              min="1"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-l-none"
                            onClick={() => {
                              const currentValue = field.value || 0;
                              field.onChange(currentValue + 1);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.discount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fields.length > 1 && remove(index)}
                    className="text-gray-500 hover:text-red-500"
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 text-right space-y-2">
              <div className="font-semibold flex justify-between">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
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
  );
};

export default QuotationForm;
