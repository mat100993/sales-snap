
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import ClientForm from '@/components/ClientForm';
import ClientCard from '@/components/ClientCard';
import SearchBar from '@/components/SearchBar';
import { Plus, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { Client } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const Clients: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Filter clients based on search query
  const filteredClients = searchQuery
    ? clients.filter(client =>
        `${client.name} ${client.surname} ${client.company} ${client.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : clients;

  const handleAddClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    addClient(client);
    setDialogOpen(false);
  };

  const handleUpdateClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    if (editingClient) {
      updateClient(editingClient.id, client);
      setEditingClient(undefined);
      setDialogOpen(false);
    }
  };

  const handleDeleteClient = (id: string) => {
    setClientToDelete(id);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
      setClientToDelete(null);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  return (
    <Layout>
      <PageHeader 
        title="Clients" 
        description="Manage your client database"
        action={{
          label: "Add Client",
          onClick: () => {
            setEditingClient(undefined);
            setDialogOpen(true);
          },
          icon: <UserPlus size={18} />
        }}
      />

      <div className="mb-6">
        <SearchBar onSearch={setSearchQuery} placeholder="Search clients..." />
      </div>

      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No clients found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "No clients match your search criteria."
              : "You haven't added any clients yet."}
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDeleteClient}
            />
          ))}
        </div>
      )}

      {/* Client Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit' : 'Add'} Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={editingClient ? handleUpdateClient : handleAddClient}
            client={editingClient}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              and any associated quotations.
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

export default Clients;
