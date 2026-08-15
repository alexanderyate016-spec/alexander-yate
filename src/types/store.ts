/**
 * Master Data Model Types for Casa Blanca Personal
 */

export interface SystemMetadata {
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
  appVersion: string;
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'presidential';
  profileName: string;
  executiveHours: {
    start: string; // "07:00"
    end: string;   // "22:00"
  };
  highContrast?: boolean;
  fontSizeMultiplier?: 'normal' | 'large' | 'xlarge';
}

// -------------------------------------------------------------
// OFICINA ACADÉMICA
// -------------------------------------------------------------
export interface SubjectProfessor {
  id: string;
  name: string;
  title?: string; // e.g. "Dr.", "Dra.", "MSc.", "Prof."
  role?: string; // e.g. "Titular", "Auxiliar", "Laboratorio", "Práctica"
  email?: string;
  phone?: string;
  department?: string;
  notes?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  assignmentMode?: 'all_classes' | 'specific_day';
  assignedDayOfWeek?: number; // 1 = Lunes, 2 = Martes, ..., 7 = Domingo
  validityType?: 'full_semester' | 'custom_dates';
}

export type AcademicScheduleType = 'recurring' | 'period_override' | 'single_date';

export interface SubjectScheduleRule {
  id: string;
  subjectId: string;
  professorId: string; // References SubjectProfessor.id or professor name (primary)
  professorName?: string; // Cached display name
  professorIds?: string[]; // Array of professor IDs for multi-professor sessions
  professorNames?: string[]; // Array of professor names for display
  type: AcademicScheduleType;
  
  // For 'recurring'
  daysOfWeek?: number[]; // 1 = Lunes, 2 = Martes, ..., 7 = Domingo
  
  // For 'recurring' and 'single_date'
  startTime?: string; // "08:00"
  endTime?: string;   // "10:00"
  classroom?: string;
  modality?: 'presencial' | 'virtual' | 'híbrido';
  
  // Date boundaries
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  
  // For 'single_date'
  date?: string; // YYYY-MM-DD
  
  // For 'period_override'
  applyToScheduleId?: string; // Optional: specific rule ID to override, or empty/null for all schedules
  
  cancelledDates?: string[]; // Array of cancelled dates YYYY-MM-DD
  notes?: string;
  createdAt?: string;
}

export interface AcademicSession {
  id: string;
  day: number; // 1 = Lunes, 7 = Domingo
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  classroom?: string;
  professorId?: string;
  professorName?: string;
}

export interface CutProfessor {
  id?: string;
  professorId?: string;
  name?: string;
  professorName?: string; // Aliased for display convenience
  weightPercent: number; // In relative mode: % of the cut (sums to 100%). In direct mode: % of the subject (sums to cutWeightPercent)
}

export type AcademicEvaluationType =
  | 'Parcial'
  | 'Quiz'
  | 'Taller'
  | 'Trabajo'
  | 'Laboratorio'
  | 'Exposición'
  | 'Examen'
  | 'Evaluación'
  | 'Entrega'
  | 'Proyecto'
  | 'Otro';

export interface AcademicEvaluationActivity {
  id: string;
  name: string;
  type: AcademicEvaluationType | string;
  date: string; // YYYY-MM-DD
  time?: string;
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  weightPercent: number; // e.g. 20 (20%) - 0 if pending (within professor's distribution, sums to 100%)
  grade?: number; // 0.0 - 5.0
  status: 'pending' | 'graded' | 'cancelled';
  description?: string;
  professorId?: string; // Optional reference to CutProfessor or SubjectProfessor
  professorName?: string;
  gradableType?: 'calificable' | 'no_calificable' | 'pendiente';
  cutId?: string; // Optional if cut is pending / unassigned
}

export type AcademicActivityType =
  | 'Salida de campo'
  | 'Laboratorio'
  | 'Práctica'
  | 'Clase especial'
  | 'Conferencia'
  | 'Seminario'
  | 'Tutoría'
  | 'Asesoría'
  | 'Entrega de documentos'
  | 'Inscripción'
  | 'Reunión'
  | 'Taller'
  | 'Exposición'
  | 'Lectura'
  | 'Entrega'
  | 'Presentación'
  | 'Actividad práctica'
  | 'Preparación de trabajo'
  | 'Otro';

export type AcademicActivityStatus = 'Pendiente' | 'Completada' | 'Realizada' | 'Cancelada' | 'Reprogramada' | 'Vencida';

export interface AcademicActivity {
  id: string;
  subjectId: string;
  name: string;
  type: AcademicActivityType | string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  location?: string;
  professor?: string;
  description?: string;
  status: AcademicActivityStatus;
  classRelation?: 'replaces' | 'complements' | 'independent';
  evaluationId?: string; // Optional link to an AcademicEvaluationActivity
  completedAt?: string;
}

export interface AcademicCut {
  id: string;
  cutName: string;
  cutWeightPercent: number; // Sum of cuts = 100%
  professorDistributionMode?: 'relative_to_cut' | 'direct_to_subject'; // Explicit modality for professor percentages
  professors?: CutProfessor[]; // Professors in this cut (default 1 prof at 100%)
  activities: AcademicEvaluationActivity[];
}

export interface AcademicSubject {
  id: string;
  semesterId: string;
  name: string;
  professor: string; // Summary string e.g. "Dr. Pérez, Dra. Gómez"
  color: string;
  classroom?: string;
  group?: string;
  credits?: number;
  code?: string;
  description?: string;
  isActive?: boolean;
  
  professors?: SubjectProfessor[]; // Registered professors list
  schedules?: SubjectScheduleRule[]; // Class schedule rules (recurring, period_override, single_date)
  
  scheduleSessions: AcademicSession[];
  cuts: AcademicCut[];
  academicActivities?: AcademicActivity[];
  totalStudyMinutes?: number;
  cancelledClassDates?: string[];
}

export interface AcademicSemester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface StudyLogRecord {
  id: string;
  subjectId: string;
  subjectTopic?: string;
  date: string;
  durationMinutes: number;
  timePlanId?: string;
  notes?: string;
  createdAt: string;
}

export interface AcademicOfficeData {
  semesters: AcademicSemester[];
  subjects: AcademicSubject[];
  academicActivities?: AcademicActivity[];
  studyLogs?: StudyLogRecord[];
}

// -------------------------------------------------------------
// OFICINA DE VIDA DIARIA
// -------------------------------------------------------------
export interface HabitItem {
  id: string;
  name: string;
  description?: string;
  color: string;
  emoji?: string;
  frequency: 'daily' | 'weekdays' | 'custom';
  targetDays?: string[]; // e.g. ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']
  scheduledTime?: string; // e.g. "07:00"
  durationMinutes?: number; // e.g. 10 or 15
  logs: Record<string, boolean>; // key: YYYY-MM-DD, value: true
  isRecurring?: boolean; // Default true. Only repeats if recurring
}

export interface DailyTask {
  id: string;
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  status: 'pending' | 'completed';
  checklist?: Array<{ id: string; title: string; completed: boolean }>;
  sendToChiefOfStaff?: boolean;
  isRecurring?: boolean; // Default false
}

export interface RoutineStep {
  id: string;
  title: string;
  completedToday?: boolean;
}

export interface RoutineItem {
  id: string;
  name: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  time?: string; // e.g. "06:30"
  emoji?: string;
  steps: RoutineStep[];
  isRecurring?: boolean; // Default true
  completedToday?: boolean;
}

export interface BaseScheduleItem {
  id: string;
  name: string;
  emoji: string;
  time: string;
}

export interface BaseScheduleConfig {
  wakeUpTime: string; // "06:30"
  breakfastTime: string; // "07:00"
  lunchTime: string; // "12:30"
  dinnerTime: string; // "19:30"
  sleepTime: string; // "23:00"
  customItems?: BaseScheduleItem[];
}

export interface DailyObjective {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
  progressPercent?: number;
}

export interface TimePlan {
  id: string;
  title: string;
  category: 'commute' | 'lunch' | 'breakfast' | 'dinner' | 'study' | 'read' | 'rest' | 'gym' | 'shopping' | 'cleaning' | 'prayer' | 'family' | 'work' | 'free_time' | 'personal' | 'custom';
  date: string; // YYYY-MM-DD
  startTime: string; // "12:30"
  durationMinutes: number; // e.g. 45
  endTime: string; // calculated
  color: string;
  description?: string;
  subjectId?: string;
  subjectTopic?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface DailyHistoryDetailItem {
  id: string;
  name: string;
  category?: string;
  completed: boolean;
  extraInfo?: string;
}

export interface DailyHistoryRecord {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // e.g. "Viernes 1 de agosto de 2026"
  overallCompliancePercent: number;
  habitsCount: { completed: number; total: number; percent: number };
  tasksCount: { completed: number; total: number; percent: number };
  objectivesCount: { completed: number; total: number; percent: number };
  routinesCount?: { completed: number; total: number; percent: number };
  productiveTimeMinutes: number; // e.g. 435 mins (7 h 15 min)
  habitsDetail?: DailyHistoryDetailItem[];
  tasksDetail?: DailyHistoryDetailItem[];
  objectivesDetail?: DailyHistoryDetailItem[];
  timePlansDetail?: Array<{ id: string; title: string; category: string; durationMinutes: number }>;
}

export interface WelcomeDayMessage {
  dateStr: string;
  text: string;
  yesterdayScore: number;
  dismissed?: boolean;
}

export interface DailyLifeOfficeData {
  habits: HabitItem[];
  tasks: DailyTask[];
  routines: RoutineItem[];
  objectives: DailyObjective[];
  timePlans: TimePlan[];
  baseSchedule?: BaseScheduleConfig;
  lastActiveDate?: string;
  dailyHistory?: DailyHistoryRecord[];
  welcomeMessage?: WelcomeDayMessage | null;
}

// -------------------------------------------------------------
// OFICINA FINANCIERA
// -------------------------------------------------------------
export type CurrencyCode = 'COP' | 'USD' | 'EUR' | 'BTC' | 'ETH';

export interface FinancialAccount {
  id: string;
  name: string;
  institution: string;
  type: 'cash' | 'checking' | 'savings' | 'high_yield' | 'digital_wallet' | 'investment' | 'other';
  currency: CurrencyCode;
  initialBalance: number;
  balance?: number;
  annualInterestRate?: number; // for high yield accounts (TEA %)
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastYieldProcessedDate?: string;
}

export interface FinancialCategory {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

export type TransactionNature =
  | 'internal_transfer'
  | 'external_income'
  | 'external_expense'
  | 'financial_yield'
  | 'investment_buy'
  | 'investment_sell'
  | 'reconciliation_adj';

export interface FinancialTransactionSplit {
  id: string;
  budgetId?: string; // ID del presupuesto (ej. fund_necesarios)
  budgetCategoryId?: string; // ID de la categoría (ej. cat_gasolina)
  categoryName?: string;
  amount: number;
  description?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  time: string;
  nature: TransactionNature;
  accountId?: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  sourceName?: string; // Origen del dinero en ingresos externos (ej. salario, beca)
  beneficiaryName?: string; // Destino o beneficiario en salidas externas
  assetName?: string; // Nombre del activo para compra/venta de inversión
  assetQuantity?: number; // Cantidad para inversión
  unitPrice?: number; // Precio unitario para inversión
  reconciliationReason?: string; // Motivo del ajuste de conciliación
  reconciliationUser?: string; // Usuario que aplicó la conciliación
  categoryId?: string;
  budgetId?: string; // Presupuesto asignado (opcional)
  budgetCategoryId?: string; // Categoría dentro del presupuesto (opcional)
  splits?: FinancialTransactionSplit[]; // Para opción "Dividir gasto"
  quincenaPeriodId?: string; // Asignación de quincena personalizada (opcional/excepción manual)
  description: string;
  amount: number;
  currency: CurrencyCode;
  tags?: string[];
}

export interface FinancialObligation {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  dueDate: string;
  frequency: 'one_time' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';
  category: string;
  isPaid: boolean;
}

export interface InvestmentPosition {
  id: string;
  assetName: string;
  type: string;
  quantity: number;
  avgPurchasePrice: number;
  currentPrice: number;
  currency: CurrencyCode;
  purchaseDate: string;
}

export interface FinancialSubcategoryPlan {
  id: string;
  name: string;
  percentage: number; // Percentage relative to parent category
  emoji?: string;
}

export interface FinancialCategoryPlan {
  id: string;
  name: string;
  percentage: number; // Percentage relative to parent fund
  emoji?: string;
  subcategories?: FinancialSubcategoryPlan[];
}

export interface FinancialFundPlan {
  id: string;
  name: string;
  percentage: number; // Percentage relative to total income budget
  color: string;
  emoji?: string;
  categories: FinancialCategoryPlan[];
}

export interface FinancialDistributionPlan {
  incomeBaseMode?: 'manual' | 'calculated';
  monthlyBaseIncome?: number; // Custom base income amount for distribution plan
  currency: CurrencyCode;
  funds: FinancialFundPlan[];
}

export interface QuincenalBudgetItem {
  id: string;
  name: string;
  allocatedAmount: number; // Monto asignado en esta quincena
  spentAmount?: number; // Monto gastado (calculado en el periodo)
  emoji?: string;
  color?: string;
  categoryName?: string;
}

export interface QuincenalPeriodRecord {
  id: string; // ej: "2026-08-Q1", "2026-08-Q2"
  year: number;
  month: number; // 1 - 12
  quincena: 1 | 2; // 1 = 1-15, 2 = 16-fin de mes
  startDate: string; // "YYYY-MM-01" o "YYYY-MM-16"
  endDate: string; // "YYYY-MM-15" o "YYYY-MM-30/31"
  periodLabel: string; // "Quincena 1–15 de Agosto de 2026"
  isClosed: boolean;
  closedAt?: string;

  // Ingreso y sobrante
  newIncome: number; // Dinero realmente recibido en la quincena
  leftoverFromPrevious: number; // Dinero sobrante que no se gastó en la quincena anterior
  totalAvailable: number; // newIncome + leftoverFromPrevious (Disponible para distribuir)

  // Presupuestos asignados en esta quincena
  budgets: QuincenalBudgetItem[];

  // Resumen del periodo
  totalAllocated: number; // Suma de presupuestos asignados
  freeUnallocated: number; // Dinero libre / disponible sin asignar a presupuesto
  totalSpent: number; // Total gastado durante la quincena
  leftover: number; // Sobrante al cierre (totalAvailable - totalSpent)

  notes?: string;
}

export interface QuincenalBudgetOfficeState {
  currentPeriodId?: string;
  budgetTemplates?: Array<{ id: string; name: string; emoji: string; color: string; defaultAmount?: number; defaultPercentage?: number }>;
  periodHistory: QuincenalPeriodRecord[];
  accumulatedCarryover?: number;
}

export interface FinancialOfficeData {
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  transactions: FinancialTransaction[];
  budgets: Array<{ id: string; categoryId: string; monthlyLimit: number; currency: CurrencyCode }>;
  distributionPlan?: FinancialDistributionPlan;
  quincenalBudgets?: QuincenalBudgetOfficeState;
  recurringExpenses: Array<{ id: string; title: string; amount: number; currency: CurrencyCode; dueDay: number }>;
  savings: Array<{ id: string; goalName: string; targetAmount: number; currentAmount: number; currency: CurrencyCode; targetDate?: string }>;
  investments: InvestmentPosition[];
  obligations: FinancialObligation[];
}

// -------------------------------------------------------------
// OFICINA DE VIDA SOCIAL
// -------------------------------------------------------------
export interface CustomPersonDate {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or MM-DD
}

export interface PersonIdeas {
  likes?: string;
  hobbies?: string;
  favoriteFood?: string;
  giftIdeas?: string;
  usefulInfo?: string;
}

export interface SocialPerson {
  id: string;
  name: string;
  nickname?: string;
  photoUrl?: string;
  birthday?: string; // YYYY-MM-DD
  anniversaryDate?: string; // YYYY-MM-DD
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  profession?: string;
  organization?: string;
  relationship: string;
  category: 'Familia' | 'Amigos' | 'Compañeros de universidad' | 'Profesores' | 'Trabajo' | 'Otros';
  importanceLevel: 'Muy importante' | 'Importante' | 'Frecuente' | 'Ocasional';
  howWeMet?: string;
  notes?: string;
  interests?: string;
  memoryContext?: string;
  tags: string[];
  isFavorite?: boolean;
  customDates?: CustomPersonDate[];
  ideas?: PersonIdeas;
}

export interface SocialInteraction {
  id: string;
  personId: string;
  date: string;
  time?: string;
  type: 'Conversación' | 'Llamada' | 'Reunión' | 'Mensaje' | 'Salida' | 'Clase' | 'Otro';
  description: string;
}

export type SocialEventType =
  | 'Comer'
  | 'Café'
  | 'Cine'
  | 'Caminar'
  | 'Deporte'
  | 'Fiesta'
  | 'Concierto'
  | 'Viaje'
  | 'Reunión familiar'
  | 'Estudio en grupo'
  | 'Salida nocturna'
  | 'Cena'
  | 'Almuerzo'
  | 'Partido'
  | 'Celebración'
  | 'Otro';

export interface SocialCommitment {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  peopleIds: string[];
  description?: string;
  priority: 'low' | 'medium' | 'high';
  type?: 'Reunión' | 'Almuerzo' | 'Clase' | 'Llamada' | 'Celebración' | 'Salida' | 'Otro';
  eventType?: SocialEventType;
  rating?: number; // 1 to 5
  memoryPhotoUrl?: string;
  memoryNote?: string;
  isCompleted?: boolean;
}

export interface SpecialDateItem {
  id: string;
  title: string;
  date: string; // MM-DD or YYYY-MM-DD
  type: 'personal' | 'cultural' | 'colombian_holiday';
  description?: string;
}

export interface SocialOfficeData {
  people: SocialPerson[];
  groups: Array<{ id: string; name: string; memberIds: string[] }>;
  interactions: SocialInteraction[];
  commitments: SocialCommitment[];
  specialDates: SpecialDateItem[];
}

// -------------------------------------------------------------
// OFICINA MÉDICA
// -------------------------------------------------------------
export interface CustomWaterBottle {
  id: string;
  name: string;
  capacityMl: number;
  icon?: string;
}

export interface WaterIntakeLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amountMl: number;
  containerType?: string; // e.g. "Vaso", "Botella", "700 ml"
}

export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  bedTime: string; // HH:mm e.g. "22:45"
  wakeTime: string; // HH:mm e.g. "06:30"
  durationMinutes: number; // calculated automatically
  quality?: number; // 1 - 5
  notes?: string;
}

export interface NapRecord {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number; // calculated automatically
  notes?: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  weightKg?: number;
  sleepHours?: number;
  sleepQuality?: number; // 1 - 5
  hydrationLiters?: number;
  hydrationGlasses?: number;
  notes?: string;
}

export interface NutritionRecord {
  id: string;
  date: string;
  mealType: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Refrigerio' | 'Snack';
  description: string;
  notes?: string;
  estimatedCalories?: number;
}

export interface ActivityLog {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: 'ejercicio' | 'caminata' | 'actividad' | 'pasos';
  minutes?: number;
  steps?: number;
  notes?: string;
}

export interface HeartRateLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  bpm: number;
  context?: 'reposo' | 'ejercicio' | 'post_ejercicio' | 'general';
  notes?: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  schedule: string;
  timeOfDay?: string; // e.g. "08:00"
  startDate: string;
  endDate?: string;
  instructions?: string;
  notes?: string;
  status?: 'active' | 'completed' | 'paused';
  lastTakenTime?: string;
  takenDates?: string[]; // YYYY-MM-DD dates when taken
}

export interface MedicalAppointment {
  id: string;
  title: string;
  specialty: string;
  doctor?: string;
  institution?: string; // Clínica / Centro
  date: string;
  startTime: string;
  endTime?: string;
  reason?: string; // Motivo de la consulta
  notes?: string;
  status?: 'Programada' | 'Realizada' | 'Cancelada' | 'Reprogramada';
  location?: string;
}

export interface MedicalExam {
  id: string;
  name: string; // Tipo o nombre de examen
  date: string;
  location?: string;
  doctor?: string;
  resultSummary?: string;
  nextControlDate?: string;
  status?: 'Pendiente' | 'Completado' | 'En revisión';
  notes?: string;
}

export interface HealthCondition {
  id: string;
  name: string;
  diagnosedDate?: string;
  status: 'active' | 'managed' | 'resolved';
  notes?: string;
}

export interface ImmunizationRecord {
  id: string;
  name: string;
  preventsDisease?: string; // Enfermedad que previene
  manufacturer?: string; // Fabricante (opcional)
  dosesRequired: number;
  dosesReceived: number;
  applicationDates: string[];
  lastApplicationDate?: string;
  locationApplied?: string; // Lugar donde fue aplicada
  batchNumber?: string; // Lote (opcional)
  administeredBy?: string; // Profesional que la aplicó (opcional)
  nextDoseDate?: string;
  frequency: 'single' | 'multiple' | 'booster' | 'annual' | 'custom';
  frequencyYears?: number;
  notes?: string;
}

export interface MedicalOfficeData {
  healthRecords: HealthRecord[];
  nutritionRecords?: NutritionRecord[];
  medications: MedicationItem[];
  appointments: MedicalAppointment[];
  medicalExams: MedicalExam[];
  conditions: HealthCondition[];
  immunizations: ImmunizationRecord[];
  customBottles?: CustomWaterBottle[];
  waterLogs?: WaterIntakeLog[];
  sleepRecords?: SleepRecord[];
  napRecords?: NapRecord[];
  activityLogs?: ActivityLog[];
  heartRateLogs?: HeartRateLog[];
  dailyWaterTargetLiters?: number;
  sleepTargetHours?: number;
  activityTargetMinutes?: number;
  stepsTarget?: number;
}

// -------------------------------------------------------------
// OFICINA DE DESARROLLO PERSONAL (PRIVADA) - DIARIO PERSONAL INTELIGENTE
// -------------------------------------------------------------
export type JournalMood = 'excelente' | 'bueno' | 'neutro' | 'dificil' | 'reflexivo';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm e.g. "21:30"
  wordOfTheDay?: string; // Palabra del día (ej. "Constancia", "Gratitud")
  mood?: JournalMood; // Estado de ánimo
  moodNote?: string; // Respuesta a "¿Quieres contarme por qué?"
  bestThingToday?: string; // ¿Qué fue lo mejor que ocurrió hoy?
  learnedToday?: string; // ¿Qué aprendí hoy?
  improveTomorrow?: string; // ¿Qué debo mejorar?
  importantDecision?: string; // ¿Qué decisión importante tomé?
  gratefulFor?: string; // ¿Qué agradezco hoy?
  freeReflection?: string; // Reflexión libre ("¿Qué quieres dejar de este día?")
  philosophicalAnswer?: string; // Respuesta a la pregunta filosófica del día
  createdAt?: string;

  // Momentos del día (opcionales):
  wentWell?: string; // ⭐ Algo que salió bien
  overcame?: string; // 💪 Algo que superé
  enjoyed?: string; // ❤️ Algo que disfruté

  // Respuesta a la reflexión contextual del día:
  contextualAnswer?: string;

  // Campos legacy para compatibilidad retroactiva:
  learned?: string;
  improve?: string;
  mistakes?: string;
  decisions?: string;
  ideas?: string;
  reflection?: string;
}

export type LifeLessonType = 'aprendizaje' | 'error' | 'acierto' | 'consejo' | 'idea';

export interface LifeLesson {
  id: string;
  title: string;
  type: LifeLessonType;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
}

export interface GrowthProgressNote {
  id: string;
  date: string;
  time?: string;
  note: string;
}

export interface GrowthObjective {
  id: string;
  title: string; // e.g. "Ser más disciplinado", "Mejorar mi confianza"
  description?: string;
  category?: string;
  progressNotes?: GrowthProgressNote[];
  createdAt: string;
}

export interface MonthlyReview {
  id: string; // "YYYY-MM"
  yearMonth: string; // "YYYY-MM"
  biggestLearning: string; // mayor aprendizaje del mes
  biggestChallenge: string; // mayor reto
  nextMonthGoal: string; // objetivo para el próximo mes
  updatedAt: string;
}

// Interfaces legacy mantenidas para compatibilidad
export interface PersonalPrinciple {
  id: string;
  title: string;
  description: string;
}

export interface CharacterGrowthArea {
  id: string;
  name: string;
  purpose: string;
  strengths: string;
  improvements: string;
  notes: string;
}

export interface HistoryMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  lesson: string;
}

export interface PhilosophicalReflection {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
}

export interface PersonalDevOfficeData {
  journalEntries: JournalEntry[]; // 1 por día
  lifeLessons: LifeLesson[];
  growthObjectives?: GrowthObjective[];
  monthlyReviews: Record<string, MonthlyReview>; // key: "YYYY-MM"

  // Campos opcionales legacy mantenidos para prevención de fallos de parsing:
  direction?: {
    purpose: string;
    vision: string;
    principles: PersonalPrinciple[];
  };
  characterAreas?: CharacterGrowthArea[];
  personalHistory?: HistoryMilestone[];
  philosophicalReflections?: PhilosophicalReflection[];
}

// -------------------------------------------------------------
// SEGURIDAD & ACCESO
// -------------------------------------------------------------
export interface SecurityLog {
  id: string;
  date: string;
  type: 'login_success' | 'failed_attempt' | 'password_changed' | 'locked' | 'auto_locked' | 'logout_locked' | 'exported' | 'imported';
  description: string;
}

export interface SecurityData {
  isSetupComplete: boolean;
  isLocked: boolean;
  userProfile?: {
    fullName: string;
    title?: string;
    avatarUrl?: string;
  };
  credentials?: {
    pinHash: string;
    securityQuestion: string;
    securityAnswerHash: string;
    passphraseHash?: string;
  };
  failedAttempts?: number;
  profile: {
    name: string;
  };
  authentication: {
    passwordHash: string | null;
    recoveryQuestion: string | null;
    recoveryAnswerHash: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  settings: {
    autoLock: boolean;
    lockTimeMinutes: number;
  };
  accessLogs: SecurityLog[];
  failedAttemptsCount: number;
  lockoutUntil: string | null;
}

// -------------------------------------------------------------
// CENTRO DE GESTIÓN DE CRISIS
// -------------------------------------------------------------
export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface CrisisProtocol {
  id: string;
  name: string;
  category: 'Académica' | 'Financiera' | 'Salud' | 'Personal' | 'Tiempo' | 'Relaciones' | 'Digital' | 'Otra';
  situation: string;
  steps: string[];
  notes?: string;
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  updatedAt: string;
}

export interface CrisisEvent {
  id: string;
  date: string;
  situation: string;
  category: string;
  actionsTaken: string;
  result: string;
  lessonLearned: string;
}

export interface CrisisDecision {
  id: string;
  date: string;
  decision: string;
  reason: string;
  result?: string;
  notes?: string;
}

export interface CrisisCenterData {
  isCrisisActive: boolean;
  crisisLevel: 'low' | 'medium' | 'high' | 'critical';
  emergencyContacts: EmergencyContact[];
  protocols: CrisisProtocol[];
  events: CrisisEvent[];
  decisions: CrisisDecision[];
}

// -------------------------------------------------------------
// HISTORIAL DE RESOLUCIÓN DE CONFLICTOS
// -------------------------------------------------------------
export interface ConflictResolutionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  eventAId: string;
  eventATitle: string;
  eventBId: string;
  eventBTitle: string;
  resolutionType: 'permitted_absence' | 'class_rescheduled' | 'activity_rescheduled' | 'appointment_rescheduled' | 'event_cancelled' | 'ignored';
  resolutionTitle: string;
  details: string;
  resolvedAt: string;
}

// -------------------------------------------------------------
// PROYECCIONES & EVENTO EJECUTIVO UNIFICADO
// -------------------------------------------------------------
export interface UnifiedExecutiveEvent {
  id: string;
  sourceOffice: 'academica' | 'vidaDiaria' | 'financiera' | 'vidaSocial' | 'medica' | 'jefatura' | 'desarrolloPersonal';
  officeLabel: string;
  color: string;
  title: string;
  subtitle?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  type: 'class' | 'evaluation' | 'academic_activity' | 'task' | 'time_plan' | 'habit' | 'obligation' | 'appointment' | 'commitment' | 'birthday';
  priority?: 'low' | 'medium' | 'high';
  rawObject: any;
  replacesClassNote?: string;
  isJustifiedAbsence?: boolean;
  absenceNote?: string;
  status?: string;
  classRelation?: 'replaces' | 'complements' | 'independent';
  location?: string;
  travelTimeMinutes?: number;
  prepTimeMinutes?: number;
}

// -------------------------------------------------------------
// OFICINA DE JEFATURA DE GABINETE (SECRETARÍA EJECUTIVA)
// -------------------------------------------------------------
export interface CommuteRoute {
  id: string;
  name: string; // e.g. "Casa → Universidad"
  origin: string;
  destination: string;
  durationMinutes: number; // e.g. 30
}

export interface PersonalScheduleConfig {
  wakeUpTime: string; // "06:30"
  sleepTime: string;  // "23:00"
  breakfastTime: string; // "07:30"
  lunchTime: string;    // "12:30"
  dinnerTime: string;   // "19:30"
  commuteRoutes: CommuteRoute[];
}

export interface ChiefOfStaffEvent {
  id: string;
  title: string;
  emoji?: string;
  category?: 'academic' | 'medical' | 'social' | 'personal' | 'commute' | 'dining' | 'rest' | 'other';
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  sourceOffice: 'jefatura' | 'academica' | 'medica' | 'financiera' | 'vidaSocial' | 'vidaDiaria';
  location?: string;
  travelTimeMinutes?: number;
  prepTimeMinutes?: number;
  reminderMinutes?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'rescheduled' | 'cancelled';
  cancelReason?: string;
  cancelledAt?: string;
  reprogrammedFrom?: {
    oldDate: string;
    oldStartTime: string;
    oldEndTime: string;
    reason?: string;
    reprogrammedAt?: string;
  };
  isRecurring?: boolean;
  recurrenceRule?: {
    type: 'daily' | 'weekly' | 'period' | 'single';
    daysOfWeek?: number[]; // 1-7
    startDate?: string;
    endDate?: string;
  };
  linkedOfficeId?: string;
  notes?: string;
  createdAt?: string;
}

export interface CabinetConflictResolution {
  id: string;
  eventAId: string;
  eventATitle: string;
  eventBId: string;
  eventBTitle: string;
  date: string;
  decisionText: string;
  actionTaken: string;
  resolvedAt: string;
}

export interface CabinetInstructionLog {
  id: string;
  timestamp: string;
  inputText: string;
  actionSummary: string;
}

export interface ChiefOfStaffOfficeData {
  config: PersonalScheduleConfig;
  events: ChiefOfStaffEvent[];
  resolvedConflicts?: CabinetConflictResolution[];
  instructionHistory?: CabinetInstructionLog[];
  cancelledEventIds?: string[];
  cancelledEventsByDate?: Record<string, string[]>;
  cancelledOccurrences?: Array<{
    id: string;
    date: string;
    filter?: 'all' | 'classes' | 'academic' | 'medical' | 'social';
    titleKeyword?: string;
    reason?: string;
    createdAt?: string;
  }>;
}

// -------------------------------------------------------------
// STORE GLOBAL INTEGRAL
// -------------------------------------------------------------
export interface CasaBlancaStoreData {
  metadata: SystemMetadata;
  settings: SystemSettings;
  security: SecurityData;
  crisis: CrisisCenterData;
  crisisCenter: CrisisCenterData;
  offices: {
    jefaturaGabinete: ChiefOfStaffOfficeData;
    academica: AcademicOfficeData;
    vidaDiaria: DailyLifeOfficeData;
    financiera: FinancialOfficeData;
    vidaSocial: SocialOfficeData;
    medica: MedicalOfficeData;
    desarrolloPersonal: PersonalDevOfficeData;
  };
  executive: {
    notes?: string;
    conflictResolutions?: ConflictResolutionRecord[];
    dismissedConflicts?: string[];
  };
}

export type MasterState = CasaBlancaStoreData;
