/**
 * Tenant Entity Types (Kreditor/Mandant/Client)
 * Feature-Sliced Design - Entity Layer
 *
 * Tenant = Kreditor = Mandant = Client
 * In debt collection context, the Tenant is the creditor who submits cases
 */

export interface BankAccount {
  iban: string;
  bic?: string;
  bankName?: string;
}

export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
  contactPerson?: string;
  taxId?: string;
  registrationNumber: string; // HRB number
  bankAccount?: BankAccount;
  contactEmail: string; // Legacy field, maps to email
  bankAccountIBAN: string; // Legacy field, maps to bankAccount.iban

  // Stats from backend (optional, populated by API)
  totalDebtors?: number;
  totalCases?: number;
  totalVolume?: number;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// Backend response format (from /api/kreditoren)
export interface BackendTenant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  street: string | null;
  houseNumber: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  contactPerson: string | null;
  taxId: string | null;
  registrationNumber: string;
  iban: string;
  bic: string | null;
  bankName: string | null;
  totalDebtors: number | null;
  totalCases: number | null;
  totalVolume: number | null;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateTenantRequest {
  name: string;
  email: string;
  phone?: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  contactPerson?: string;
  taxId?: string;
  registrationNumber: string;
  iban: string;
  bic?: string;
  bankName?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  email?: string;
  phone?: string;
  street?: string;
  houseNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  contactPerson?: string;
  taxId?: string;
  registrationNumber?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
}

/**
 * Transform backend tenant to frontend Tenant type
 */
export function transformTenant(backend: BackendTenant): Tenant {
  return {
    id: backend.id,
    name: backend.name,
    email: backend.email,
    phone: backend.phone || undefined,
    address: backend.street && backend.city ? {
      street: backend.street,
      houseNumber: backend.houseNumber || '',
      city: backend.city,
      postalCode: backend.postalCode || '',
      country: backend.country || 'Deutschland',
    } : undefined,
    contactPerson: backend.contactPerson || undefined,
    taxId: backend.taxId || undefined,
    registrationNumber: backend.registrationNumber,
    bankAccount: {
      iban: backend.iban,
      bic: backend.bic || undefined,
      bankName: backend.bankName || undefined,
    },
    // Legacy fields for backward compatibility
    contactEmail: backend.email,
    bankAccountIBAN: backend.iban,

    // Stats
    totalDebtors: backend.totalDebtors || undefined,
    totalCases: backend.totalCases || undefined,
    totalVolume: backend.totalVolume || undefined,

    // Metadata
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
  };
}

/**
 * Transform frontend CreateTenantRequest to backend format
 */
export function toBackendCreateRequest(request: CreateTenantRequest): CreateTenantRequest {
  // Currently, the structure matches, so no transformation needed
  // But this function provides a layer for future changes
  return request;
}

/**
 * Transform frontend UpdateTenantRequest to backend format
 */
export function toBackendUpdateRequest(request: UpdateTenantRequest): UpdateTenantRequest {
  // Currently, the structure matches, so no transformation needed
  // But this function provides a layer for future changes
  return request;
}
