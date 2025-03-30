
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Quotation, QuotationItem, Client, Product } from "@/types"
import jsPDF from "jspdf"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM dd, yyyy h:mm a');
}

export function generateQuotationPDF(
  quotation: Quotation,
  client: Client,
  products: Product[]
): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // Helper for centering text
  const centerText = (text: string, y: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    const textX = (pageWidth - textWidth) / 2;
    doc.text(text, textX, y);
  };
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(41, 99, 235); // Blue color
  centerText("QUOTATION", 30, 22);
  doc.setTextColor(0, 0, 0); // Reset to black
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("SalesSnap, Inc.", margin, 40);
  doc.setFont("helvetica", "normal");
  doc.text("123 Business Avenue", margin, 45);
  doc.text("Business City, 12345", margin, 50);
  doc.text("Phone: (123) 456-7890", margin, 55);
  doc.text("Email: sales@salessnap.com", margin, 60);
  
  // Quotation info
  doc.setFont("helvetica", "bold");
  doc.text("Quotation Number:", 120, 40);
  doc.text("Date:", 120, 45);
  doc.text("Status:", 120, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`Q-${quotation.id}`, 170, 40);
  doc.text(format(quotation.createdAt, 'MMM dd, yyyy'), 170, 45);
  doc.text(quotation.status.toUpperCase(), 170, 50);
  
  // Client info
  doc.setFont("helvetica", "bold");
  doc.text("Client Information:", margin, 75);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${client.name} ${client.surname}`, margin, 85);
  doc.text(`Company: ${client.company}`, margin, 90);
  doc.text(`Phone: ${client.phone}`, margin, 95);
  doc.text(`Email: ${client.email}`, margin, 100);
  
  // Items table header
  let y = 120;
  doc.setFillColor(240, 249, 255); // Light blue background
  doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Item", margin + 5, y + 6);
  doc.text("Quantity", 100, y + 6);
  doc.text("Unit Price", 130, y + 6);
  doc.text("Discount", 160, y + 6);
  doc.text("Total", 190, y + 6);
  
  // Items
  y += 10;
  doc.setFont("helvetica", "normal");
  
  quotation.items.forEach((item: QuotationItem) => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      const lineTotal = item.quantity * item.price;
      const discount = item.discount ? lineTotal * (item.discount / 100) : 0;
      const totalAfterDiscount = lineTotal - discount;
      
      doc.text(product.name, margin + 5, y + 6);
      doc.text(item.quantity.toString(), 100, y + 6);
      doc.text(formatCurrency(item.price), 130, y + 6);
      doc.text(item.discount ? `${item.discount}%` : '-', 160, y + 6);
      doc.text(formatCurrency(totalAfterDiscount), 190, y + 6);
      
      y += 10;
    }
  });
  
  // Total
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 160, y);
  doc.text(formatCurrency(quotation.total), 190, y);
  
  // Footer
  y = 250;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for your business. This quotation is valid for 30 days.", margin, y);
  doc.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, margin, y + 5);
  
  return doc.output('blob');
}
