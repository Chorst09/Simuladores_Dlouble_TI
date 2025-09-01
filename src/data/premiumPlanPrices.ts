import { PremiumPlanPricing } from '../types';

/**
 * Premium PABX Plan Pricing Data
 * Contains pricing information for Essencial and Professional plans
 * with both Ilimitado (Unlimited) and Tarifado (Metered) billing types
 */
export const premiumPlanPrices: PremiumPlanPricing = {
  essencial: {
    ilimitado: {
      setup: {
        '10': 1400,
        '20': 2200,
        '30': 2700,
        '50': 3200,
        '100': 3700,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      monthly: {
        '10': 35,
        '20': 33,
        '30': 31,
        '50': 29,
        '100': 27,
        '500': 25,
        '1000': 23
      },
      hosting: {
        '10': 220,
        '20': 250,
        '30': 280,
        '50': 320,
        '100': 380,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      device: {
        '10': 40,
        '20': 38,
        '30': 36,
        '50': 34,
        '100': 32,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      }
    },
    tarifado: {
      setup: {
        '10': 1300,
        '20': 2100,
        '30': 2600,
        '50': 3100,
        '100': 3600,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      monthly: {
        '10': 32,
        '20': 30,
        '30': 28,
        '50': 26,
        '100': 24,
        '500': 22,
        '1000': 20
      },
      hosting: {
        '10': 200,
        '20': 230,
        '30': 260,
        '50': 300,
        '100': 360,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      device: {
        '10': 38,
        '20': 36,
        '30': 34,
        '50': 32,
        '100': 30,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      }
    }
  },
  professional: {
    ilimitado: {
      setup: {
        '10': 1600,
        '20': 2400,
        '30': 2900,
        '50': 3400,
        '100': 3900,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      monthly: {
        '10': 45,
        '20': 43,
        '30': 41,
        '50': 39,
        '100': 37,
        '500': 35,
        '1000': 33
      },
      hosting: {
        '10': 280,
        '20': 320,
        '30': 360,
        '50': 420,
        '100': 500,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      device: {
        '10': 50,
        '20': 48,
        '30': 46,
        '50': 44,
        '100': 42,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      }
    },
    tarifado: {
      setup: {
        '10': 1500,
        '20': 2300,
        '30': 2800,
        '50': 3300,
        '100': 3800,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      monthly: {
        '10': 42,
        '20': 40,
        '30': 38,
        '50': 36,
        '100': 34,
        '500': 32,
        '1000': 30
      },
      hosting: {
        '10': 260,
        '20': 300,
        '30': 340,
        '50': 400,
        '100': 480,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      device: {
        '10': 47,
        '20': 45,
        '30': 43,
        '50': 41,
        '100': 39,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      }
    }
  }
};