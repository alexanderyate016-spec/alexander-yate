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
}

// -------------------------------------------------------------
// OFICINA ACADÉMICA
// -------------------------------------------------------------
export interface AcademicSession {
  id: string;
  day: number; // 1 = Lunes, 7 = Domingo
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  classroom?: string;
}

export interface AcademicEvaluationActivity {
  id: string;
  name: string;
  type: 'Parcial' | 'Quiz' | 'Taller' | 'Laboratorio' | 'Exposición' | 'Proyecto' | 'Otro';
  date: string; // YYYY-MM-DD
  time?: string;
  weightPercent: number; // e.g. 20 (20%)
  grade?: number; // 0.0 - 5.0
  status: 'pending' | 'graded' | 'cancelled';
  description?: string;
}

export interface AcademicCut {
  id: string;
  cutName: string;
  cutWeightPercent: number; // Sum of cuts = 100%
  activities: AcademicEvaluationActivity[];
}

export interface AcademicSubject {
  id: string;
  semesterId: string;
  name: string;
  professor: string;
  color: string;
  classroom?: string;
  scheduleSessions: AcademicSession[];
  cuts: AcademicCut[];
}

export interface AcademicSemester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AcademicOfficeData {
  semesters: AcademicSemester[];
  subjects: AcademicSubject[];
}

// -------------------------------------------------------------
// OFICINA DE VIDA DIARIA
// -------------------------------------------------------------
export interface HabitItem {
  id: string;
  name: string;
  description?: string;
  color: string;
  frequency: 'daily' | 'weekdays' | 'custom';
  logs: Record<string, boolean>; // key: YYYY-MM-DD, value: true
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
  steps: RoutineStep[];
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
  category: 'commute' | 'lunch' | 'breakfast' | 'dinner' | 'study' | 'rest' | 'gym' | 'shopping' | 'free_time' | 'personal';
  date: string; // YYYY-MM-DD
  startTime: string; // "12:30"
  durationMinutes: number; // e.g. 45
  endTime: string; // calculated
  color: string;
  description?: string;
}

export interface DailyLifeOfficeData {
  habits: HabitItem[];
  tasks: DailyTask[];
  routines: RoutineItem[];
  objectives: DailyObjective[];
  timePlans: TimePlan[];
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
  annualInterestRate?: number; // for high yield accounts
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

export interface FinancialTransaction {
  id: string;
  date: string;
  time: string;
  nature: TransactionNature;
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
  description: string;
  amount: number;
  currency: CurrencyCode;
  tags: string[];
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

export interface FinancialOfficeData {
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  transactions: FinancialTransaction[];
  budgets: Array<{ id: string; categoryId: string; monthlyLimit: number; currency: CurrencyCode }>;
  distributionPlan?: FinancialDistributionPlan;
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

export interface SocialPerson {
  id: string;
  name: string;
  photoUrl?: string;
  birthday?: string; // YYYY-MM-DD
  anniversaryDate?: string; // YYYY-MM-DD
  phone?: string;
  email?: string;
  address?: string;
  profession?: string;
  organization?: string;
  relationship: string;
  category: 'Familia' | 'Amigos' | 'Compañeros de universidad' | 'Profesores' | 'Trabajo' | 'Otros';
  importanceLevel: 'Muy importante' | 'Importante' | 'Frecuente' | 'Ocasional';
  notes?: string;
  interests?: string;
  memoryContext?: string;
  tags: string[];
  isFavorite?: boolean;
  customDates?: CustomPersonDate[];
}

export interface SocialInteraction {
  id: string;
  personId: string;
  date: string;
  time?: string;
  type: 'Conversación' | 'Llamada' | 'Reunión' | 'Mensaje' | 'Salida' | 'Clase' | 'Otro';
  description: string;
}

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
export interface HealthRecord {
  id: string;
  date: string;
  weightKg?: number;
  sleepHours?: number;
  sleepQuality?: number; // 1 - 5
  hydrationLiters?: number;
  hydrationGlasses?: number;
}

export interface NutritionRecord {
  id: string;
  date: string;
  mealType: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack';
  description: string;
  estimatedCalories?: number;
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  schedule: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  lastTakenTime?: string;
}

export interface MedicalAppointment {
  id: string;
  title: string;
  specialty: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  doctor?: string;
  notes?: string;
}

export interface MedicalExam {
  id: string;
  name: string;
  date: string;
  location?: string;
  doctor?: string;
  resultSummary?: string;
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
  dosesRequired: number;
  dosesReceived: number;
  applicationDates: string[];
  nextDoseDate?: string;
  frequency: 'single' | 'multiple' | 'booster' | 'annual';
  notes?: string;
}

export interface MedicalOfficeData {
  healthRecords: HealthRecord[];
  nutritionRecords: NutritionRecord[];
  medications: MedicationItem[];
  appointments: MedicalAppointment[];
  medicalExams: MedicalExam[];
  conditions: HealthCondition[];
  immunizations: ImmunizationRecord[];
}

// -------------------------------------------------------------
// OFICINA DE DESARROLLO PERSONAL (PRIVADA)
// -------------------------------------------------------------
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

export interface JournalEntry {
  id: string;
  date: string;
  learned: string;
  improve: string;
  mistakes: string;
  decisions: string;
  ideas: string;
  reflection: string;
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
  direction: {
    purpose: string;
    vision: string;
    principles: PersonalPrinciple[];
  };
  characterAreas: CharacterGrowthArea[];
  journalEntries: JournalEntry[];
  personalHistory: HistoryMilestone[];
  philosophicalReflections: PhilosophicalReflection[];
}

// -------------------------------------------------------------
// SEGURIDAD & ACCESO
// -------------------------------------------------------------
export interface SecurityLog {
  id: string;
  date: string;
  type: 'login_success' | 'failed_attempt' | 'password_changed' | 'locked' | 'exported' | 'imported';
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
// PROYECCIONES & EVENTO EJECUTIVO UNIFICADO
// -------------------------------------------------------------
export interface UnifiedExecutiveEvent {
  id: string;
  sourceOffice: 'academica' | 'vidaDiaria' | 'financiera' | 'vidaSocial' | 'medica';
  officeLabel: string;
  color: string;
  title: string;
  subtitle?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  type: 'class' | 'evaluation' | 'task' | 'time_plan' | 'habit' | 'obligation' | 'appointment' | 'commitment' | 'birthday';
  priority?: 'low' | 'medium' | 'high';
  rawObject: any;
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
    academica: AcademicOfficeData;
    vidaDiaria: DailyLifeOfficeData;
    financiera: FinancialOfficeData;
    vidaSocial: SocialOfficeData;
    medica: MedicalOfficeData;
    desarrolloPersonal: PersonalDevOfficeData;
  };
  executive: {
    notes?: string;
  };
}

export type MasterState = CasaBlancaStoreData;
