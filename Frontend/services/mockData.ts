/**
 * @deprecated This file is no longer used in production.
 * The application now uses real Backend REST API instead of mock data.
 * This file is kept for reference and development purposes only.
 */

import { CollectionCase, CaseStatus, Debtor, Tenant, User, UserRole, RiskScore, AddressStatus, AuditLogEntry, Inquiry, Document, CommunicationTemplate } from '../types';

// --- Generators ---
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();

// --- Constants for German Context ---
const firstNames = ["Max", "Julia", "Stefan", "Anna", "Michael", "Sarah", "Thomas", "Laura", "Andreas", "Lisa", "Kevin", "Chantal", "Robert", "Petra", "Klaus", "Monika", "Jan", "Christina", "David", "Maria"];
const lastNames = ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann"];
const companies = ["TechLogistik GmbH", "Bäckerei Hans", "Müller Bau KG", "Global Solutions AG", "Kfz-Werkstatt Meier", "Design Studio Nord", "Alpha Consulting", "Gastro Service West", "IT-Systemhaus Berlin", "Handwerk & Co.", "Solar Energie Plus", "Medizinbedarf Süd"];
const cities = ["Berlin", "München", "Hamburg", "Köln", "Frankfurt", "Stuttgart", "Hagen", "Coburg", "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hannover"];
const streets = ["Hauptstraße", "Bahnhofstraße", "Lindenallee", "Industriestraße", "Gartenweg", "Marktplatz", "Schulstraße", "Dorfstraße", "Bergstraße", "Waldweg"];

// --- Seed Tenants ---
export const SEED_TENANTS: Tenant[] = [
  { id: 't1', name: 'TechSolutions GmbH', registrationNumber: 'HRB-12345', contactEmail: 'finance@techsolutions.de', bankAccountIBAN: 'DE45 1000 0000 1234 5678 90' },
  { id: 't2', name: 'MediCare Praxisverbund', registrationNumber: 'HRB-98765', contactEmail: 'abrechnung@medicare.de', bankAccountIBAN: 'DE89 5000 0000 9876 5432 10' },
  { id: 't3', name: 'GreenEnergy e.G.', registrationNumber: 'GnR-5521', contactEmail: 'buchhaltung@greenenergy.de', bankAccountIBAN: 'DE12 3456 7890 1234 5678 99' },
  { id: 't4', name: 'Immobilien Haie KG', registrationNumber: 'HRA-8821', contactEmail: 'miete@immo-haie.de', bankAccountIBAN: 'DE33 9876 5432 1098 7654 32' },
  { id: 't5', name: 'WebShop24', registrationNumber: 'HRB-3321', contactEmail: 'payment@webshop24.com', bankAccountIBAN: 'DE77 1111 2222 3333 4444 55' },
];

// --- Seed Users (Agents & Portals) ---
export const SEED_USERS: User[] = [
  // Agents
  { id: 'u0', name: 'System Administrator', email: 'admin@monetaris.com', role: UserRole.ADMIN, avatarInitials: 'SA' }, 
  { id: 'u1', name: 'Sarah Connor (Admin)', email: 'sarah@monetaris.com', role: UserRole.ADMIN, avatarInitials: 'SC' }, 
  
  // Agents with Restricted Tenant Access
  { 
    id: 'u2', 
    name: 'Max Mustermann (Agent)', 
    email: 'max@monetaris.com', 
    role: UserRole.AGENT, 
    avatarInitials: 'MM',
    assignedTenantIds: ['t1', 't2', 't3', 't4', 't5'] // Access to all for demo purposes, but own cases will differ
  },
  { 
    id: 'u3', 
    name: 'James Bond (Agent)', 
    email: '007@monetaris.com', 
    role: UserRole.AGENT, 
    avatarInitials: 'JB',
    assignedTenantIds: ['t3', 't4', 't5'] 
  },
  { 
    id: 'u4', 
    name: 'Lara Croft (Agent)', 
    email: 'lara@monetaris.com', 
    role: UserRole.AGENT, 
    avatarInitials: 'LC',
    assignedTenantIds: ['t1', 't3', 't5'] 
  },
  
  // Client Portal User
  { id: 'client1', name: 'Sabine Client (TechSolutions)', email: 'client@techsolutions.de', role: UserRole.CLIENT, tenantId: 't1', avatarInitials: 'SC' },
  
  // Debtor Portal User
  { id: 'debtor1', name: 'Max Muster (Schuldner)', email: 'max@muster.de', role: UserRole.DEBTOR, avatarInitials: 'MM' },
];

// --- Generate Massive Data ---

export const SEED_DEBTORS: Debtor[] = [];
export const SEED_CASES: CollectionCase[] = [];

// 1. Specific Debtor for the Portal User "max@muster.de"
const portalDebtorId = 'd-1000';
SEED_DEBTORS.push({
    id: portalDebtorId,
    tenantId: 't1', // TechSolutions
    agentId: 'u2', // Assign to Max for visibility
    isCompany: false,
    firstName: 'Max',
    lastName: 'Muster',
    email: 'max@muster.de', // Matches the User Email
    phone: '0171 1234567',
    address: { street: 'Musterweg 1', zipCode: '10115', city: 'Berlin', country: 'DE', status: AddressStatus.CONFIRMED },
    riskScore: RiskScore.C,
    totalDebt: 0,
    openCases: 0,
    notes: "Portal Test Account"
});

// 2. Generate Cases for Portal Debtor (Robustness Test)
const portalCasesCount = 5;
const portalDebtor = SEED_DEBTORS[0];

for(let k=0; k < portalCasesCount; k++) {
    const status = randomItem([CaseStatus.NEW, CaseStatus.REMINDER_1, CaseStatus.PAID]);
    const principal = randomInt(50, 1200);
    const costs = 25.00;
    const interest = 12.50;
    const tenant = randomItem(SEED_TENANTS);
    
    SEED_CASES.push({
        id: `c-portal-${k}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        debtorId: portalDebtorId,
        debtorName: 'Muster, Max',
        agentId: 'u2', // Explicitly Max
        principalAmount: principal,
        costs: costs,
        interest: interest,
        totalAmount: principal + costs + interest,
        currency: 'EUR',
        invoiceNumber: k === 0 ? 'RE-PORTAL-TEST' : `RE-2024-${1000+k}`,
        invoiceDate: new Date(Date.now() - 86400000 * (60 + k*5)).toISOString(),
        dueDate: new Date(Date.now() - 86400000 * (30 + k*5)).toISOString(),
        status: status,
        history: [],
        aiAnalysis: "Portal Account Case"
    });

    if (status !== CaseStatus.PAID) {
        portalDebtor.totalDebt += (principal + costs + interest);
        portalDebtor.openCases += 1;
    }
}


// Generate 150 Random Debtors
for (let i = 0; i < 150; i++) {
  const isCompany = Math.random() > 0.7;
  const tenant = randomItem(SEED_TENANTS); // Random tenant origin
  
  // Explicitly distribute ownership: 
  // 'u0' (Admin) gets 20%
  // 'u2' (Max) gets 40%
  // Others get rest
  let assignedAgent = 'u2';
  const rand = Math.random();
  if (rand < 0.2) assignedAgent = 'u0'; // Admin own cases
  else if (rand < 0.6) assignedAgent = 'u2';
  else if (rand < 0.8) assignedAgent = 'u3';
  else assignedAgent = 'u4';
  
  const companyName = isCompany ? randomItem(companies) + " " + randomItem(['GmbH', 'KG', 'Limited']) : undefined;
  const firstName = !isCompany ? randomItem(firstNames) : undefined;
  const lastName = !isCompany ? randomItem(lastNames) : undefined;
  const city = randomItem(cities);

  const debtorId = `d-${1001 + i}`;

  SEED_DEBTORS.push({
    id: debtorId,
    tenantId: tenant.id,
    agentId: assignedAgent, // OWNERSHIP
    isCompany,
    companyName,
    firstName,
    lastName,
    email: `kontakt@${isCompany ? 'firma.de' : 'web.de'}`,
    phone: `0${randomInt(150, 179)} / ${randomInt(100000, 999999)}`,
    address: {
      street: `${randomItem(streets)} ${randomInt(1, 150)}`,
      zipCode: `${randomInt(10000, 99999)}`,
      city: city,
      country: 'Deutschland',
      status: Math.random() > 0.8 ? AddressStatus.RESEARCH_PENDING : AddressStatus.CONFIRMED,
      lastChecked: new Date().toISOString()
    },
    riskScore: randomItem([RiskScore.A, RiskScore.B, RiskScore.B, RiskScore.C, RiskScore.C, RiskScore.D, RiskScore.E]),
    totalDebt: 0, // Calculated via cases
    openCases: 0,
    notes: Math.random() > 0.5 ? "Schuldner bittet um Ratenzahlung. Kontakt nur per Mail." : undefined
  });
}


// Generate 400 Random Cases
const statusDistribution = [
  CaseStatus.NEW, CaseStatus.NEW, CaseStatus.NEW,
  CaseStatus.REMINDER_1, CaseStatus.REMINDER_1,
  CaseStatus.REMINDER_2, CaseStatus.REMINDER_2,
  CaseStatus.PREPARE_MB, CaseStatus.PREPARE_MB, 
  CaseStatus.MB_REQUESTED, CaseStatus.MB_ISSUED,
  CaseStatus.PREPARE_VB,
  CaseStatus.TITLE_OBTAINED,
  CaseStatus.GV_MANDATED,
  CaseStatus.PAID, CaseStatus.PAID,
  CaseStatus.INSOLVENCY,
  CaseStatus.UNCOLLECTIBLE
];

for (let i = 0; i < 400; i++) {
  const debtor = SEED_DEBTORS[randomInt(1, SEED_DEBTORS.length - 1)]; // Skip first debtor (manual)
  const tenant = SEED_TENANTS.find(t => t.id === debtor.tenantId) || SEED_TENANTS[0];
  const status = randomItem(statusDistribution);
  
  const principal = randomInt(80, 5000);
  let costs = 5.00;
  if ([CaseStatus.MB_REQUESTED, CaseStatus.MB_ISSUED, CaseStatus.PREPARE_VB].includes(status)) costs += 36.00; 
  if ([CaseStatus.TITLE_OBTAINED, CaseStatus.GV_MANDATED].includes(status)) costs += 80.00; 
  
  const interest = Math.floor(principal * 0.05); 
  
  const invoiceDate = randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31));
  const dueDate = new Date(new Date(invoiceDate).getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();
  
  let nextActionDate = undefined;
  if (status === CaseStatus.PREPARE_MB) nextActionDate = new Date().toISOString(); 
  
  // Case inherits Agent from Debtor to ensure consistency
  const agentId = debtor.agentId; 

  SEED_CASES.push({
    id: `c-${2000 + i}`,
    tenantId: debtor.tenantId,
    tenantName: tenant.name,
    debtorId: debtor.id,
    debtorName: debtor.companyName || `${debtor.lastName}, ${debtor.firstName}`,
    agentId: agentId, // OWNERSHIP
    principalAmount: principal,
    costs,
    interest,
    totalAmount: principal + costs + interest,
    currency: 'EUR',
    invoiceNumber: `RE-${new Date(invoiceDate).getFullYear()}-${randomInt(10000, 99999)}`,
    invoiceDate,
    dueDate,
    status,
    nextActionDate,
    competentCourt: 'Amtsgericht Coburg - Zentrales Mahngericht',
    courtFileNumber: [CaseStatus.MB_REQUESTED, CaseStatus.MB_ISSUED, CaseStatus.TITLE_OBTAINED].includes(status) ? `23-${randomInt(10000,99999)}` : undefined,
    history: [
        { id: generateId('log'), date: invoiceDate, action: 'INVOICE_CREATED', details: 'Rechnung importiert', actor: 'System' }
    ],
    aiAnalysis: Math.random() > 0.8 ? "Hohes Ausfallrisiko erkannt." : undefined
  });
  
  if (status !== CaseStatus.PAID && status !== CaseStatus.UNCOLLECTIBLE) {
    debtor.totalDebt += principal + costs + interest;
    debtor.openCases += 1;
  }
}

// --- Generate Documents ---
export const SEED_DOCUMENTS: Document[] = [];
SEED_DEBTORS.forEach(debtor => {
    if (Math.random() > 0.7) {
        SEED_DOCUMENTS.push({
            id: generateId('doc'),
            debtorId: debtor.id,
            name: `Vertrag_${debtor.lastName || 'Firma'}.pdf`,
            type: 'PDF',
            size: randomInt(102400, 2048000),
            uploadedAt: randomDate(new Date(2024,0,1), new Date()),
            url: '#'
        });
    }
});

export const SEED_INQUIRIES: Inquiry[] = [
  { 
    id: 'inq-1', 
    caseId: SEED_CASES[0].id, 
    caseNumber: SEED_CASES[0].invoiceNumber,
    question: "Die Adresse des Schuldners ist unzustellbar. Haben Sie eine alternative Telefonnummer?", 
    status: 'OPEN', 
    createdAt: new Date().toISOString(),
    createdBy: 'u2'
  },
  { 
    id: 'inq-2', 
    caseId: SEED_CASES[5].id, 
    caseNumber: SEED_CASES[5].invoiceNumber,
    question: "Schuldner bestreitet die Forderungshöhe. Bitte prüfen.", 
    status: 'OPEN', 
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'u2'
  }
];

// --- Templates ---
export const SEED_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'tpl-1',
    name: '1. Mahnung (Freundlich)',
    type: 'EMAIL',
    category: 'REMINDER',
    subject: 'Zahlungserinnerung: Rechnung {{case.invoiceNumber}}',
    content: `<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
    <p>sicher haben Sie es im Alltagsstress einfach übersehen: Die Rechnung <strong>{{case.invoiceNumber}}</strong> vom {{case.invoiceDate}} ist noch offen.</p>
    <p>Bitte überweisen Sie den Betrag von <strong>{{case.totalAmount}}</strong> bis zum <strong>{{case.dueDate}}</strong> auf das unten genannte Konto.</p>
    <p>Sollten Sie die Zahlung bereits geleistet haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.</p>
    <br>
    <p>Mit freundlichen Grüßen,</p>
    <p>{{tenant.name}}</p>`,
    lastModified: new Date().toISOString()
  },
  {
    id: 'tpl-2',
    name: '2. Mahnung (Bestimmt)',
    type: 'LETTER',
    category: 'REMINDER',
    content: `<h2>2. Mahnung</h2>
    <p><strong>Aktenzeichen: {{case.id}}</strong></p>
    <p>Sehr geehrte Damen und Herren,</p>
    <p>leider konnten wir trotz unserer Erinnerung noch keinen Zahlungseingang für die Rechnung <strong>{{case.invoiceNumber}}</strong> feststellen.</p>
    <p>Wir bitten Sie nunmehr nachdrücklich, den fälligen Gesamtbetrag von <strong>{{case.totalAmount}}</strong> (inkl. Mahngebühren) umgehend zu begleichen.</p>
    <p>Fälligkeitsdatum: <strong>{{case.dueDate}}</strong></p>
    <br>
    <p>Hochachtungsvoll,</p>
    <p>{{tenant.name}} Buchhaltung</p>`,
    lastModified: new Date().toISOString()
  },
  {
    id: 'tpl-3',
    name: 'Letzte Mahnung (Ultimativ)',
    type: 'LETTER',
    category: 'REMINDER',
    content: `<h2 style="color:red">LETZTE MAHNUNG</h2>
    <p><strong>Vermeidung gerichtlicher Maßnahmen</strong></p>
    <p>Sehr geehrte(r) {{debtor.lastName}},</p>
    <p>da Sie auf unsere bisherigen Mahnungen nicht reagiert haben, fordern wir Sie hiermit letztmalig auf, die Forderung zu begleichen.</p>
    <p>Offener Betrag: <strong>{{case.totalAmount}}</strong></p>
    <p>Zahlen Sie bis spätestens <strong>{{case.dueDate}}</strong>. Andernfalls werden wir die Forderung an unsere Rechtsanwälte zur gerichtlichen Betreibung übergeben. Die hierdurch entstehenden erheblichen Mehrkosten gehen zu Ihren Lasten.</p>
    <br>
    <p>Mit freundlichen Grüßen,</p>
    <p>{{tenant.name}} - Rechtsabteilung</p>`,
    lastModified: new Date().toISOString()
  },
  {
    id: 'tpl-4',
    name: 'Ratenzahlungsvereinbarung',
    type: 'LETTER',
    category: 'GENERAL',
    content: `<h2>Ratenzahlungsvereinbarung</h2>
    <p>zwischen {{tenant.name}} (Gläubiger) und {{debtor.firstName}} {{debtor.lastName}} (Schuldner).</p>
    <p>Der Schuldner erkennt die Forderung in Höhe von {{case.totalAmount}} vollumfänglich an.</p>
    <p>Zur Tilgung wird eine monatliche Rate von 50,00 EUR vereinbart, zahlbar zum 1. eines jeden Monats.</p>
    <p>Bei Verzug mit einer Rate wird der gesamte Restbetrag sofort fällig.</p>
    <br><br>
    <p>_______________________<br>Unterschrift Schuldner</p>`,
    lastModified: new Date().toISOString()
  },
  {
    id: 'tpl-5',
    name: 'Rechtliches Mahnverfahren (Info)',
    type: 'EMAIL',
    category: 'LEGAL',
    subject: 'Einleitung gerichtliches Mahnverfahren - Akte {{case.id}}',
    content: `<p>Sehr geehrte Damen und Herren,</p>
    <p>wir informieren Sie hiermit, dass wir für die Akte <strong>{{case.invoiceNumber}}</strong> heute den Antrag auf Erlass eines Mahnbescheids beim zuständigen Mahngericht eingereicht haben.</p>
    <p>Hauptforderung: {{case.principalAmount}}</p>
    <p>Verfahrenskosten: {{case.costs}}</p>
    <br>
    <p>Mit freundlichen Grüßen,</p>
    <p>Monetaris Legal Team</p>`,
    lastModified: new Date().toISOString()
  }
];
