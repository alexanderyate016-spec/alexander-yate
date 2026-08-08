import { CasaBlancaStoreData, FinancialDistributionPlan } from '../types/store';

export function getDefaultDistributionPlan(): FinancialDistributionPlan {
  return {
    incomeBaseMode: 'calculated',
    monthlyBaseIncome: undefined,
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
        semesters: [
          {
            id: 'sem_2026_2',
            name: 'Semestre 2026-II',
            startDate: '2026-08-01',
            endDate: '2026-11-30',
            isActive: true
          }
        ],
        subjects: [
          {
            id: 'sub_anat_01',
            semesterId: 'sem_2026_2',
            name: 'Anatomía Humana',
            professor: 'Dr. Pérez, Dra. Gómez, Dr. Rodríguez',
            color: '#8B5CF6',
            classroom: 'Aula 201',
            group: 'G1',
            credits: 4,
            code: 'MED-101',
            description: 'Estudio de la estructura macroscópica del cuerpo humano.',
            isActive: true,
            professors: [
              { id: 'prof_perez', name: 'Dr. Carlos Pérez', title: 'Dr.', email: 'cperez@univ.edu.co', department: 'Anatomía', notes: 'Especialista en sistema locomotor' },
              { id: 'prof_gomez', name: 'Dra. María Gómez', title: 'Dra.', email: 'mgomez@univ.edu.co', department: 'Anatomía', notes: 'Especialista en neuroanatomía' },
              { id: 'prof_rodriguez', name: 'Dr. Roberto Rodríguez', title: 'Dr.', email: 'rrodriguez@univ.edu.co', department: 'Anatomía', notes: 'Docente titular práctico' }
            ],
            schedules: [
              {
                id: 'sched_anat_wed',
                subjectId: 'sub_anat_01',
                professorId: 'prof_rodriguez',
                professorName: 'Dr. Roberto Rodríguez',
                type: 'recurring',
                daysOfWeek: [3], // Miércoles
                startTime: '08:00',
                endTime: '10:00',
                classroom: 'Aula 201',
                modality: 'presencial',
                startDate: '2026-08-12',
                endDate: '2026-11-30',
                notes: 'Clase magistral semanal'
              },
              {
                id: 'sched_anat_mod1',
                subjectId: 'sub_anat_01',
                professorId: 'prof_perez',
                professorName: 'Dr. Carlos Pérez',
                type: 'period_override',
                startDate: '2026-08-08',
                endDate: '2026-08-29',
                notes: 'Asume todas las clases del Módulo 1 (Sistema Locomotor)'
              },
              {
                id: 'sched_anat_mod2',
                subjectId: 'sub_anat_01',
                professorId: 'prof_gomez',
                professorName: 'Dra. María Gómez',
                type: 'period_override',
                startDate: '2026-08-30',
                endDate: '2026-09-20',
                notes: 'Asume todas las clases del Módulo 2 (Neuroanatomía)'
              },
              {
                id: 'sched_anat_spec',
                subjectId: 'sub_anat_01',
                professorId: 'prof_perez',
                professorName: 'Dr. Carlos Pérez',
                type: 'single_date',
                date: '2026-08-15',
                startTime: '08:00',
                endTime: '10:00',
                classroom: 'Anfiteatro Central',
                modality: 'presencial',
                startDate: '2026-08-15',
                endDate: '2026-08-15',
                notes: 'Práctica especial de disección'
              }
            ],
            scheduleSessions: [],
            cuts: [
              {
                id: 'cut_anat_1',
                cutName: 'Primer Corte (35%)',
                cutWeightPercent: 35,
                activities: [
                  { id: 'act_parcial1', name: 'Parcial Locomotor', type: 'Parcial', date: '2026-08-28', time: '08:00', weightPercent: 60, status: 'pending' },
                  { id: 'act_lab1', name: 'Laboratorio Disección', type: 'Laboratorio', date: '2026-08-21', time: '08:00', weightPercent: 40, status: 'pending' }
                ]
              }
            ]
          }
        ]
      },
      vidaDiaria: {
        habits: [],
        tasks: [],
        routines: [],
        objectives: [],
        timePlans: [],
        lastActiveDate: '',
        dailyHistory: [],
        welcomeMessage: null
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
        immunizations: [],
        customBottles: [
          { id: 'def_1', name: 'Vaso', capacityMl: 250 },
          { id: 'def_2', name: 'Botella Gym', capacityMl: 500 },
          { id: 'def_3', name: 'Botella 700ml', capacityMl: 700 },
          { id: 'def_4', name: 'Termo 1L', capacityMl: 1000 }
        ],
        waterLogs: [],
        sleepRecords: [],
        napRecords: [],
        dailyWaterTargetLiters: 2.5,
        sleepTargetHours: 8.0
      },
      desarrolloPersonal: {
        journalEntries: [],
        lifeLessons: [],
        monthlyReviews: {},
        direction: {
          purpose: '',
          vision: '',
          principles: []
        },
        characterAreas: [],
        personalHistory: [],
        philosophicalReflections: []
      }
    },
    executive: {}
  };
}
