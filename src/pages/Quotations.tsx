
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  QuotationList,
  QuotationSearch,
  QuotationDialogs
} from '@/components';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Quotation } from '@/types';
import { generateQuotationPDF } from '@/lib/utils';
import { toast } from "sonner";

const Quotations: React.FC = () => {
  const { quotations, clients, products, addQuotation, updateQuotation, deleteQuotation } = useData();
  const { currentUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>(undefined);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [includeImages, setIncludeImages] = useState(false);

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
    
    const salesName = currentUser ? currentUser.fullName : "Unknown";
    
    const pdfBlob = generateQuotationPDF(quotation, client, products, salesName, {
      includeImages: includeImages
    });
    
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Archemics_Quotation-${quotation.id}.pdf`;
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

    const salesName = currentUser ? currentUser.fullName : "Unknown";
    
    // First, generate the PDF
    const pdfBlob = generateQuotationPDF(quotation, client, products, salesName, {
      includeImages: includeImages
    });
    
    // Options for sharing
    if (navigator.share) {
      // Web Share API
      const file = new File([pdfBlob], `Archemics_Quotation-${quotation.id}.pdf`, { type: 'application/pdf' });
      
      navigator.share({
        title: `Quotation for ${client.name} ${client.surname}`,
        text: `Here's your quotation from Archemics Ltd.`,
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
      const emailSubject = `Quotation from Archemics Ltd. for ${client.name} ${client.surname}`;
      const emailBody = `Dear ${client.name},\n\nPlease find attached your quotation. Thank you for your business.\n\nRegards,\n${salesName}\nArchemics Ltd.`;
      
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

  const handleSubmit = (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingQuotation) {
      handleUpdateQuotation(quotation);
    } else {
      handleAddQuotation(quotation);
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

      <QuotationSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        includeImages={includeImages}
        onIncludeImagesChange={setIncludeImages}
      />

      <QuotationList 
        quotations={filteredQuotations}
        clients={clients}
        onEdit={handleEdit}
        onDelete={handleDeleteQuotation}
        onGeneratePDF={handleGeneratePDF}
        onShareQuotation={handleShareQuotation}
      />

      <QuotationDialogs
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen}
        editingQuotation={editingQuotation}
        quotationToDelete={quotationToDelete}
        onQuotationToDeleteChange={setQuotationToDelete}
        onSubmit={handleSubmit}
        onDelete={confirmDelete}
      />
    </Layout>
  );
};

export default Quotations;
