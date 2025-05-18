
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { QuotationForm } from '@/components';
import { Quotation } from '@/types';

interface QuotationDialogsProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  editingQuotation: Quotation | undefined;
  quotationToDelete: string | null;
  onQuotationToDeleteChange: (id: string | null) => void;
  onSubmit: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete: () => void;
}

const QuotationDialogs: React.FC<QuotationDialogsProps> = ({
  dialogOpen,
  onDialogOpenChange,
  editingQuotation,
  quotationToDelete,
  onQuotationToDeleteChange,
  onSubmit,
  onDelete,
}) => {
  return (
    <>
      {/* Quotation Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuotation ? 'Edit' : 'Create'} Quotation</DialogTitle>
            <DialogDescription>
              Create a quotation with VAT (15%) included in the total calculation.
            </DialogDescription>
          </DialogHeader>
          <QuotationForm
            onSubmit={onSubmit}
            quotation={editingQuotation}
            onCancel={() => onDialogOpenChange(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={!!quotationToDelete} onOpenChange={() => onQuotationToDeleteChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this quotation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuotationDialogs;
