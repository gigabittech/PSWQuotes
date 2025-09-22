import { jsPDF } from "jspdf";
import type { Quote, Product } from "@shared/schema";
import { storage } from "./storage";

export async function generateQuotePDF(quote: Quote): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Fetch detailed product information
  const selectedProducts: { product: Product; type: string }[] = [];
  
  if (quote.solarPackage) {
    const product = await storage.getProduct(quote.solarPackage);
    if (product) selectedProducts.push({ product, type: 'solar' });
  }
  
  if (quote.batterySystem) {
    const product = await storage.getProduct(quote.batterySystem);
    if (product) selectedProducts.push({ product, type: 'battery' });
  }
  
  if (quote.evCharger) {
    const product = await storage.getProduct(quote.evCharger);
    if (product) selectedProducts.push({ product, type: 'ev' });
  }

  // Professional header with blue background
  doc.setFillColor(59, 130, 246); // Primary blue
  doc.rect(0, 0, 210, 35, 'F');
  
  // Company name in white
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("PERTH SOLAR WAREHOUSE", 20, 22);
  
  // Tagline
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Solar • Battery Storage • EV Charging Solutions", 20, 30);
  
  // Contact info in smaller box
  doc.setFillColor(45, 108, 206); // Darker blue
  doc.rect(0, 35, 210, 15, 'F');
  doc.setFontSize(9);
  doc.text("📞 (08) 6171 4111  |  ✉ info@perthsolarwarehouse.com.au  |  🏠 123 Solar Street, Perth WA 6000", 20, 44);
  doc.text("Licensed Electrical Contractor EC010771  |  ABN: 12 345 678 901", 20, 47);
  
  // Quote header section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SOLAR SYSTEM QUOTE", 20, 70);
  
  // Quote details box
  doc.setFillColor(248, 250, 252); // Light gray background
  doc.rect(20, 80, 170, 25, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(20, 80, 170, 25, 'S');
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Quote Details", 25, 88);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Quote ID: ${quote.id.split('-')[0].toUpperCase()}`, 25, 95);
  doc.text(`Issue Date: ${new Date(quote.createdAt).toLocaleDateString('en-AU')}`, 25, 100);
  doc.text(`Valid Until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU')}`, 100, 95);
  doc.text(`Status: ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}`, 100, 100);
  
  // Customer information section
  let yPos = 120;
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("CUSTOMER INFORMATION", 20, yPos);
  yPos += 10;
  
  // Customer details box
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPos, 170, 35, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(20, yPos, 170, 35, 'S');
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Name:", 25, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(quote.customerName, 50, yPos);
  
  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Email:", 25, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(quote.email, 50, yPos);
  
  if (quote.phone) {
    doc.setFont("helvetica", "bold");
    doc.text("Phone:", 105, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(quote.phone, 125, yPos);
  }
  
  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Address:", 25, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(quote.address, 55, yPos);
  
  yPos += 7;
  doc.text(`${quote.suburb}, ${quote.state} ${quote.postcode}`, 25, yPos);
  
  yPos += 15;
  
  // Selected systems section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("SELECTED SYSTEMS & PRODUCTS", 20, yPos);
  yPos += 10;
  
  // Power supply info
  doc.setFillColor(255, 248, 220); // Light yellow background
  doc.rect(20, yPos, 170, 12, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.rect(20, yPos, 170, 12, 'S');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`Property Power Supply: ${quote.powerSupply.charAt(0).toUpperCase() + quote.powerSupply.slice(1)} Phase`, 25, yPos + 8);
  yPos += 20;
  
  // Product details for each selected system
  for (const { product, type } of selectedProducts) {
    // Product header
    doc.setFillColor(240, 249, 255); // Light blue background
    doc.rect(20, yPos, 170, 8, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.rect(20, yPos, 170, 8, 'S');
    
    const typeLabels = { solar: '☀️ SOLAR POWER SYSTEM', battery: '🔋 BATTERY STORAGE', ev: '⚡ EV CHARGING STATION' };
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text(typeLabels[type as keyof typeof typeLabels] || `${type.toUpperCase()} SYSTEM`, 25, yPos + 6);
    yPos += 15;
    
    // Product details box
    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPos, 170, 25, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(20, yPos, 170, 25, 'S');
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(product.name, 25, yPos + 8);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Capacity: ${product.capacity}`, 25, yPos + 15);
    doc.text(`Warranty: ${product.warranty}`, 25, yPos + 20);
    
    // Specifications if available
    if (product.specifications && typeof product.specifications === 'object') {
      const specs = product.specifications as any;
      let specText = '';
      if (specs.efficiency) specText += `Efficiency: ${specs.efficiency} `;
      if (specs.inverter) specText += `Inverter: ${specs.inverter} `;
      if (specs.panels) specText += `Panels: ${specs.panels} `;
      if (specs.chemistry) specText += `Chemistry: ${specs.chemistry} `;
      if (specs.cable) specText += `Cable: ${specs.cable} `;
      
      if (specText) {
        doc.text(specText.trim(), 105, yPos + 15);
      }
    }
    
    // Price
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`$${parseFloat(product.price).toLocaleString()}`, 150, yPos + 20);
    
    yPos += 35;
  }
  
  yPos += 5;
  
  // Investment summary section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("INVESTMENT SUMMARY", 20, yPos);
  yPos += 10;
  
  // Pricing table
  const tableStartY = yPos;
  const tableWidth = 170;
  const rowHeight = 12;
  
  // Table header
  doc.setFillColor(59, 130, 246);
  doc.rect(20, yPos, tableWidth, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Description", 25, yPos + 8);
  doc.text("Amount", 160, yPos + 8);
  yPos += rowHeight;
  
  // Table rows
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  // System price row
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPos, tableWidth, rowHeight, 'F');
  doc.text("Total System Price", 25, yPos + 8);
  doc.text(`$${parseFloat(quote.totalPrice).toLocaleString()}`, 160, yPos + 8);
  yPos += rowHeight;
  
  // Rebates row
  doc.setFillColor(254, 242, 242);
  doc.rect(20, yPos, tableWidth, rowHeight, 'F');
  doc.text("Government Rebates & Incentives", 25, yPos + 8);
  doc.setTextColor(220, 38, 38); // Red for discount
  doc.text(`-$${parseFloat(quote.rebateAmount).toLocaleString()}`, 160, yPos + 8);
  yPos += rowHeight;
  
  // Final price row
  doc.setFillColor(34, 197, 94); // Green background
  doc.rect(20, yPos, tableWidth, rowHeight + 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("YOUR TOTAL INVESTMENT", 25, yPos + 9);
  doc.text(`$${parseFloat(quote.finalPrice).toLocaleString()}`, 160, yPos + 9);
  
  // Table border
  doc.setDrawColor(220, 220, 220);
  doc.rect(20, tableStartY, tableWidth, (rowHeight * 3) + 3, 'S');
  
  yPos += 25;
  
  // Add new page if needed
  if (yPos > 200) {
    doc.addPage();
    yPos = 30;
  }
  
  // Key benefits section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("WHY CHOOSE PERTH SOLAR WAREHOUSE?", 20, yPos);
  yPos += 12;
  
  const benefits = [
    "🏆 Award-winning solar specialists with 20+ years experience",
    "⚡ Professional installation by licensed electricians (EC010771)",
    "🛡️ Premium quality components with comprehensive warranties",
    "💎 4.9/5 star rating from over 1,500+ satisfied customers",
    "🚀 No pressure sales approach - honest, transparent service",
    "🏠 Local Perth business supporting Western Australian families",
    "📞 Ongoing support and maintenance services available",
    "💰 Competitive pricing with flexible payment options"
  ];
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  benefits.forEach(benefit => {
    doc.text(benefit, 25, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  
  // Terms and conditions
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPos, 170, 25, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(20, yPos, 170, 25, 'S');
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("IMPORTANT TERMS & CONDITIONS", 25, yPos + 6);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("• Quote valid for 30 days from issue date", 25, yPos + 12);
  doc.text("• Final pricing subject to site inspection and power supply confirmation", 25, yPos + 16);
  doc.text("• Installation includes standard mounting, electrical work, and commissioning", 25, yPos + 20);
  
  yPos += 35;
  
  // Footer section
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 280, 210, 17, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Ready to start your solar journey? Contact us today!", 20, 290);
  doc.setFont("helvetica", "normal");
  doc.text("📞 (08) 6171 4111  |  ✉ info@perthsolarwarehouse.com.au  |  🌐 www.perthsolarwarehouse.com.au", 20, 294);
  
  return Buffer.from(doc.output('arraybuffer'));
}
