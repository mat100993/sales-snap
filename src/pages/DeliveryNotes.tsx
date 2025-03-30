
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DeliveryNote, Client, Product } from '@/types';
import { Plus, Search, Download, FileCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/SearchBar';

const DeliveryNotes: React.FC = () => {
  const { isAuthenticated, currentUser, isManager, isAdmin } = useAuth();
  const { clients, products } = useData();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<{productId: string, quantity: number}[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [currentProductId, setCurrentProductId] = useState<string>("");

  // Dialog confirm state
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [noteToApprove, setNoteToApprove] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [noteToReject, setNoteToReject] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please login to access this page.</p>
      </div>
    );
  }

  // Filter products based on search query
  const filteredProducts = productSearchQuery
    ? products.filter(product => 
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(productSearchQuery.toLowerCase()))
      )
    : products;
  
  // Filter delivery notes
  const filteredDeliveryNotes = searchQuery
    ? deliveryNotes.filter(note => {
        const client = clients.find(c => c.id === note.clientId);
        return (
          client && 
          `${client.name} ${client.surname} ${client.company}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      })
    : deliveryNotes;

  const handleAddDeliveryNote = () => {
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const newDeliveryNote: DeliveryNote = {
      id: Date.now().toString(),
      clientId: selectedClient,
      items: selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      status: 'pending',
      requestedBy: currentUser?.id || '',
      requestedAt: new Date(),
      notes: notes
    };

    setDeliveryNotes([...deliveryNotes, newDeliveryNote]);
    toast.success("Delivery note created successfully");
    
    // Reset form
    setSelectedItems([]);
    setSelectedClient("");
    setNotes("");
    setDialogOpen(false);
  };

  const handleAddItem = () => {
    if (!currentProductId) {
      toast.error("Please select a product");
      return;
    }

    if (productQuantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    const existingItemIndex = selectedItems.findIndex(item => item.productId === currentProductId);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += productQuantity;
      setSelectedItems(updatedItems);
    } else {
      // Add new product
      setSelectedItems([...selectedItems, {
        productId: currentProductId,
        quantity: productQuantity
      }]);
    }

    // Reset selection
    setCurrentProductId("");
    setProductQuantity(1);
    toast.info("Product added to delivery note");
  };

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const handleApprove = (id: string) => {
    setNoteToApprove(id);
    setConfirmDialog(true);
  };

  const handleReject = (id: string) => {
    setNoteToReject(id);
    setRejectDialog(true);
  };

  const confirmApprove = () => {
    if (noteToApprove) {
      setDeliveryNotes(
        deliveryNotes.map(note => 
          note.id === noteToApprove 
            ? { 
                ...note, 
                status: 'approved', 
                approvedBy: currentUser?.id,
                approvedAt: new Date() 
              } 
            : note
        )
      );
      toast.success("Delivery note approved");
      setNoteToApprove(null);
      setConfirmDialog(false);
    }
  };

  const confirmReject = () => {
    if (noteToReject) {
      setDeliveryNotes(
        deliveryNotes.map(note => 
          note.id === noteToReject 
            ? { ...note, status: 'rejected' } 
            : note
        )
      );
      toast.success("Delivery note rejected");
      setNoteToReject(null);
      setRejectDialog(false);
    }
  };

  const generateDeliveryNotePDF = (deliveryNote: DeliveryNote) => {
    const client = clients.find(c => c.id === deliveryNote.clientId);
    if (!client) {
      toast.error("Client not found");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 99, 235); // Blue color
    doc.text("DELIVERY NOTE", pageWidth/2, 30, { align: "center" });
    doc.setTextColor(0, 0, 0); // Reset to black

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SalesSnap, Inc.", margin, 45);
    doc.setFont("helvetica", "normal");
    doc.text("123 Business Avenue", margin, 52);
    doc.text("Business City, 12345", margin, 59);

    // Delivery Note info
    doc.setFont("helvetica", "bold");
    doc.text("Delivery Note Number:", 120, 45);
    doc.text("Date:", 120, 52);
    doc.text("Status:", 120, 59);
    doc.setFont("helvetica", "normal");
    doc.text(`DN-${deliveryNote.id}`, 170, 45);
    doc.text(format(new Date(deliveryNote.requestedAt), 'MMM dd, yyyy'), 170, 52);
    doc.text(deliveryNote.status.toUpperCase(), 170, 59);

    // Client info
    doc.setFont("helvetica", "bold");
    doc.text("Client Information:", margin, 75);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${client.name} ${client.surname}`, margin, 85);
    doc.text(`Company: ${client.company}`, margin, 92);
    doc.text(`Phone: ${client.phone}`, margin, 99);
    doc.text(`Email: ${client.email}`, margin, 106);

    // Items table header
    let y = 120;
    doc.setFillColor(240, 249, 255); // Light blue background
    doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Product", margin + 5, y + 6.5);
    doc.text("Quantity", 130, y + 6.5);

    // Items
    y += 10;
    doc.setFont("helvetica", "normal");

    deliveryNote.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        doc.text(product.name, margin + 5, y + 6.5);
        doc.text(item.quantity.toString(), 130, y + 6.5);
        y += 10;
      }
    });

    // Notes
    if (deliveryNote.notes) {
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(deliveryNote.notes, margin, y + 10);
    }

    // Signatures
    y = 230;
    doc.line(margin, y, margin + 70, y);
    doc.line(pageWidth - margin - 70, y, pageWidth - margin, y);
    
    doc.text("Client Signature", margin, y + 7);
    doc.text("Company Representative", pageWidth - margin - 70, y + 7);

    // Footer
    y = 250;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("This delivery note is for testing purposes only.", margin, y);
    doc.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, margin, y + 5);

    // Save the PDF
    doc.save(`DeliveryNote-${deliveryNote.id}.pdf`);
    toast.success("Delivery note PDF generated");
  };

  const getStatusBadge = (status: DeliveryNote['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500">Pending Approval</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-500">Delivered</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="Delivery Notes" 
        description="Request and manage delivery notes for testing products"
        action={{
          label: "New Delivery Note",
          onClick: () => setDialogOpen(true),
          icon: <Plus size={18} />
        }}
      />

      <div className="mb-6">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search by client name or company..." 
        />
      </div>

      {filteredDeliveryNotes.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No delivery notes found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "No delivery notes match your search criteria."
              : "You haven't created any delivery notes yet."}
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Delivery Note
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeliveryNotes.map(note => {
            const client = clients.find(c => c.id === note.clientId);
            const noteProducts = note.items.map(item => {
              const product = products.find(p => p.id === item.productId);
              return { ...item, productName: product?.name || 'Unknown Product' };
            });
            
            return (
              <Card key={note.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {client ? `${client.name} ${client.surname}` : 'Unknown Client'}
                      </h3>
                      <p className="text-sm text-gray-500">{client?.company}</p>
                      <div className="mt-2 flex gap-1">
                        {getStatusBadge(note.status)}
                        <Badge variant="outline">
                          {format(new Date(note.requestedAt), 'MMM dd, yyyy')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      {note.status === 'approved' && (
                        <Button size="sm" onClick={() => generateDeliveryNotePDF(note)}>
                          <Download className="mr-1 h-4 w-4" /> Download PDF
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Products:</h4>
                    <ul className="space-y-1">
                      {noteProducts.map((item, index) => (
                        <li key={index} className="text-sm flex justify-between">
                          <span>{item.productName}</span>
                          <span className="text-gray-500">Qty: {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {note.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Notes:</h4>
                      <p className="text-sm text-gray-600">{note.notes}</p>
                    </div>
                  )}

                  {/* Manager/Admin Approval Actions */}
                  {(isManager || isAdmin) && note.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleReject(note.id)}
                      >
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleApprove(note.id)}
                      >
                        <FileCheck className="mr-1 h-4 w-4" /> Approve
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Delivery Note Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Delivery Note</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={selectedClient}
                onValueChange={setSelectedClient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.surname} - {client.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Products</Label>
              <div className="flex space-x-2 mb-2">
                <Select
                  value={currentProductId}
                  onValueChange={setCurrentProductId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search products..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <Button type="button" onClick={handleAddItem}>Add</Button>
              </div>
              
              <div className="border rounded-md p-3">
                {selectedItems.length === 0 ? (
                  <p className="text-center text-gray-500">No products added yet</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedItems.map(item => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <li key={item.productId} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{product?.name}</span>
                            <span className="text-gray-500 ml-2">× {item.quantity}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(item.productId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any specific instructions or notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDeliveryNote}>
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Delivery Note</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the delivery note as approved and allow the PDF to be generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Delivery Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this delivery note?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReject}
              className="bg-red-500 hover:bg-red-600"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default DeliveryNotes;
