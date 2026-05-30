export type UserRole = 'admin' | 'client';
export type BillingStatus = 'pagado' | 'pendiente' | 'atrasado';
export type DocumentTypeEnum = 'Contrato' | 'Addendum' | 'CSF';
export type ServiceType = 'recurrente' | 'instalacion_proyecto';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: Date;
}

export interface Client {
  id: string;
  user_id: string;
  business_name: string;
  legal_name: string;
  rfc: string;
  postal_code: string;
  tax_regime: string;
  cfdi_use: string;
  fiscal_tracked: boolean;
  cutoff_day: number;
  created_at: Date;
}

export interface Billing {
  id: string;
  client_id: string;
  service_id?: string | null; // FK to contracts_services — optional
  concept: string;
  amount: number;
  status: BillingStatus;
  payment_form?: string | null;
  bank_destination?: string | null;
  sat_uuid?: string | null; // Optional/nullable to support fiscal_tracked = false
  due_date: string; // ISO date string YYYY-MM-DD
  paid_at?: string | null;
  payment_date?: string | null;
  created_at: string;
}

// Represents a row in the contracts_services table
export interface ContractService {
  id: string;
  client_id: string;
  service_name: string;
  service_type: ServiceType;
  total_amount: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
}

// Client response interface that accommodates the fiscal_tracked = false omit rule
export interface ClientResponse {
  id: string;
  user_id: string;
  business_name: string;
  legal_name: string;
  cutoff_day: number;
  fiscal_tracked: boolean;
  created_at: string;
  
  // Fiscal fields are optional/omitted if fiscal_tracked is false
  rfc?: string;
  postal_code?: string;
  tax_regime?: string;
  cfdi_use?: string;
}

// Billing response interface that accommodates the fiscal switch details
export interface BillingResponse {
  id: string;
  client_id: string;
  concept: string;
  status: BillingStatus;
  due_date: string;
  paid_at?: string | null;
  created_at: string;
  payment_form?: string | null;
  bank_destination?: string | null;
  
  // Base details
  fiscal_tracked: boolean;
  
  // If fiscal_tracked is true, amount is the gross amount (subtotal), and breakdown details are calculated
  subtotal?: number;
  iva?: number;
  retencion_isr?: number;
  retencion_iva?: number;
  sat_uuid?: string | null;
  
  // The absolute total amount paid/due. If fiscal_tracked is false, this is identical to amount.
  total: number;
}

// Response type for GET /api/invoices
export type InvoiceStatus = 'ok' | 'processing_sat';

export interface InvoiceResponse {
  status: InvoiceStatus;
  billing_id: string;
  fiscal_tracked: boolean;
  // If status === 'processing_sat'
  message?: string;
  // If fiscal_tracked = true and sat_uuid exists
  sat_data?: {
    sat_uuid: string;
    rfc: string;
    legal_name: string;
    subtotal: number;
    iva: number;
    retencion_isr?: number;
    retencion_iva?: number;
    total: number;
  };
  // If fiscal_tracked = false
  internal_receipt?: {
    signature: string;       // kc_internal_sec_[UUID]_verify_sha256
    concept: string;
    amount: number;
    payment_date: string;
    issued_to: string;       // business_name
    issued_by: string;       // 'Kevin Consulting'
    billing_id: string;
  };
}
