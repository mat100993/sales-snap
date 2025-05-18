
import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Minus } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency, VAT_RATE, calculateVAT } from '@/lib/utils';

interface QuotationItemFieldsProps {
  products: Product[];
}

const QuotationItemFields: React.FC<QuotationItemFieldsProps> = ({ products }) => {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch('items');

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

  // Calculate totals from items
  const subtotal = watchedItems.reduce((sum, item) => {
    const lineTotal = item.price * item.quantity;
    const discountAmount = item.discount ? lineTotal * (item.discount / 100) : 0;
    return sum + (lineTotal - discountAmount);
  }, 0);
  
  const vatAmount = calculateVAT(subtotal);
  const total = subtotal + vatAmount;

  return (
    <>
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
        <div className="flex justify-between">
          <span>Amount:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (15%):</span>
          <span>{formatCurrency(vatAmount)}</span>
        </div>
        <div className="font-semibold flex justify-between">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </>
  );
};

export default QuotationItemFields;
