export interface Client {
  id: string;
  user_id?: string;
  name: string;
  rfc: string;
  razonSocial: string;
  cp: string;
  regimenFiscal: string;
  isFiscal: boolean;
  isPersonaMoral: boolean;
  status: 'Pagado' | 'Instalación Pendiente' | 'Mensualidad Vencida' | 'En Conciliación';
  subtotal: number;
  lastPaymentDate: string;
  contracts: Array<{
    name: string;
    size: string;
    date: string;
  }>;
}

export interface CashFlowData {
  month: string;
  real: number;
  sat: number;
}

// Cálculo de retenciones mexicanas para Persona Moral (por consultoría/servicios profesionales o RESICO)
export interface TaxBreakdown {
  subtotal: number;
  iva: number;
  retISR: number;
  retIVA: number;
  totalNeto: number;
}

export function calculateMexicanTaxes(subtotal: number, isPersonaMoral: boolean): TaxBreakdown {
  const ivaRate = 0.16;
  const retISRRate = 0.0125; // 1.25% para RESICO / Honorarios
  const retIVARate = 0.106667; // 10.667% (2/3 de IVA)

  const iva = subtotal * ivaRate;
  
  if (isPersonaMoral) {
    const retISR = subtotal * retISRRate;
    const retIVA = subtotal * retIVARate;
    const totalNeto = subtotal + iva - retISR - retIVA;
    return {
      subtotal,
      iva,
      retISR,
      retIVA,
      totalNeto
    };
  } else {
    // Si no es persona moral o no se aplican retenciones
    const totalNeto = subtotal + iva;
    return {
      subtotal,
      iva,
      retISR: 0,
      retIVA: 0,
      totalNeto
    };
  }
}

export const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'Acme de México S.A. de C.V.',
    rfc: 'AME990101AA1',
    razonSocial: 'ACME DE MEXICO SA DE CV',
    cp: '06000',
    regimenFiscal: '601 - General de Ley Personas Morales',
    isFiscal: true,
    isPersonaMoral: true,
    status: 'Mensualidad Vencida',
    subtotal: 50000,
    lastPaymentDate: '2026-04-15',
    contracts: [
      { name: 'Contrato de Servicios de TI - 2026.pdf', size: '2.4 MB', date: '2026-01-10' },
      { name: 'Anexo A - Soporte de Servidores.pdf', size: '1.1 MB', date: '2026-01-12' }
    ]
  },
  {
    id: 'c2',
    name: 'Comercializadora Flecha Azul',
    rfc: 'CFA120415B32',
    razonSocial: 'COMERCIALIZADORA FLECHA AZUL SA DE CV',
    cp: '45000',
    regimenFiscal: '601 - General de Ley Personas Morales',
    isFiscal: true,
    isPersonaMoral: true,
    status: 'Instalación Pendiente',
    subtotal: 75000,
    lastPaymentDate: '2026-05-01',
    contracts: [
      { name: 'Contrato Marco de Consultoría en la Nube.pdf', size: '3.8 MB', date: '2026-04-20' }
    ]
  },
  {
    id: 'c3',
    name: 'Juan Pérez Gómez',
    rfc: 'PEGJ900512XYZ',
    razonSocial: 'JUAN PEREZ GOMEZ',
    cp: '11000',
    regimenFiscal: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
    isFiscal: false,
    isPersonaMoral: false,
    status: 'Pagado',
    subtotal: 15000,
    lastPaymentDate: '2026-05-28',
    contracts: [
      { name: 'Contrato de Asesoría de Negocios Persona Física.pdf', size: '1.7 MB', date: '2026-02-14' }
    ]
  },
  {
    id: 'c4',
    name: 'Inmobiliaria del Norte S.A. de C.V.',
    rfc: 'INO180808N78',
    razonSocial: 'INMOBILIARIA DEL NORTE SA DE CV',
    cp: '64000',
    regimenFiscal: '601 - General de Ley Personas Morales',
    isFiscal: true,
    isPersonaMoral: true,
    status: 'Pagado',
    subtotal: 120000,
    lastPaymentDate: '2026-05-25',
    contracts: [
      { name: 'Contrato de Integración ERP Inmobiliario.pdf', size: '4.2 MB', date: '2026-03-01' }
    ]
  },
  {
    id: 'c5',
    name: 'Desarrollo Web Express S.A.S.',
    rfc: 'DWE211010H12',
    razonSocial: 'DESARROLLO WEB EXPRESS SAS',
    cp: '06700',
    regimenFiscal: '601 - General de Ley Personas Morales',
    isFiscal: true,
    isPersonaMoral: true,
    status: 'Mensualidad Vencida',
    subtotal: 30000,
    lastPaymentDate: '2026-04-10',
    contracts: [
      { name: 'Contrato de Mantenimiento Web Express.pdf', size: '1.5 MB', date: '2025-12-15' }
    ]
  },
  {
    id: 'c6',
    name: 'Consultoría Estratégica Alpha',
    rfc: 'CEA220303T90',
    razonSocial: 'CONSULTORIA ESTRATEGICA ALPHA SA DE CV',
    cp: '03100',
    regimenFiscal: '601 - General de Ley Personas Morales',
    isFiscal: true,
    isPersonaMoral: true,
    status: 'En Conciliación',
    subtotal: 45000,
    lastPaymentDate: '2026-05-29',
    contracts: [
      { name: 'Contrato de Capacitación Corporativa.pdf', size: '2.1 MB', date: '2026-04-05' }
    ]
  }
];

export const mockCashFlow: CashFlowData[] = [
  { month: 'Ene', real: 120000, sat: 100000 },
  { month: 'Feb', real: 155000, sat: 130000 },
  { month: 'Mar', real: 140000, sat: 150000 },
  { month: 'Abr', real: 195000, sat: 170000 },
  { month: 'May', real: 220000, sat: 210000 },
  { month: 'Jun', real: 265000, sat: 240000 }
];
