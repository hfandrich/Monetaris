/**
 * Debtor Entity Types
 * Feature-Sliced Design - Entity Layer
 */

export type RiskScore = 'A' | 'B' | 'C' | 'D' | 'E';
export type AddressStatus = 'UNKNOWN' | 'CONFIRMED' | 'MOVED' | 'DECEASED' | 'RESEARCH_PENDING';

export interface Address {
  street: string;
  zipCode: string;
  city: string;
  country: string;
  status: AddressStatus;
  lastChecked?: string;
}

export interface Debtor {
  id: string;
  tenantId: string;
  agentId?: string;
  isCompany: boolean;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  address: Address;
  riskScore: RiskScore;
  totalDebt: number;
  openCases: number;
  notes?: string;
}

// Backend response format
export interface BackendDebtor {
  id: string;
  tenantId: string;
  agentId: string | null;
  isCompany: boolean;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
  addressStatus: number;
  addressLastChecked: string | null;
  riskScore: number;
  totalDebt: number;
  openCases: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tenantName?: string;
  agentName?: string | null;
  displayName?: string;
}

// Transformation maps
export const RISK_SCORE_MAP: Record<number, RiskScore> = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E'
};

export const ADDRESS_STATUS_MAP: Record<number, AddressStatus> = {
  0: 'UNKNOWN',
  1: 'CONFIRMED',
  2: 'MOVED',
  3: 'DECEASED',
  4: 'RESEARCH_PENDING'
};

export function transformDebtor(backend: BackendDebtor): Debtor {
  return {
    id: backend.id,
    tenantId: backend.tenantId,
    agentId: backend.agentId || undefined,
    isCompany: backend.isCompany,
    companyName: backend.companyName || undefined,
    firstName: backend.firstName || undefined,
    lastName: backend.lastName || undefined,
    email: backend.email,
    phone: backend.phone,
    address: {
      street: backend.street,
      zipCode: backend.zipCode,
      city: backend.city,
      country: backend.country,
      status: ADDRESS_STATUS_MAP[backend.addressStatus] || 'UNKNOWN',
      lastChecked: backend.addressLastChecked || undefined,
    },
    riskScore: RISK_SCORE_MAP[backend.riskScore] || 'C',
    totalDebt: backend.totalDebt,
    openCases: backend.openCases,
    notes: backend.notes || undefined,
  };
}
