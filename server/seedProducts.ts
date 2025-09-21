import { storage } from "./storage";

export async function seedProducts() {
  console.log("Starting product seeding...");

  // Solar products
  const solarProducts = [
    {
      name: "6.6kW Solar System",
      type: "solar",
      category: "residential",
      capacity: "6.6kW",
      price: "7078.00",
      rebateEligible: true,
      rebateAmount: "2088.00",
      specifications: {
        panels: "15 × 440W Risen N-Type panels",
        inverter: "Premium string inverter",
        warranty: "15 years product, 25 years performance",
        generation: "~10,500 kWh annually",
        description: "Risen N-Type 440W panels with premium inverter"
      },
      warranty: "15 years",
      popular: true,
      active: true,
    },
    {
      name: "10kW Solar System", 
      type: "solar",
      category: "residential",
      capacity: "10kW",
      price: "9890.00",
      rebateEligible: true,
      rebateAmount: "3327.00",
      specifications: {
        panels: "21 × 475W Jinko Neo panels",
        inverter: "Hybrid-ready inverter",
        warranty: "25 years product and performance", 
        generation: "~15,900 kWh annually",
        description: "Jinko Neo 475W panels with hybrid-ready inverter"
      },
      warranty: "25 years",
      popular: false,
      active: true,
    },
    {
      name: "13kW Solar System",
      type: "solar", 
      category: "commercial",
      capacity: "13kW",
      price: "12990.00",
      rebateEligible: true,
      rebateAmount: "4159.00",
      specifications: {
        panels: "27 × 475W AIKO Neostar 3S panels",
        inverter: "Premium efficiency inverter",
        warranty: "25 years product and performance",
        generation: "~20,700 kWh annually", 
        description: "AIKO Neostar 3S 475W premium efficiency panels"
      },
      warranty: "25 years",
      popular: false,
      active: true,
    }
  ];

  // Battery products
  const batteryProducts = [
    {
      name: "Tesla Powerwall 3",
      type: "battery",
      category: "premium", 
      capacity: "13.5kWh",
      price: "10990.00",
      rebateEligible: false,
      rebateAmount: "0.00",
      specifications: {
        capacity: "13.5kWh usable",
        power: "11.5kW continuous",
        backup: "Whole home backup",
        integration: "Integrated inverter",
        description: "13.5kWh capacity with integrated inverter",
        premium: true
      },
      warranty: "10 years",
      popular: false,
      active: true,
    },
    {
      name: "Alpha ESS SMILE-M5",
      type: "battery",
      category: "value",
      capacity: "10.1kWh", 
      price: "9490.00",
      rebateEligible: true,
      rebateAmount: "3000.00",
      specifications: {
        capacity: "10.1kWh usable",
        power: "5kW continuous", 
        backup: "Essential loads backup",
        expandable: "Modular design",
        description: "10.1kWh modular lithium battery system"
      },
      warranty: "10 years",
      popular: true,
      active: true,
    },
    {
      name: "Sigenergy SigenStor",
      type: "battery",
      category: "high-capacity",
      capacity: "25.6kWh",
      price: "16990.00",
      rebateEligible: false,
      rebateAmount: "0.00", 
      specifications: {
        capacity: "25.6kWh usable",
        power: "10kW continuous",
        backup: "Whole home backup", 
        evReady: "EV charging compatible",
        description: "25.6kWh AC coupled battery system"
      },
      warranty: "10 years",
      popular: false,
      active: true,
    }
  ];

  // EV charger products
  const evProducts = [
    {
      name: "Tesla Wall Connector",
      type: "ev_charger",
      category: "tesla",
      capacity: "11kW",
      price: "2090.00", 
      rebateEligible: false,
      rebateAmount: "0.00",
      specifications: {
        power: "11kW",
        cable: "7.3m tethered cable",
        connector: "Type 2",
        smart: "WiFi enabled",
        description: "11kW, 7.3m cable"
      },
      warranty: "4 years",
      popular: false,
      active: true,
    },
    {
      name: "Fronius Wattpilot",
      type: "ev_charger",
      category: "universal",
      capacity: "22kW",
      price: "3290.00",
      rebateEligible: false,
      rebateAmount: "0.00",
      specifications: {
        power: "22kW (three-phase)",
        cable: "Untethered - bring your own cable", 
        connector: "Type 2 socket",
        smart: "App controlled, solar integration",
        description: "22kW, untethered"
      },
      warranty: "5 years", 
      popular: false,
      active: true,
    },
    {
      name: "GoodWe HCA",
      type: "ev_charger",
      category: "universal",
      capacity: "11kW",
      price: "2390.00",
      rebateEligible: false, 
      rebateAmount: "0.00",
      specifications: {
        power: "11kW",
        cable: "6m tethered cable",
        connector: "Type 2",
        smart: "App controlled",
        description: "11kW, 6m cable"
      },
      warranty: "3 years",
      popular: false,
      active: true,
    },
    {
      name: "Growatt Thor", 
      type: "ev_charger",
      category: "universal",
      capacity: "22kW",
      price: "2790.00",
      rebateEligible: false,
      rebateAmount: "0.00",
      specifications: {
        power: "22kW (three-phase)",
        cable: "5m tethered cable",
        connector: "Type 2",
        smart: "Basic controls",
        description: "22kW, 5m cable"
      },
      warranty: "3 years",
      popular: false, 
      active: true,
    }
  ];

  // Insert all products
  const allProducts = [...solarProducts, ...batteryProducts, ...evProducts];
  
  for (const product of allProducts) {
    try {
      await storage.createProduct(product as any);
      console.log(`✓ Created product: ${product.name}`);
    } catch (error) {
      console.log(`! Product ${product.name} may already exist, skipping...`);
    }
  }

  console.log("Product seeding completed!");
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProducts()
    .then(() => {
      console.log("Seeding finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
