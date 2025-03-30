
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
import { SampleRequest, Client, Product } from '@/types';
import { Plus, Search, Send, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/SearchBar';

const Samples: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { clients, products } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");

  // Dialog confirm state
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [sampleToApprove, setSampleToApprove] = useState<string | null>(null);

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
  
  // Filter sample requests
  const filteredSampleRequests = searchQuery
    ? sampleRequests.filter(request => {
        const client = clients.find(c => c.id === request.clientId);
        return (
          client && 
          `${client.name} ${client.surname} ${client.company}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      })
    : sampleRequests;

  const handleAddSampleRequest = () => {
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    const newSampleRequest: SampleRequest = {
      id: Date.now().toString(),
      productIds: [...selectedProducts],
      clientId: selectedClient,
      notes: notes,
      status: 'pending',
      requestedBy: currentUser?.id || '',
      requestedAt: new Date()
    };

    setSampleRequests([...sampleRequests, newSampleRequest]);
    toast.success("Sample request created successfully");
    
    // Reset form
    setSelectedProducts([]);
    setSelectedClient("");
    setNotes("");
    setDialogOpen(false);
    
    // Send email or WhatsApp notification (placeholder)
    const client = clients.find(c => c.id === selectedClient);
    toast.info(`Notification would be sent to lab for ${client?.name} ${client?.surname}'s sample request`);
  };

  const handleApprove = (id: string) => {
    setSampleToApprove(id);
    setConfirmDialog(true);
  };

  const confirmApprove = () => {
    if (sampleToApprove) {
      setSampleRequests(
        sampleRequests.map(req => 
          req.id === sampleToApprove 
            ? { 
                ...req, 
                status: 'approved', 
                approvedBy: currentUser?.id,
                approvedAt: new Date() 
              } 
            : req
        )
      );
      toast.success("Sample request approved");
      setSampleToApprove(null);
      setConfirmDialog(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const getStatusBadge = (status: SampleRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
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
        title="Sample Requests" 
        description="Request product samples for clients"
        action={{
          label: "New Sample Request",
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

      {filteredSampleRequests.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No sample requests found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "No sample requests match your search criteria."
              : "You haven't created any sample requests yet."}
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Sample Request
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSampleRequests.map(request => {
            const client = clients.find(c => c.id === request.clientId);
            const requestProducts = products.filter(p => 
              request.productIds.includes(p.id)
            );
            
            return (
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {client ? `${client.name} ${client.surname}` : 'Unknown Client'}
                      </h3>
                      <p className="text-sm text-gray-500">{client?.company}</p>
                      <div className="mt-2 flex gap-1">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline">
                          {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                        </Badge>
                      </div>
                    </div>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && 
                      request.status === 'pending' && (
                        <Button size="sm" onClick={() => handleApprove(request.id)}>
                          <FileCheck className="mr-1 h-4 w-4" /> Approve
                        </Button>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Requested Products:</h4>
                    <ul className="space-y-1">
                      {requestProducts.map(product => (
                        <li key={product.id} className="text-sm flex justify-between">
                          <span>{product.name}</span>
                          <span className="text-gray-500">{product.category}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {request.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Notes:</h4>
                      <p className="text-sm text-gray-600">{request.notes}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-3 border-t">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm text-gray-500">
                      Requested by: {currentUser?.fullName || 'Unknown User'}
                    </span>
                    <Button variant="outline" size="sm">
                      <Send className="mr-2 h-3 w-3" /> 
                      Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Sample Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Sample Request</DialogTitle>
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
              <div className="border rounded-md p-2">
                <div className="mb-3">
                  <Input
                    placeholder="Search products..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      className={`
                        p-2 rounded border cursor-pointer transition-colors
                        ${selectedProducts.includes(product.id) ? 
                          'bg-primary/10 border-primary' : 
                          'hover:bg-muted/50'
                        }
                      `}
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{product.name}</span>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-2 text-gray-500">No products found</div>
                  )}
                </div>
                {selectedProducts.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm text-gray-500">Selected: {selectedProducts.length} products</p>
                  </div>
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
            <Button onClick={handleAddSampleRequest}>
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Sample Request</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the sample request as approved and notify the laboratory to prepare the samples.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Samples;
