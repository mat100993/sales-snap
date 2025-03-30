
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DocumentFile } from '@/types';
import { FileText, Upload, Download, Trash2, Search, FileIcon, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

const DocumentLibrary: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { products } = useData();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [documentType, setDocumentType] = useState<'TDS' | 'SDS'>('TDS');
  const [documentName, setDocumentName] = useState('');
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please login to access this page.</p>
      </div>
    );
  }

  const filteredDocuments = searchQuery
    ? documents.filter(doc => {
        const product = products.find(p => p.id === doc.productId);
        return (
          doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product && product.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
    : documents;

  const handleAddDocument = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    if (!documentName) {
      toast.error("Please enter a document name");
      return;
    }

    // In a real app, we'd handle the file upload here
    // For now, we'll just create a dummy document record

    const newDocument: DocumentFile = {
      id: Date.now().toString(),
      productId: selectedProduct,
      type: documentType,
      filename: documentName,
      fileUrl: '#', // In a real app, this would be the URL to the file
      uploadedAt: new Date()
    };

    setDocuments([...documents, newDocument]);
    toast.success("Document added successfully");
    
    // Reset form
    setSelectedProduct('');
    setDocumentType('TDS');
    setDocumentName('');
    setDialogOpen(false);
  };

  const handleDeleteDocument = (id: string) => {
    setFileToDelete(id);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      setDocuments(documents.filter(doc => doc.id !== fileToDelete));
      setFileToDelete(null);
      toast.success("Document deleted successfully");
    }
  };

  const handleDownload = (document: DocumentFile) => {
    // In a real app, this would download the actual file
    // For now, just show a toast
    toast.info(`Downloading ${document.filename}`);
  };

  const handleSendDocument = (document: DocumentFile) => {
    // In a real app, this would open a dialog to send the document
    // For now, just show a toast
    toast.info(`Preparing to send ${document.filename}`);
  };

  return (
    <Layout>
      <PageHeader 
        title="Document Library" 
        description="Technical Data Sheets (TDS) and Safety Data Sheets (SDS) for products"
        action={isAdmin ? {
          label: "Upload Document",
          onClick: () => setDialogOpen(true),
          icon: <Upload size={18} />
        } : undefined}
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search documents by name, type, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button 
          variant={searchQuery === '' ? "default" : "outline"} 
          size="sm"
          onClick={() => setSearchQuery('')}
        >
          All
        </Button>
        <Button 
          variant={searchQuery === 'TDS' ? "default" : "outline"} 
          size="sm"
          onClick={() => setSearchQuery('TDS')}
        >
          TDS
        </Button>
        <Button 
          variant={searchQuery === 'SDS' ? "default" : "outline"} 
          size="sm"
          onClick={() => setSearchQuery('SDS')}
        >
          SDS
        </Button>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No documents found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "No documents match your search criteria."
              : "No documents have been uploaded yet."}
          </p>
          {isAdmin && (
            <Button onClick={() => setDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => {
            const product = products.find(p => p.id === doc.productId);
            return (
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded">
                        <FileIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-base">
                          {doc.filename}
                        </h3>
                        <p className="text-sm text-gray-500">{product?.name}</p>
                      </div>
                    </div>
                    <Badge>{doc.type}</Badge>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Uploaded: {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-3 border-t flex justify-between">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>
                      <Download className="mr-1 h-4 w-4" /> Download
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleSendDocument(doc)}>
                      <FileText className="mr-1 h-4 w-4" /> Send
                    </Button>
                  </div>
                  {isAdmin && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Document Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <Select
                value={documentType}
                onValueChange={(value: 'TDS' | 'SDS') => setDocumentType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TDS">Technical Data Sheet (TDS)</SelectItem>
                  <SelectItem value="SDS">Safety Data Sheet (SDS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filename">Document Name</Label>
              <Input
                id="filename"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Product-A-TDS-v1.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Max file size: 5MB. Accepted formats: PDF, DOC, DOCX
              </p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument}>
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default DocumentLibrary;
