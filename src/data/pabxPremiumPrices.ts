// PABX Premium Pricing Data based on the provided screenshots
// Organized by contract period (24 and 36 months) and plan type

export interface PremiumPlanData {
  withEquipment: number;
  withoutEquipment: number;
}

export interface PremiumPlanPrices {
  '2-9': PremiumPlanData;
  '10-19': PremiumPlanData;
  '20-49': PremiumPlanData;
  '50-99': PremiumPlanData;
  '100-199': PremiumPlanData;
  '200+': PremiumPlanData;
}

export interface ContractPeriodPrices {
  essencialIlimitado: PremiumPlanPrices;
  essencialTarifado: PremiumPlanPrices;
  professionalIlimitado: PremiumPlanPrices;
  professionalTarifado: PremiumPlanPrices;
}

export const pabxPremiumPrices: {
  '24': ContractPeriodPrices;
  '36': ContractPeriodPrices;
} = {
  '24': {
    essencialIlimitado: {
      '2-9': { withEquipment: 84, withoutEquipment: 75 },
      '10-19': { withEquipment: 65, withoutEquipment: 57 },
      '20-49': { withEquipment: 62, withoutEquipment: 54 },
      '50-99': { withEquipment: 59, withoutEquipment: 52 },
      '100-199': { withEquipment: 55, withoutEquipment: 48 },
      '200+': { withEquipment: 52, withoutEquipment: 45 }
    },
    essencialTarifado: {
      '2-9': { withEquipment: 59, withoutEquipment: 44 },
      '10-19': { withEquipment: 49, withoutEquipment: 34 },
      '20-49': { withEquipment: 38, withoutEquipment: 30 },
      '50-99': { withEquipment: 34, withoutEquipment: 27 },
      '100-199': { withEquipment: 32, withoutEquipment: 25 },
      '200+': { withEquipment: 32, withoutEquipment: 25 }
    },
    professionalIlimitado: {
      '2-9': { withEquipment: 104, withoutEquipment: 95 },
      '10-19': { withEquipment: 77, withoutEquipment: 72 },
      '20-49': { withEquipment: 73, withoutEquipment: 68 },
      '50-99': { withEquipment: 69, withoutEquipment: 66 },
      '100-199': { withEquipment: 65, withoutEquipment: 62 },
      '200+': { withEquipment: 62, withoutEquipment: 55 }
    },
    professionalTarifado: {
      '2-9': { withEquipment: 79, withoutEquipment: 64 },
      '10-19': { withEquipment: 59, withoutEquipment: 44 },
      '20-49': { withEquipment: 51, withoutEquipment: 36 },
      '50-99': { withEquipment: 39, withoutEquipment: 32 },
      '100-199': { withEquipment: 35, withoutEquipment: 28 },
      '200+': { withEquipment: 35, withoutEquipment: 28 }
    }
  },
  '36': {
    essencialIlimitado: {
      '2-9': { withEquipment: 77, withoutEquipment: 71 },
      '10-19': { withEquipment: 59, withoutEquipment: 53 },
      '20-49': { withEquipment: 56, withoutEquipment: 48 },
      '50-99': { withEquipment: 53, withoutEquipment: 44 },
      '100-199': { withEquipment: 48, withoutEquipment: 40 },
      '200+': { withEquipment: 45, withoutEquipment: 38 }
    },
    essencialTarifado: {
      '2-9': { withEquipment: 57, withoutEquipment: 42 },
      '10-19': { withEquipment: 47, withoutEquipment: 32 },
      '20-49': { withEquipment: 36, withoutEquipment: 28 },
      '50-99': { withEquipment: 32, withoutEquipment: 25 },
      '100-199': { withEquipment: 30, withoutEquipment: 23 },
      '200+': { withEquipment: 30, withoutEquipment: 23 }
    },
    professionalIlimitado: {
      '2-9': { withEquipment: 97, withoutEquipment: 91 },
      '10-19': { withEquipment: 73, withoutEquipment: 69 },
      '20-49': { withEquipment: 69, withoutEquipment: 66 },
      '50-99': { withEquipment: 65, withoutEquipment: 63 },
      '100-199': { withEquipment: 60, withoutEquipment: 59 },
      '200+': { withEquipment: 57, withoutEquipment: 52 }
    },
    professionalTarifado: {
      '2-9': { withEquipment: 75, withoutEquipment: 60 },
      '10-19': { withEquipment: 57, withoutEquipment: 42 },
      '20-49': { withEquipment: 49, withoutEquipment: 34 },
      '50-99': { withEquipment: 37, withoutEquipment: 30 },
      '100-199': { withEquipment: 33, withoutEquipment: 26 },
      '200+': { withEquipment: 33, withoutEquipment: 26 }
    }
  }
};