
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Quotation, QuotationItem, Client, Product } from "@/types"
import jsPDF from "jspdf"
import { format } from "date-fns"
import { useAuth } from "@/context/AuthContext"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MU', {
    style: 'currency',
    currency: 'MUR',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM dd, yyyy h:mm a');
}

// VAT rate for Mauritius (15%)
export const VAT_RATE = 0.15;

export function calculateVAT(amount: number): number {
  return amount * VAT_RATE;
}

export interface PDFOptions {
  includeImages?: boolean;
}

export function generateQuotationPDF(
  quotation: Quotation,
  client: Client,
  products: Product[],
  salesName: string,
  options?: PDFOptions
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
  
  // Add company logo
  const logoWidth = 40;
  const logoHeight = 20;
  const logoX = margin;
  const logoY = 15;
  doc.addImage("/lovable-uploads/4df45fc0-bb03-42d6-9c0e-5c021dcfb51f.png", "PNG", logoX, logoY, logoWidth, logoHeight);
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 160, 205); // Archemics blue color
  centerText("QUOTATION", 45, 22);
  doc.setTextColor(0, 0, 0); // Reset to black
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Archemics Ltd.", margin, 55);
  doc.setFont("helvetica", "normal");
  doc.text("Motorway M2, Bois Marchand,", margin, 60);
  doc.text("Terre Rouge 21401,", margin, 65);
  doc.text("Mauritius", margin, 70);
  doc.text("Phone: +230 248 3682", margin, 75);
  doc.text("Tel: +230 249 3191", margin, 80);
  doc.text("Email: info@archemics.mu", margin, 85);
  
  // Quotation info
  doc.setFont("helvetica", "bold");
  doc.text("Quotation Number:", 120, 55);
  doc.text("Date:", 120, 60);
  doc.text("Status:", 120, 65);
  doc.text("Sales Representative:", 120, 70);
  doc.setFont("helvetica", "normal");
  doc.text(`Q-${quotation.id}`, 170, 55);
  doc.text(format(quotation.createdAt, 'MMM dd, yyyy'), 170, 60);
  doc.text(quotation.status.toUpperCase(), 170, 65);
  doc.text(salesName, 170, 70);
  
  // Client info
  doc.setFont("helvetica", "bold");
  doc.text("Client Information:", margin, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${client.name} ${client.surname}`, margin, 110);
  doc.text(`Company: ${client.company}`, margin, 115);
  doc.text(`Phone: ${client.phone}`, margin, 120);
  doc.text(`Email: ${client.email}`, margin, 125);
  
  // Items table header
  let y = 145;
  doc.setFillColor(0, 160, 205, 0.2); // Light blue background
  doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Item", margin + 5, y + 6);
  doc.text("Quantity", 80, y + 6);
  doc.text("Unit Price", 105, y + 6);
  doc.text("VAT", 135, y + 6);
  doc.text("Discount", 155, y + 6);
  doc.text("Total", 180, y + 6);
  
  // Items
  y += 10;
  doc.setFont("helvetica", "normal");
  
  let itemsHeight = 0;
  const imageHeight = options?.includeImages ? 25 : 0;
  const rowHeight = options?.includeImages ? 35 : 10;
  
  let subtotal = 0;
  let vatTotal = 0;
  
  quotation.items.forEach((item: QuotationItem) => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      const lineTotal = item.quantity * item.price;
      const discount = item.discount ? lineTotal * (item.discount / 100) : 0;
      const lineTotalAfterDiscount = lineTotal - discount;
      const vat = calculateVAT(lineTotalAfterDiscount);
      
      subtotal += lineTotalAfterDiscount;
      vatTotal += vat;

      // Add product image if option is enabled and image exists
      if (options?.includeImages && product.imageUrl) {
        try {
          // Add product image (use a maximum width of 25 and height of 25)
          doc.addImage(product.imageUrl, "JPEG", margin + 5, y, 25, imageHeight);
        } catch (error) {
          console.error("Error adding image:", error);
        }
      }
      
      // Item details
      const textY = options?.includeImages ? y + 15 : y + 6;
      const productNameX = options?.includeImages ? margin + 35 : margin + 5;
      doc.text(product.name, productNameX, textY);
      doc.text(item.quantity.toString(), 80, textY);
      doc.text(formatCurrency(item.price), 105, textY);
      doc.text(formatCurrency(vat / item.quantity), 135, textY);
      doc.text(item.discount ? `${item.discount}%` : '-', 155, textY);
      doc.text(formatCurrency(lineTotalAfterDiscount), 180, textY);
      
      y += rowHeight;
      itemsHeight += rowHeight;
      
      // Add a new page if we're getting close to the bottom
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    }
  });
  
  // Total section
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  
  // Subtotal
  doc.setFont("helvetica", "normal");
  doc.text("Amount:", 135, y);
  doc.text(formatCurrency(subtotal), 180, y);
  y += 8;
  
  // VAT
  doc.text("VAT (15%):", 135, y);
  doc.text(formatCurrency(vatTotal), 180, y);
  y += 8;
  
  // Total
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 135, y);
  doc.text(formatCurrency(subtotal + vatTotal), 180, y);
  
  // Footer
  const footerY = Math.min(y + 30, 270);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for your business. This quotation is valid for 30 days.", margin, footerY);
  doc.text(`Generated by ${salesName} on ${format(new Date(), 'MMMM dd, yyyy')}`, margin, footerY + 5);
  
  return doc.output('blob');
}
