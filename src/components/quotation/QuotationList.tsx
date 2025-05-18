
import React from 'react';
import { Quotation, Client, Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Send } from 'lucide-react';
import { QuotationStatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate, calculateVAT } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface QuotationListProps {
  quotations: Quotation[];
  clients: Client[];
  onEdit: (quotation: Quotation) => void;
  onDelete: (id: string) => void;
  onGeneratePDF: (quotation: Quotation) => void;
  onShareQuotation: (quotation: Quotation) => void;
}

const QuotationList: React.FC<QuotationListProps> = ({
  quotations,
  clients,
  onEdit,
  onDelete,
  onGeneratePDF,
  onShareQuotation,
}) => {
  if (quotations.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">No quotations found</h3>
        <p className="text-gray-500 mb-4">You haven't created any quotations yet.</p>
        <Button onClick={() => {}}>
          <FileText className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quotations.map(quotation => {
        const client = clients.find(c => c.id === quotation.clientId);
        const vatAmount = calculateVAT(quotation.total);
        const totalWithVAT = quotation.total + vatAmount;
        
        return (
          <Card key={quotation.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {client ? `${client.name} ${client.surname}` : 'Unknown Client'}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{client?.company}</p>
                </div>
                <QuotationStatusBadge status={quotation.status} />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Quotation #</p>
                  <p>{quotation.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p>{formatDate(quotation.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p>{formatCurrency(quotation.total)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total (inc. VAT)</p>
                  <p className="font-semibold">{formatCurrency(totalWithVAT)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex w-full justify-between items-center">
                <div className="flex items-center space-x-2">
                  <FileText className="text-gray-400" size={16} />
                  <span className="text-sm text-gray-500">
                    {quotation.items.length} item{quotation.items.length !== 1 && 's'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGeneratePDF(quotation)}
                  >
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-1" /> Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onShareQuotation(quotation)}>
                        Email to Client
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onShareQuotation(quotation)}>
                        Send via WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(quotation)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(quotation.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default QuotationList;
