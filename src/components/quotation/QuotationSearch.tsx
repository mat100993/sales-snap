
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ImageIcon } from 'lucide-react';

interface QuotationSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  includeImages: boolean;
  onIncludeImagesChange: (include: boolean) => void;
}

const QuotationSearch: React.FC<QuotationSearchProps> = ({
  searchQuery,
  onSearchChange,
  includeImages,
  onIncludeImagesChange,
}) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search quotations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="include-images" 
          checked={includeImages}
          onCheckedChange={onIncludeImagesChange}
        />
        <label 
          htmlFor="include-images" 
          className="text-sm font-medium flex items-center cursor-pointer"
        >
          <ImageIcon size={16} className="mr-1" />
          Include product images in PDF
        </label>
      </div>
    </div>
  );
};

export default QuotationSearch;
