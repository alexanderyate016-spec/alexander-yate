import { CasaBlancaStoreData } from '../types/store';

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
