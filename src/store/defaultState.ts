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
      jefaturaGabinete: {
        config: {
          wakeUpTime: '06:30',
          sleepTime: '23:00',
          breakfastTime: '07:30',
          lunchTime: '12:30',
          dinnerTime: '19:30',
          commuteRoutes: [
            {
              id: 'commute_uni',
              name: 'Casa → Universidad',
              origin: 'Casa',
              destination: 'Universidad',
              durationMinutes: 30
            },
            {
              id: 'commute_home',
              name: 'Universidad → Casa',
              origin: 'Universidad',
              destination: 'Casa',
              durationMinutes: 25
            }
          ]
        },
        events: [],
        resolvedConflicts: [],
        instructionHistory: []
      },
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
        obligations: [],
        quincenalBudgets: {
          budgetTemplates: [
            { id: 'tmpl_necesarios', name: 'Gastos Necesarios', emoji: '🏠', color: 'emerald', defaultAmount: 0, defaultPercentage: 50 },
            { id: 'tmpl_personales', name: 'Gastos Personales', emoji: '💳', color: 'purple', defaultAmount: 0, defaultPercentage: 20 },
            { id: 'tmpl_ahorro', name: 'Ahorro', emoji: '🏦', color: 'blue', defaultAmount: 0, defaultPercentage: 20 }
          ],
          periodHistory: [],
          accumulatedCarryover: 0
        }
      },
      vidaSocial: {
        people: [],
        groups: [],
        interactions: [],
        commitments: [],
        specialDates: []
      },
      medica: {
        healthRecords: [
          { id: 'hr_1', date: '2026-08-11', weightKg: 70.2, notes: 'Registro matutino en ayunas' },
          { id: 'hr_2', date: '2026-08-08', weightKg: 70.7, notes: 'Medición previa' },
          { id: 'hr_3', date: '2026-08-01', weightKg: 71.2, notes: 'Inicio de mes' }
        ],
        nutritionRecords: [],
        medications: [
          { id: 'med_1', name: 'Multivitamínico', dose: '1 Cápsula', schedule: 'Cada 24 horas', timeOfDay: '08:00', startDate: '2026-08-01', status: 'active', takenDates: ['2026-08-11'] },
          { id: 'med_2', name: 'Omega 3', dose: '1000 mg', schedule: 'Cada 24 horas', timeOfDay: '13:00', startDate: '2026-08-01', status: 'active', takenDates: ['2026-08-11'] },
          { id: 'med_3', name: 'Magnesio', dose: '400 mg', schedule: 'Cada noche', timeOfDay: '21:00', startDate: '2026-08-01', status: 'active', takenDates: [] }
        ],
        appointments: [
          { id: 'apt_1', title: 'Consulta Médica General', specialty: 'Medicina General', doctor: 'Dr. Alejandro Restrepo', institution: 'Centro Médico Colsanitas', date: '2026-08-14', startTime: '10:30', endTime: '11:00', reason: 'Chequeo anual preventivo', status: 'Programada' }
        ],
        medicalExams: [
          { id: 'ex_1', name: 'Hemograma Completo', date: '2026-08-10', doctor: 'Dr. Alejandro Restrepo', resultSummary: 'Parámetros dentro de rango normal (Hemoglobina 14.5 g/dL)', status: 'Completado' },
          { id: 'ex_2', name: 'Perfil Lipídico', date: '2026-07-05', doctor: 'Dr. Alejandro Restrepo', resultSummary: 'Colesterol Total: 185 mg/dL, HDL: 55 mg/dL (Óptimo)', status: 'Completado' },
          { id: 'ex_3', name: 'TSH (Tiroides)', date: '2026-06-15', doctor: 'Dr. Alejandro Restrepo', resultSummary: '2.1 uIU/mL (Eutiroideo)', status: 'Completado' }
        ],
        conditions: [],
        immunizations: [
          { id: 'vac_1', name: 'Influenza Cepa 2026', preventsDisease: 'Gripe Estacional', dosesRequired: 1, dosesReceived: 1, applicationDates: ['2026-04-10'], lastApplicationDate: '2026-04-10', frequency: 'annual', nextDoseDate: '2027-04-10' },
          { id: 'vac_2', name: 'COVID-19 Refuerzo Bivalente', preventsDisease: 'COVID-19', dosesRequired: 3, dosesReceived: 3, applicationDates: ['2025-11-15'], lastApplicationDate: '2025-11-15', frequency: 'annual' },
          { id: 'vac_3', name: 'Tétanos y Difteria (Td)', preventsDisease: 'Tétanos', dosesRequired: 1, dosesReceived: 0, applicationDates: [], frequency: 'custom', nextDoseDate: '2026-09-15' }
        ],
        customBottles: [
          { id: 'def_1', name: 'Vaso', capacityMl: 250 },
          { id: 'def_2', name: 'Botella Gym', capacityMl: 500 },
          { id: 'def_3', name: 'Botella 700ml', capacityMl: 700 },
          { id: 'def_4', name: 'Termo 1L', capacityMl: 1000 }
        ],
        waterLogs: [
          { id: 'w_1', date: '2026-08-11', time: '08:30', amountMl: 500, containerType: 'Botella Gym (500 ml)' },
          { id: 'w_2', date: '2026-08-11', time: '11:15', amountMl: 500, containerType: 'Botella Gym (500 ml)' },
          { id: 'w_3', date: '2026-08-11', time: '14:30', amountMl: 400, containerType: 'Vaso (400 ml)' }
        ],
        sleepRecords: [
          { id: 'slp_1', date: '2026-08-11', bedTime: '23:30', wakeTime: '07:00', durationMinutes: 450, quality: 5 },
          { id: 'slp_2', date: '2026-08-10', bedTime: '23:15', wakeTime: '06:45', durationMinutes: 450, quality: 4 },
          { id: 'slp_3', date: '2026-08-09', bedTime: '22:50', wakeTime: '07:00', durationMinutes: 490, quality: 5 },
          { id: 'slp_4', date: '2026-08-08', bedTime: '00:10', wakeTime: '07:30', durationMinutes: 440, quality: 3 }
        ],
        napRecords: [],
        activityLogs: [
          { id: 'act_1', date: '2026-08-11', time: '07:30', type: 'caminata', minutes: 35, steps: 4200, notes: 'Caminata matutina en parque' }
        ],
        heartRateLogs: [
          { id: 'hr_1', date: '2026-08-11', time: '08:00', bpm: 72, context: 'reposo', notes: 'Medición matutina' },
          { id: 'hr_2', date: '2026-08-10', time: '08:00', bpm: 74, context: 'reposo' },
          { id: 'hr_3', date: '2026-08-09', time: '08:00', bpm: 71, context: 'reposo' }
        ],
        dailyWaterTargetLiters: 2.0,
        sleepTargetHours: 8.0,
        activityTargetMinutes: 60,
        stepsTarget: 8000
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
