/**
 * @deprecated This file is no longer used in production.
 * The application now uses real Backend REST API via HttpClient.
 * This file is kept for reference and development purposes only.
 */

import { CollectionCase, Debtor, Tenant, User, Inquiry, Document, CommunicationTemplate } from '../types';
import { SEED_CASES, SEED_DEBTORS, SEED_TENANTS, SEED_INQUIRIES, SEED_DOCUMENTS, SEED_USERS, SEED_TEMPLATES } from './mockData';

/**
 * DATABASE CONFIGURATION
 * ----------------------
 * This class simulates a real database connection.
 * DEPRECATED: Use dataService.ts which now calls the Backend REST API.
 */

// Bumped version to v2 to force new seed data load
const DB_KEY = 'monetaris_enterprise_db_v2';

interface DatabaseSchema {
    cases: CollectionCase[];
    debtors: Debtor[];
    tenants: Tenant[];
    users: User[];
    inquiries: Inquiry[];
    documents: Document[];
    templates: CommunicationTemplate[];
}

class Database {
    private data: DatabaseSchema;
    private initialized: boolean = false;

    constructor() {
        // 1. Try to load existing data from persistence
        const stored = localStorage.getItem(DB_KEY);
        
        if (stored) {
            console.log('[Database] Connection established. Loading persistent data.');
            this.data = JSON.parse(stored);
        } else {
            console.log('[Database] No existing data found. Seeding initial mock data.');
            // 2. If empty, SEED with Mock Data
            this.data = {
                cases: SEED_CASES,
                debtors: SEED_DEBTORS,
                tenants: SEED_TENANTS,
                users: SEED_USERS,
                inquiries: SEED_INQUIRIES,
                documents: SEED_DOCUMENTS,
                templates: SEED_TEMPLATES
            };
            this.persist();
        }
        this.initialized = true;
    }

    // --- Core Methods (Simulating Async DB Operations) ---

    private persist() {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('[Database] Write Error (Quota Exceeded?):', e);
        }
    }

    private async simulateNetworkDelay<T>(data: T): Promise<T> {
        // Simulates network latency (50-300ms) for realistic UI loading states
        return new Promise(resolve => {
            setTimeout(() => resolve(data), Math.random() * 250 + 50);
        });
    }

    // --- Generic Accessors ---

    async getAll<K extends keyof DatabaseSchema>(table: K): Promise<DatabaseSchema[K]> {
        return this.simulateNetworkDelay(this.data[table]);
    }

    async getById<K extends keyof DatabaseSchema>(table: K, id: string): Promise<DatabaseSchema[K][0] | undefined> {
        // @ts-ignore - We know the structure has an 'id' field
        const item = this.data[table].find((i: any) => i.id === id);
        return this.simulateNetworkDelay(item);
    }

    async create<K extends keyof DatabaseSchema>(table: K, item: any): Promise<any> {
        // @ts-ignore
        this.data[table].unshift(item);
        this.persist();
        return this.simulateNetworkDelay(item);
    }

    async update<K extends keyof DatabaseSchema>(table: K, id: string, updates: any): Promise<void> {
        // @ts-ignore
        const idx = this.data[table].findIndex((i: any) => i.id === id);
        if (idx !== -1) {
            // @ts-ignore
            this.data[table][idx] = { ...this.data[table][idx], ...updates };
            this.persist();
        }
        return this.simulateNetworkDelay(undefined);
    }

    // --- Specialized Queries (Simulating SQL/Filters) ---

    async queryCasesByStatus(status: string): Promise<CollectionCase[]> {
        const result = this.data.cases.filter(c => c.status === status);
        return this.simulateNetworkDelay(result);
    }

    async searchGlobal(query: string): Promise<any[]> {
        const q = query.toLowerCase();
        const results: any[] = [];

        // Search Cases
        this.data.cases.forEach(c => {
            if (c.invoiceNumber.toLowerCase().includes(q) || c.debtorName.toLowerCase().includes(q)) {
                results.push({ ...c, type: 'CASE' });
            }
        });

        // Search Debtors
        this.data.debtors.forEach(d => {
            const name = d.companyName || `${d.lastName}, ${d.firstName}`;
            if (name.toLowerCase().includes(q)) {
                results.push({ ...d, type: 'DEBTOR' });
            }
        });

        return this.simulateNetworkDelay(results.slice(0, 10));
    }
}

export const db = new Database();
