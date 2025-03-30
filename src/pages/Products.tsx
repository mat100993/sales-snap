
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import ProductForm from '@/components/ProductForm';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { Plus, Package, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';

const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, searchProducts } = useData();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showOnlyWithImages, setShowOnlyWithImages] = useState(false);

  // Filter products based on search query and image filter
  const filteredProducts = searchQuery 
    ? searchProducts(searchQuery).filter(product => !showOnlyWithImages || product.imageUrl)
    : products.filter(product => !showOnlyWithImages || product.imageUrl);

  const handleAddProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    addProduct(product);
    setDialogOpen(false);
  };

  const handleUpdateProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, product);
      setEditingProduct(undefined);
      setDialogOpen(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  const handleEdit = (product: Product) => {
    if (isAdmin) {
      setEditingProduct(product);
      setDialogOpen(true);
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="Products" 
        description="Manage your product catalog"
        action={isAdmin ? {
          label: "Add Product",
          onClick: () => {
            setEditingProduct(undefined);
            setDialogOpen(true);
          },
          icon: <Package size={18} />
        } : undefined}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="w-full sm:max-w-lg">
          <SearchBar onSearch={setSearchQuery} placeholder="Search products by name, category, or tags..." />
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="image-filter"
            checked={showOnlyWithImages}
            onCheckedChange={setShowOnlyWithImages}
          />
          <label 
            htmlFor="image-filter" 
            className="text-sm font-medium flex items-center cursor-pointer"
          >
            <ImageIcon size={16} className="mr-1" />
            Show only with images
          </label>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || showOnlyWithImages
              ? "No products match your search criteria."
              : "You haven't added any products yet."}
          </p>
          {isAdmin && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={isAdmin ? handleDeleteProduct : undefined}
            />
          ))}
        </div>
      )}

      {/* Product Add/Edit Dialog - Only for Admin */}
      {isAdmin && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit' : 'Add'} Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              product={editingProduct}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Delete Dialog - Only for Admin */}
      {isAdmin && (
        <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product.
                Products that are used in quotations may cause issues if deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Layout>
  );
};

export default Products;
