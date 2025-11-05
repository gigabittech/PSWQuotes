import * as fs from 'fs';
import * as path from 'path';

const pricingDataPath = path.join(process.cwd(), 'pricing-data.json');
const data = JSON.parse(fs.readFileSync(pricingDataPath, 'utf-8'));

function generateSolarId(phase: string, brandKey: string, sizeKw: number): string {
  return `solar-${phase}-${brandKey}-${sizeKw}kw`.toLowerCase();
}

function generateInverterId(phase: string, brandKey: string, powerKw: number, modelId: string): string {
  return `inverter-${phase}-${brandKey}-${modelId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

function generateBatteryId(phase: string, brandKey: string, capacityKwh: number, index: number): string {
  return `battery-${phase}-${brandKey}-${capacityKwh}kwh-${index}`.toLowerCase().replace(/\./g, '-');
}

function generateEVChargerId(phase: string, brandKey: string, powerKw: number): string {
  return `ev-${phase}-${brandKey}-${powerKw}kw`.toLowerCase().replace(/\./g, '-');
}

// Process single_phase
if (data.single_phase) {
  // Solar panels
  if (data.single_phase.solar_panels) {
    for (const [brandKey, brandData] of Object.entries(data.single_phase.solar_panels as any)) {
      if (brandData.packages) {
        brandData.packages = brandData.packages.map((pkg: any) => ({
          id: generateSolarId('1ph', brandKey, pkg.size_kw),
          ...pkg
        }));
      }
    }
  }

  // Hybrid inverters
  if (data.single_phase.hybrid_inverters) {
    for (const [brandKey, brandData] of Object.entries(data.single_phase.hybrid_inverters as any)) {
      if (brandData.models) {
        brandData.models = brandData.models.map((model: any) => ({
          id: generateInverterId('1ph', brandKey, model.power_kw, model.model),
          ...model
        }));
      }
    }
  }

  // Batteries
  if (data.single_phase.batteries) {
    for (const [brandKey, brandData] of Object.entries(data.single_phase.batteries as any)) {
      if (brandData.options) {
        brandData.options = brandData.options.map((opt: any, index: number) => ({
          id: generateBatteryId('1ph', brandKey, opt.capacity_kwh, index),
          ...opt
        }));
      }
    }
  }

  // EV Chargers
  if (data.single_phase.ev_chargers) {
    for (const [brandKey, brandData] of Object.entries(data.single_phase.ev_chargers as any)) {
      if (brandData.options) {
        brandData.options = brandData.options.map((opt: any) => ({
          id: generateEVChargerId('1ph', brandKey, opt.power_kw),
          ...opt
        }));
      }
    }
  }
}

// Process three_phase
if (data.three_phase) {
  // Solar panels
  if (data.three_phase.solar_panels) {
    for (const [brandKey, brandData] of Object.entries(data.three_phase.solar_panels as any)) {
      if (brandData.packages) {
        brandData.packages = brandData.packages.map((pkg: any) => ({
          id: generateSolarId('3ph', brandKey, pkg.size_kw),
          ...pkg
        }));
      }
    }
  }

  // Hybrid inverters
  if (data.three_phase.hybrid_inverters) {
    for (const [brandKey, brandData] of Object.entries(data.three_phase.hybrid_inverters as any)) {
      if (brandData.models) {
        brandData.models = brandData.models.map((model: any) => ({
          id: generateInverterId('3ph', brandKey, model.power_kw, model.model),
          ...model
        }));
      }
    }
  }

  // Batteries
  if (data.three_phase.batteries) {
    for (const [brandKey, brandData] of Object.entries(data.three_phase.batteries as any)) {
      if (brandData.options) {
        brandData.options = brandData.options.map((opt: any, index: number) => ({
          id: generateBatteryId('3ph', brandKey, opt.capacity_kwh, index),
          ...opt
        }));
      }
    }
  }

  // EV Chargers
  if (data.three_phase.ev_chargers) {
    for (const [brandKey, brandData] of Object.entries(data.three_phase.ev_chargers as any)) {
      if (brandData.options) {
        brandData.options = brandData.options.map((opt: any) => ({
          id: generateEVChargerId('3ph', brandKey, opt.power_kw),
          ...opt
        }));
      }
    }
  }
}

// Write the updated data back to the file
fs.writeFileSync(pricingDataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ Successfully added unique IDs to all products in pricing-data.json');
