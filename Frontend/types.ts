

// Domain Types - Enterprise Level (ZPO Compliant)

export enum UserRole {
  ADMIN = 'ADMIN', // System Admin
  AGENT = 'AGENT', // Sachbearbeiter (Inkasso-Spezialist)
  CLIENT = 'CLIENT', // Mandant (Gläubiger)
  DEBTOR = 'DEBTOR' // Schuldner (Endkunde)
}

// --- Legal Workflow Status Model (ZPO) ---
export enum CaseStatus {
  // 1. Vorgerichtlich
  DRAFT = 'DRAFT',
  NEW = 'NEW',
  REMINDER_1 = 'REMINDER_1',
  REMINDER_2 = 'REMINDER_2', // Letzte Mahnung
  ADDRESS_RESEARCH = 'ADDRESS_RESEARCH', // EMA Anfrage läuft

  // 2. Gerichtliches Mahnverfahren
  PREPARE_MB = 'PREPARE_MB', // Bereit für Mahnbescheid
  MB_REQUESTED = 'MB_REQUESTED', // MB beim Mahngericht beantragt
  MB_ISSUED = 'MB_ISSUED', // MB erlassen & zugestellt
  MB_OBJECTION = 'MB_OBJECTION', // Widerspruch eingelegt (Streitiges Verfahren)

  // 3. Vollstreckungsbescheid
  PREPARE_VB = 'PREPARE_VB', // 2 Wochen Frist abgelaufen
  VB_REQUESTED = 'VB_REQUESTED',
  VB_ISSUED = 'VB_ISSUED', // VB erlassen -> Titel
  TITLE_OBTAINED = 'TITLE_OBTAINED', // Rechtskräftiger Titel liegt vor

  // 4. Zwangsvollstreckung
  ENFORCEMENT_PREP = 'ENFORCEMENT_PREP', // GV Auftrag vorbereiten
  GV_MANDATED = 'GV_MANDATED', // Gerichtsvollzieher beauftragt
  EV_TAKEN = 'EV_TAKEN', // Vermögensauskunft abgegeben

  // 5. Abschluss
  PAID = 'PAID', // Voller Erfolg
  SETTLED = 'SETTLED', // Vergleich
  INSOLVENCY = 'INSOLVENCY', // Insolvenzverfahren
  UNCOLLECTIBLE = 'UNCOLLECTIBLE' // Niederschlagung
}

export enum AddressStatus {
  UNKNOWN = 'UNKNOWN',
  RESEARCH_PENDING = 'RESEARCH_PENDING',
  CONFIRMED = 'CONFIRMED',
  MOVED = 'MOVED',
  DECEASED = 'DECEASED'
}

export enum RiskScore {
  A = 'A', // Excellent
  B = 'B', // Good
  C = 'C', // Average
  D = 'D', // Poor
  E = 'E'  // Default
}

export enum EntityType {
  NATURAL_PERSON = 'NATURAL_PERSON',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
  PARTNERSHIP = 'PARTNERSHIP'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  DIVERSE = 'DIVERSE'
}

export enum DoorPosition {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  MIDDLE = 'MIDDLE'
}

// --- Communication Entities ---

export interface Inquiry {
  id: string;
  caseId: string;
  caseNumber: string; // Invoice number for display
  question: string;
  answer?: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  createdBy: string; // User ID (Agent)
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'EMAIL' | 'LETTER' | 'SMS';
  subject?: string; // For Emails
  content: string; // HTML/Markdown with placeholders
  category: 'REMINDER' | 'LEGAL' | 'PAYMENT' | 'GENERAL';
  lastModified: string;
}

export interface TemplateVariable {
    key: string;
    label: string;
    category: 'Debtor' | 'Case' | 'Kreditor' | 'System';
    example: string;
}

// --- Documents ---
export interface Document {
  id: string;
  debtorId: string;
  name: string;
  type: 'PDF' | 'IMAGE' | 'WORD' | 'EXCEL';
  size: number; // in bytes
  uploadedAt: string;
  url: string; // Mock URL
  previewUrl?: string; // For images
}

// --- Entities ---

export interface Address {
  street?: string;
  houseNumber?: string;  // NEW
  zipCode?: string;
  city?: string;
  cityDistrict?: string;  // NEW (Ortsteil)
  floor?: string;  // NEW (Etage)
  doorPosition?: DoorPosition;  // NEW (Welche Tür)
  additionalAddressInfo?: string;  // NEW (c/o, bei, etc.)
  poBox?: string;  // NEW (Postfach)
  poBoxZipCode?: string;  // NEW (PLZ Postfach)
  country: string;
  status: AddressStatus;
  lastChecked?: string;
}

export interface Kreditor {
  id: string;

  // Entity Type
  entityType: EntityType;

  // Natural Person Fields (same as Debtor)
  firstName?: string;
  lastName?: string;
  birthName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  birthPlace?: string;
  birthCountry?: string;

  // Legal Entity Fields
  name: string;  // Company name (existing)
  registrationNumber: string;  // HRB-Nummer (existing)
  registerCourt?: string;
  vatId?: string;

  // Address
  street?: string;
  houseNumber?: string;
  zipCode?: string;
  city?: string;
  cityDistrict?: string;
  floor?: string;
  doorPosition?: DoorPosition;
  additionalAddressInfo?: string;
  poBox?: string;
  poBoxZipCode?: string;
  country?: string;

  // Representative
  representedBy?: string;
  isDeceased?: boolean;
  placeOfDeath?: string;

  // Contact
  contactEmail: string;  // Keep existing name
  phoneLandline?: string;
  phoneMobile?: string;
  fax?: string;
  eboAddress?: string;

  // Banking
  bankAccountIBAN: string;  // Keep existing name
  bankBIC?: string;
  bankName?: string;

  // Partnership
  partners?: string;

  // Business
  fileReference?: string;

  // Stats (KEEP existing)
  totalDebtors?: number;
  totalCases?: number;
  totalVolume?: number;
}

export interface Debtor {
  id: string;
  kreditorId: string;
  agentId?: string;

  // Entity Type (replaces isCompany)
  entityType: EntityType;

  // Natural Person Fields
  firstName?: string;
  lastName?: string;
  birthName?: string;  // Geburtsname
  gender?: Gender;
  dateOfBirth?: string;
  birthPlace?: string;  // Geburtsort
  birthCountry?: string;  // Geburtsland

  // Legal Entity Fields
  companyName?: string;
  registerCourt?: string;  // Handelsregister (Amtsgericht)
  registerNumber?: string;  // HRB-Nummer
  vatId?: string;  // USt-ID

  // Address (embedded)
  street?: string;
  houseNumber?: string;
  zipCode?: string;
  city?: string;
  cityDistrict?: string;
  floor?: string;
  doorPosition?: DoorPosition;
  additionalAddressInfo?: string;
  poBox?: string;
  poBoxZipCode?: string;
  country: string;
  addressStatus: AddressStatus;
  addressLastChecked?: string;

  // Representative
  representedBy?: string;  // Vertreten durch
  isDeceased?: boolean;  // Verstorben
  placeOfDeath?: string;  // Sterbeort

  // Contact
  email?: string;
  phoneLandline?: string;  // Telefon Festnetz
  phoneMobile?: string;  // Telefon Mobil
  fax?: string;
  eboAddress?: string;  // Ebo-Adresse

  // Banking
  bankIBAN?: string;
  bankBIC?: string;
  bankName?: string;

  // Partnership
  partners?: string;  // JSON string array

  // Business
  fileReference?: string;  // Aktenzeichen

  // Statistics (KEEP existing)
  riskScore: RiskScore;
  totalDebt: number;
  openCases: number;
  notes?: string;

  // Backwards compatibility
  isCompany?: boolean;  // Computed: entityType !== NATURAL_PERSON
  phone?: string;  // Computed: phoneLandline ?? phoneMobile
  address?: Address;  // Computed from embedded fields

  // Display name helper
  displayName?: string;
}

export interface CollectionCase {
  id: string;
  kreditorId: string;
  kreditorName?: string; // View Prop
  debtorId: string;
  debtorName: string; // View Prop
  agentId?: string; // Assigned Agent

  // Financials
  principalAmount: number; // Hauptforderung
  costs: number; // Mahnkosten / Gerichtskosten
  interest: number; // Zinsen
  totalAmount: number; // Calculated (Principal + Costs + Interest)
  currency: string;

  // Workflow
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: CaseStatus;
  nextActionDate?: string; // Wiedervorlage / Fristende
  createdAt?: string; // Creation timestamp

  // Legal Data
  competentCourt?: string; // Zuständiges Mahngericht (automatisch ermittelt)
  courtFileNumber?: string; // Aktenzeichen (wenn vorhanden)

  // NEW: Claim Details (Forderung per PDF requirements)
  dateOfOrigin?: string;  // Tag der Entstehung
  claimDescription?: string;  // Exakte Beschreibung
  interestStartDate?: string;  // Zinslauf Beginn
  interestRate?: number;  // Zinshöhe
  isVariableInterest?: boolean;  // Basiszins gekoppelt
  interestEndDate?: string;  // Zinsende
  additionalCosts?: number;  // Nebenkosten
  procedureCosts?: number;  // Verfahrenskosten
  interestOnCosts?: boolean;  // Zinslauf Verfahrenskosten
  statuteOfLimitationsDate?: string;  // Verjährungsfrist
  paymentAllocationNotes?: string;  // Zahlungsverrechnung §§ 366, 367 BGB

  // KEEP existing
  history: AuditLogEntry[];
  aiAnalysis?: string;
  attachments?: string[];
}

export interface AuditLogEntry {
  id: string;
  date: string;
  action: string; // e.g., "STATUS_CHANGE", "DOCUMENT_GENERATED"
  details: string;
  actor: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string; // For CLIENT users (Single Tenant)
  assignedTenantIds?: string[]; // For AGENT users (Multiple Tenants)
  avatarInitials?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface DashboardStats {
  totalVolume: number;
  activeCases: number;
  legalCases: number; // In court phase
  successRate: number;
  projectedRecovery: number;
}

// --- Dashboard Customization Types ---
export type WidgetType = 
  | 'STATS_OVERVIEW' 
  | 'FINANCIAL_CHART' 
  | 'INQUIRIES_LIST' 
  | 'URGENT_TASKS' 
  | 'QUICK_ACTIONS' 
  | 'PERFORMANCE_BARS'
  | 'RISK_RADAR'
  | 'CONVERSION_FUNNEL'
  | 'ACTIVITY_HEATMAP';

export interface DashboardWidgetConfig {
  id: string;
  type: WidgetType;
  visible: boolean;
  order: number;
  colSpan: 1 | 2 | 3 | 4; // Responsive Grid Span
}

// --- Global Search & Notifications ---

export interface SearchResult {
  id: string;
  type: 'CASE' | 'DEBTOR' | 'TENANT';
  title: string;
  subtitle: string;
  link: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
}

// --- Import & Mappings ---
export type ImportProviderType = 'CUSTOM' | 'DATEV' | 'SAP' | 'LEXWARE' | 'SEVDESK';

export interface ImportMapping {
  systemField: string;
  csvHeader: string | null;
  required: boolean;
  label: string;
}

export interface CsvPreviewRow {
  [key: string]: string;
}