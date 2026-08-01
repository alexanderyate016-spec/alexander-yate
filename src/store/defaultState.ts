import { CasaBlancaStoreData, FinancialDistributionPlan } from '../types/store';

export function getDefaultDistributionPlan(): FinancialDistributionPlan {
  return {
    monthlyBaseIncome: 2000000,
    currency: 'COP',
    funds: [
      {
        id: 'fund_necesarios',
        name: 'Gastos Necesarios',
        percentage: 50,
        color: 'emerald',
        emoji: '🏠',
        categories: [
          {
            id: 'cat_transporte',
            name: 'Transporte',
            percentage: 40,
            emoji: '🚗',
            subcategories: [
              { id: 'sub_gasolina', name: 'Gasolina', percentage: 50, emoji: '⛽' },
              { id: 'sub_peajes', name: 'Peajes', percentage: 30, emoji: '🛣️' },
              { id: 'sub_parqueaderos', name: 'Parqueaderos', percentage: 20, emoji: '🅿️' }
            ]
          },
          {
            id: 'cat_alimentacion',
            name: 'Alimentación',
            percentage: 35,
            emoji: '🛒',
            subcategories: [
              { id: 'sub_mercado', name: 'Mercado', percentage: 70, emoji: '🥩' },
              { id: 'sub_restaurantes', name: 'Restaurantes', percentage: 30, emoji: '🍽️' }
            ]
          },
          {
            id: 'cat_servicios',
            name: 'Servicios Básicos',
            percentage: 25,
            emoji: '⚡',
            subcategories: [
              { id: 'sub_energia', name: 'Energía', percentage: 40, emoji: '💡' },
              { id: 'sub_agua', name: 'Agua', percentage: 30, emoji: '💧' },
              { id: 'sub_internet', name: 'Internet / Telefonía', percentage: 30, emoji: '📶' }
            ]
          }
        ]
      },
      {
        id: 'fund_personales',
        name: 'Gastos Personales',
        percentage: 30,
        color: 'amber',
        emoji: '🎟️',
        categories: [
          {
            id: 'cat_ocio',
            name: 'Ocio y Entretenimiento',
            percentage: 50,
            emoji: '🎬',
            subcategories: [
              { id: 'sub_cine', name: 'Cine y Salidas', percentage: 60, emoji: '🍿' },
              { id: 'sub_suscripciones', name: 'Suscripciones Streaming', percentage: 40, emoji: '📺' }
            ]
          },
          {
            id: 'cat_ropa',
            name: 'Ropa y Cuidado Personal',
            percentage: 30,
            emoji: '👔',
            subcategories: [
              { id: 'sub_vestuario', name: 'Vestuario y Calzado', percentage: 60, emoji: '👟' },
              { id: 'sub_barberia', name: 'Barbería / Estética', percentage: 40, emoji: '✂️' }
            ]
          },
          {
            id: 'cat_compras',
            name: 'Compras Varias & Hobbies',
            percentage: 20,
            emoji: '🛍️',
            subcategories: [
              { id: 'sub_tecnologia', name: 'Tecnología', percentage: 50, emoji: '📱' },
              { id: 'sub_regalos', name: 'Regalos / Varios', percentage: 50, emoji: '🎁' }
            ]
          }
        ]
      },
      {
        id: 'fund_ahorro',
        name: 'Ahorro e Inversión',
        percentage: 20,
        color: 'purple',
        emoji: '🏦',
        categories: [
          {
            id: 'cat_emergencia',
            name: 'Fondo de Emergencia',
            percentage: 50,
            emoji: '🛡️',
            subcategories: [
              { id: 'sub_reserva', name: 'Reserva Líquida', percentage: 100, emoji: '💵' }
            ]
          },
          {
            id: 'cat_inversiones_plan',
            name: 'Inversiones y Portafolio',
            percentage: 50,
            emoji: '📈',
            subcategories: [
              { id: 'sub_acciones', name: 'Acciones & ETFs', percentage: 60, emoji: '📊' },
              { id: 'sub_cripto', name: 'Cripto & Alternativos', percentage: 40, emoji: '🪙' }
            ]
          }
        ]
      }
    ]
  };
}

export function createInitialEmptyStore(): CasaBlancaStoreData {
  const now = new Date().toISOString();
  return {
    metadata: {
      schemaVersion: '1.0.0',
      createdAt: now,
      updatedAt: now,
      appVersion: '1.0.0'
    },
    settings: {
      theme: 'presidential',
      profileName: 'Alex',
      executiveHours: {
        start: '07:00',
        end: '22:00'
      }
    },
    security: {
      isSetupComplete: false,
      isLocked: false,
      profile: {
        name: 'Alex'
      },
      authentication: {
        passwordHash: null,
        recoveryQuestion: null,
        recoveryAnswerHash: null,
        createdAt: null,
        updatedAt: null
      },
      settings: {
        autoLock: true,
        lockTimeMinutes: 30
      },
      accessLogs: [],
      failedAttemptsCount: 0,
      lockoutUntil: null
    },
    crisis: {
      isCrisisActive: false,
      crisisLevel: 'high',
      emergencyContacts: [],
      protocols: [],
      events: [],
      decisions: []
    },
    crisisCenter: {
      isCrisisActive: false,
      crisisLevel: 'high',
      emergencyContacts: [],
      protocols: [],
      events: [],
      decisions: []
    },
    offices: {
      academica: {
        semesters: [],
        subjects: []
      },
      vidaDiaria: {
        habits: [],
        tasks: [],
        routines: [],
        objectives: [],
        timePlans: []
      },
      financiera: {
        accounts: [],
        categories: [
          { id: 'cat_vivienda', name: 'Vivienda', color: '#3B82F6', emoji: '🏠' },
          { id: 'cat_salud', name: 'Salud', color: '#10B981', emoji: '🏥' },
          { id: 'cat_transporte', name: 'Transporte', color: '#F59E0B', emoji: '🚗' },
          { id: 'cat_universidad', name: 'Universidad', color: '#8B5CF6', emoji: '🎓' },
          { id: 'cat_alimentacion', name: 'Alimentación', color: '#EF4444', emoji: '🍔' },
          { id: 'cat_ahorro', name: 'Ahorro', color: '#059669', emoji: '🏦' },
          { id: 'cat_inversion', name: 'Inversión', color: '#D97706', emoji: '📈' }
        ],
        transactions: [],
        budgets: [],
        distributionPlan: getDefaultDistributionPlan(),
        recurringExpenses: [],
        savings: [],
        investments: [],
        obligations: []
      },
      vidaSocial: {
        people: [],
        groups: [],
        interactions: [],
        commitments: [],
        specialDates: []
      },
      medica: {
        healthRecords: [],
        nutritionRecords: [],
        medications: [],
        appointments: [],
        medicalExams: [],
        conditions: [],
        immunizations: []
      },
      desarrolloPersonal: {
        direction: {
          purpose: '',
          vision: '',
          principles: []
        },
        characterAreas: [],
        journalEntries: [],
        personalHistory: [],
        philosophicalReflections: []
      }
    },
    executive: {}
  };
}
