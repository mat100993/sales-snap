
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone } from 'lucide-react';
import { Client } from '@/types';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onDelete }) => {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-lg mb-2">
          {client.name} {client.surname}
        </h3>
        <p className="text-gray-600 mb-4">{client.company}</p>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <a href={`tel:${client.phone}`} className="text-sm text-gray-700 hover:text-sales-600">
              {client.phone}
            </a>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            <a href={`mailto:${client.email}`} className="text-sm text-gray-700 hover:text-sales-600 break-all">
              {client.email}
            </a>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end space-x-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(client)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => onDelete(client.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClientCard;
