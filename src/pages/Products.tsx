
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import ProductForm from '@/components/ProductForm';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { Plus, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { Product } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, searchProducts } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Filter products based on search query
  const filteredProducts = searchQuery ? searchProducts(searchQuery) : products;

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
    setEditingProduct(product);
    setDialogOpen(true);
  };

  return (
    <Layout>
      <PageHeader 
        title="Products" 
        description="Manage your product catalog"
        action={{
          label: "Add Product",
          onClick: () => {
            setEditingProduct(undefined);
            setDialogOpen(true);
          },
          icon: <Package size={18} />
        }}
      />

      <div className="mb-6">
        <SearchBar onSearch={setSearchQuery} placeholder="Search products by name, category, or tags..." />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "No products match your search criteria."
              : "You haven't added any products yet."}
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}

      {/* Product Add/Edit Dialog */}
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

      {/* Confirm Delete Dialog */}
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
    </Layout>
  );
};

export default Products;
