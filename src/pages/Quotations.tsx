
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Plus, FileText, Search, Send, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QuotationForm } from '@/components';
import { QuotationStatusBadge } from '@/components/StatusBadge';
import { useData } from '@/context/DataContext';
import { Quotation } from '@/types';
import { formatCurrency, formatDate, generateQuotationPDF } from '@/lib/utils';
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const Quotations: React.FC = () => {
  const { quotations, clients, products, addQuotation, updateQuotation, deleteQuotation } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>(undefined);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter quotations based on search query
  const filteredQuotations = searchQuery
    ? quotations.filter(quotation => {
        const client = clients.find(c => c.id === quotation.clientId);
        return (
          client && 
          `${client.name} ${client.surname} ${client.company} ${quotation.id}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      })
    : quotations;

  const handleAddQuotation = (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    addQuotation(quotation);
    setDialogOpen(false);
  };

  const handleUpdateQuotation = (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingQuotation) {
      updateQuotation(editingQuotation.id, quotation);
      setEditingQuotation(undefined);
      setDialogOpen(false);
    }
  };

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setDialogOpen(true);
  };

  const handleDeleteQuotation = (id: string) => {
    setQuotationToDelete(id);
  };
  
  const confirmDelete = () => {
    if (quotationToDelete) {
      deleteQuotation(quotationToDelete);
      setQuotationToDelete(null);
    }
  };

  const handleGeneratePDF = (quotation: Quotation) => {
    const client = clients.find(c => c.id === quotation.clientId);
    if (!client) {
      toast.error("Client not found for this quotation");
      return;
    }
    
    const pdfBlob = generateQuotationPDF(quotation, client, products);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quotation-${quotation.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("PDF generated successfully");
  };

  const handleShareQuotation = (quotation: Quotation) => {
    const client = clients.find(c => c.id === quotation.clientId);
    if (!client) {
      toast.error("Client not found for this quotation");
      return;
    }

    // First, generate the PDF
    const pdfBlob = generateQuotationPDF(quotation, client, products);
    
    // Options for sharing
    if (navigator.share) {
      // Web Share API
      const file = new File([pdfBlob], `Quotation-${quotation.id}.pdf`, { type: 'application/pdf' });
      
      navigator.share({
        title: `Quotation for ${client.name} ${client.surname}`,
        text: `Here's your quotation from SalesSnap`,
        files: [file]
      }).catch(err => {
        console.error("Error sharing:", err);
        fallbackShare();
      });
    } else {
      fallbackShare();
    }
    
    function fallbackShare() {
      // Fallback for email
      const emailSubject = `Quotation for ${client.name} ${client.surname}`;
      const emailBody = `Dear ${client.name},\n\nPlease find attached your quotation. Thank you for your business.\n\nRegards,\nSalesSnap Team`;
      
      if (client.email) {
        const mailtoLink = `mailto:${client.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoLink);
        toast.success("Email client opened. Don't forget to attach the PDF!");
      } else {
        toast.error("Client email not available");
      }
      
      // For WhatsApp
      if (client.phone) {
        const whatsappLink = `https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(emailBody)}`;
        window.open(whatsappLink, '_blank');
        toast.success("WhatsApp opened. Don't forget to attach the PDF!");
      }
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="Quotations" 
        description="Create and manage client quotations"
        action={{
          label: "New Quotation",
          onClick: () => {
            setEditingQuotation(undefined);
            setDialogOpen(true);
          },
          icon: <Plus size={18} />
        }}
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search quotations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredQuotations.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No quotations found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "No quotations match your search criteria."
              : "You haven't created any quotations yet."}
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Quotation
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotations.map(quotation => {
            const client = clients.find(c => c.id === quotation.clientId);
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Quotation #</p>
                      <p>{quotation.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p>{formatDate(quotation.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-semibold">{formatCurrency(quotation.total)}</p>
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
                        onClick={() => handleGeneratePDF(quotation)}
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
                          <DropdownMenuItem onClick={() => handleShareQuotation(quotation)}>
                            Email to Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareQuotation(quotation)}>
                            Send via WhatsApp
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(quotation)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteQuotation(quotation.id)}
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
      )}

      {/* Quotation Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuotation ? 'Edit' : 'Create'} Quotation</DialogTitle>
          </DialogHeader>
          <QuotationForm
            onSubmit={editingQuotation ? handleUpdateQuotation : handleAddQuotation}
            quotation={editingQuotation}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={!!quotationToDelete} onOpenChange={() => setQuotationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this quotation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Quotations;
