import { jsPDF } from "jspdf";
import type { Quote } from "@shared/schema";

export async function generateQuotePDF(quote: Quote): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Company header
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Primary blue
  doc.text("Perth Solar Warehouse", 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Solar • Battery • EV Charging Solutions", 20, 40);
  doc.text("Phone: (08) 6171 4111", 20, 50);
  doc.text("Email: info@perthsolarwarehouse.com.au", 20, 60);
  
  // Quote details
  doc.setFontSize(18);
  doc.text("Solar System Quote", 20, 80);
  
  doc.setFontSize(12);
  doc.text(`Quote ID: ${quote.id}`, 20, 95);
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 20, 105);
  
  // Customer information
  doc.setFontSize(14);
  doc.text("Customer Information", 20, 125);
  doc.setFontSize(12);
  doc.text(`Name: ${quote.customerName}`, 20, 140);
  doc.text(`Email: ${quote.email}`, 20, 150);
  if (quote.phone) {
    doc.text(`Phone: ${quote.phone}`, 20, 160);
  }
  doc.text(`Address: ${quote.address}`, 20, 170);
  doc.text(`${quote.suburb}, ${quote.state} ${quote.postcode}`, 20, 180);
  
  // System details
  doc.setFontSize(14);
  doc.text("Selected Systems", 20, 200);
  doc.setFontSize(12);
  
  let yPos = 215;
  
  if (quote.selectedSystems.includes('solar')) {
    doc.text(`✓ Solar Power System: ${quote.solarPackage || 'Selected'}`, 25, yPos);
    yPos += 10;
  }
  
  if (quote.selectedSystems.includes('battery')) {
    doc.text(`✓ Battery Storage: ${quote.batterySystem || 'Selected'}`, 25, yPos);
    yPos += 10;
  }
  
  if (quote.selectedSystems.includes('ev')) {
    doc.text(`✓ EV Charger: ${quote.evCharger || 'Selected'}`, 25, yPos);
    yPos += 10;
  }
  
  doc.text(`Power Supply: ${quote.powerSupply}`, 25, yPos);
  yPos += 20;
  
  // Pricing summary
  doc.setFontSize(14);
  doc.text("Investment Summary", 20, yPos);
  yPos += 15;
  
  doc.setFontSize(12);
  doc.text(`Total System Price: $${parseFloat(quote.totalPrice).toLocaleString()}`, 25, yPos);
  yPos += 10;
  doc.text(`Rebates & Incentives: -$${parseFloat(quote.rebateAmount).toLocaleString()}`, 25, yPos);
  yPos += 10;
  
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text(`Final Investment: $${parseFloat(quote.finalPrice).toLocaleString()}`, 25, yPos);
  
  // Benefits section
  yPos += 25;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Key Benefits", 20, yPos);
  yPos += 15;
  
  doc.setFontSize(12);
  doc.text("✓ Professional installation by certified electricians", 25, yPos);
  yPos += 10;
  doc.text("✓ Premium quality components with manufacturer warranties", 25, yPos);
  yPos += 10;
  doc.text("✓ No pressure sales - hassle-free guarantee", 25, yPos);
  yPos += 10;
  doc.text("✓ Local Western Australian business with 20+ years experience", 25, yPos);
  yPos += 10;
  doc.text("✓ 4.9/5 star rating from 1500+ customer reviews", 25, yPos);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text("This quote is valid for 30 days. Terms and conditions apply.", 20, 280);
  doc.text("Perth Solar Warehouse - Licensed Electrical Contractor EC010771", 20, 290);
  
  return Buffer.from(doc.output('arraybuffer'));
}
