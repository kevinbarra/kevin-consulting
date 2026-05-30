'use client';

import React, { useState, useEffect } from 'react';
import { usePortalSim } from '../PortalClientLayout';
import { ClientSkeleton } from '@/components/portal/Skeleton';
import { 
  FileText, 
  Download, 
  CreditCard, 
  Building2, 
  FileCode, 
  ShieldCheck, 
  Save,
  AlertCircle,
  Upload,
  RefreshCw
} from 'lucide-react';
import { uploadDocumentAction, getClientDocumentsAction } from '@/app/portal/actions/documentActions';

export default function ClientPage() {
  const { clientProfile, isSimLoading, clientData, updateClientInfo, realBillings, refreshData } = usePortalSim();

  // En producción bajo RLS, clientData contendrá únicamente el registro del cliente logueado
  const simulatedClient = clientData[0];

  // Estado del formulario
  const [rfc, setRfc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [cp, setCp] = useState('');
  const [regimenFiscal, setRegimenFiscal] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Estado para simular progreso de descarga
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Estados para el modal de recibo interno
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Estados para documentos reales de Neon DB
  const [realDocuments, setRealDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedCsfFile, setSelectedCsfFile] = useState<File | null>(null);
  const [isUploadingCsf, setIsUploadingCsf] = useState(false);
  const [csfUploadMessage, setCsfUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag and drop feedback
  const [isDragOver, setIsDragOver] = useState(false);

  // Estados para copiar coordenadas de pago
  const [copiedPaymentField, setCopiedPaymentField] = useState<string | null>(null);

  const copyPaymentField = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPaymentField(fieldId);
    setTimeout(() => {
      setCopiedPaymentField(null);
    }, 2000);
  };

  // Cargar documentos reales desde Neon DB
  useEffect(() => {
    async function loadClientDocs() {
      if (simulatedClient) {
        setIsLoadingDocs(true);
        setCsfUploadMessage(null);
        setSelectedCsfFile(null);
        try {
          const docs = await getClientDocumentsAction(simulatedClient.id);
          setRealDocuments(docs);
        } catch (err) {
          console.error('[CLIENT PORTAL] Error loading docs:', err);
        } finally {
          setIsLoadingDocs(false);
        }
      }
    }
    loadClientDocs();
  }, [simulatedClient]);

  // Sincronizar campos del formulario al cambiar de cliente
  useEffect(() => {
    if (simulatedClient) {
      setRfc(simulatedClient.rfc || '');
      setRazonSocial(simulatedClient.razonSocial || '');
      setCp(simulatedClient.cp || '');
      setRegimenFiscal(simulatedClient.regimenFiscal || '601 - General de Ley Personas Morales');
      setFormErrors({});
    }
  }, [simulatedClient]);

  const handleCsfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCsfFile || !simulatedClient) return;

    setIsUploadingCsf(true);
    setCsfUploadMessage(null);

    const formData = new FormData();
    formData.append('clientId', simulatedClient.id);
    formData.append('documentType', 'CSF');
    formData.append('file', selectedCsfFile);

    try {
      const res = await uploadDocumentAction(formData);
      if (res.success && res.document) {
        setCsfUploadMessage({ type: 'success', text: 'Constancia (CSF) cargada y registrada exitosamente.' });
        setSelectedCsfFile(null);
        const fileInput = document.getElementById('client-csf-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setRealDocuments((prev) => [res.document, ...prev]);
        // Refrescar layout para actualizar contadores de contratos
        await refreshData();
      } else {
        setCsfUploadMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setCsfUploadMessage({ type: 'error', text: err.message || 'Error al procesar el archivo.' });
    } finally {
      setIsUploadingCsf(false);
    }
  };

  // Manejar descargas de facturas simuladas o mockeadas
  const handleDownload = (fileName: string) => {
    if (downloadingFile) return;
    setDownloadingFile(fileName);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingFile(null);
          }, 1000);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // Validaciones del formulario fiscal y envío a la API real
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const cleanRfcVal = rfc.replace(/[\s-]/g, '').toUpperCase();
    if (!cleanRfcVal) {
      errors.rfc = 'El RFC es requerido';
    } else if (cleanRfcVal.length < 12 || cleanRfcVal.length > 13) {
      errors.rfc = 'El RFC debe tener 12 o 13 caracteres';
    }

    if (!razonSocial.trim()) {
      errors.razonSocial = 'La Razón Social es requerida';
    }

    const cpRegex = /^\d{5}$/;
    if (!cp) {
      errors.cp = 'El Código Postal es requerido';
    } else if (!cpRegex.test(cp)) {
      errors.cp = 'El Código Postal debe ser de exactamente 5 dígitos';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSavingForm(true);
    setSaveSuccess(false);

    const isPersonaMoral = cleanRfcVal.length === 12;

    const success = await updateClientInfo(simulatedClient.id, {
      rfc: cleanRfcVal,
      name: razonSocial.trim().toUpperCase(),
      razonSocial: razonSocial.trim().toUpperCase(),
      cp,
      regimenFiscal,
      isPersonaMoral
    });

    setIsSavingForm(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(val);
  };

  // Mostrar esqueleto en carga
  if (isSimLoading || !simulatedClient) {
    return <ClientSkeleton />;
  }

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      {/* Cabecera del Portal */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Portal Autogestionable de Clientes</span>
          <h1 className="text-3xl font-black tracking-tight text-white leading-none">
            Bienvenido, <span className="text-blue-400">{simulatedClient.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-400 text-sm font-light">
            Consulta tus expedientes contractuales, historial contable y edita tus datos fiscales.
          </p>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-slate-900 border border-white/5 text-xs text-slate-300 rounded-full font-medium flex items-center gap-1.5 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Estatus Comercial: Activo
          </span>
        </div>
      </div>

      {/* --- GRID DE CONTENIDO PRINCIPAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda (Contratos e Historial) - Ocupa 2 de 3 columnas */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECCIÓN 1: MIS CONTRATOS (Expedientes en PDF) */}
          <section className="border border-white/10 bg-[#1e293b]/20 backdrop-blur-md rounded-3xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-blue-400" />
                Mis Contratos y Anexos
              </h2>
              <p className="text-slate-400 text-xs font-light">Acceso a tus contratos firmados digitalmente listos para descargar.</p>
            </div>

            <div className="space-y-2.5">
              {isLoadingDocs ? (
                <div className="text-center text-xs text-slate-500 py-6 flex items-center justify-center gap-2">
                  <RefreshCw className="animate-spin text-blue-500" size={14} />
                  Cargando tus expedientes...
                </div>
              ) : realDocuments.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic border border-dashed border-white/5 rounded-2xl">
                  No se han cargado contratos o anexos para este cliente en Neon DB.
                </div>
              ) : (
                realDocuments.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex justify-between items-center p-4 border border-blue-500/10 rounded-2xl bg-blue-500/[0.02] hover:bg-blue-500/[0.05] transition-all group"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden mr-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.1)]">
                        <FileText size={20} />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate" title={doc.file_name}>
                          {doc.file_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-light">
                          {doc.document_type} • Cargado el {new Date(doc.uploaded_at).toLocaleDateString('es-MX')}
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2.5 rounded-full bg-white/5 hover:bg-blue-600 border border-white/5 hover:border-blue-400/30 transition-all text-slate-400 hover:text-white cursor-pointer active:scale-90 shrink-0"
                      title="Descargar Documento"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SECCIÓN 2: HISTORIAL FINANCIERO Y COMPROBANTES CONDICIONALES */}
          <section className="border border-white/10 bg-[#1e293b]/20 backdrop-blur-md rounded-3xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard size={18} className="text-blue-400" />
                Historial de Cuenta y Facturación
              </h2>
              <p className="text-slate-400 text-xs font-light">
                {clientProfile === 'fiscal' 
                  ? 'Descarga directa de comprobantes fiscales timbrados XML y representaciones impresas PDF.' 
                  : 'Recibos electrónicos internos para fines de control de pagos.'}
              </p>
            </div>

            <div className="divide-y divide-white/5">
              {realBillings.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No hay mensualidades o cargos registrados en su historial contable.
                </div>
              ) : (
                realBillings.map((billing) => {
                  const isPaid = billing.status === 'pagado';
                  
                  return (
                    <div key={billing.id} className="py-4 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          {billing.concept}
                          <span className={`px-2 py-0.25 text-[9px] rounded-full font-bold uppercase ${
                            billing.status === 'pagado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            billing.status === 'atrasado' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {billing.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-light flex items-center gap-1.5">
                          <span>Fecha Límite: {new Date(billing.due_date).toLocaleDateString('es-MX')}</span>
                          {billing.paid_at && (
                            <>
                              <span>•</span>
                              <span>Pagado: {new Date(billing.paid_at).toLocaleDateString('es-MX')}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-black text-white">
                            {formatCurrency(parseFloat(billing.total || billing.amount))}
                          </div>
                          <div className="text-[9px] text-slate-500 font-medium">
                            {clientProfile === 'fiscal' ? 'Total Facturado' : 'Monto Recibido'}
                          </div>
                        </div>

                        {/* RENDER CONDICIONAL DE COMPROBANTES (SAT VS RECIBO INTERNO) */}
                        {clientProfile === 'fiscal' ? (
                          <div className="flex gap-1.5">
                            {billing.sat_uuid ? (
                              <>
                                <button
                                  onClick={() => handleDownload('Factura_XML.xml')}
                                  className="py-1.5 px-3 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/20 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-blue-400 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                  title="Comprobante XML"
                                >
                                  <FileCode size={12} />
                                  XML
                                </button>
                                <button
                                  onClick={() => handleDownload('Factura_PDF.pdf')}
                                  className="py-1.5 px-3 bg-white/5 hover:bg-emerald-600/20 border border-white/5 hover:border-emerald-500/20 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-emerald-400 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                  title="Factura PDF"
                                >
                                  <Download size={12} />
                                  PDF
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic px-2">Pendiente SAT</span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReceipt(billing);
                              setIsReceiptModalOpen(true);
                            }}
                            className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 border border-blue-400/30 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <ShieldCheck size={13} />
                            Ver Recibo
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>

        {/* Columna Derecha: Formulario Fiscal Real */}
        <div className="space-y-6">
          {/* Tarjeta Bento de Coordenadas de Pago */}
          <section className="border border-blue-500/10 hover:border-blue-500/30 bg-[#1e293b]/30 backdrop-blur-md rounded-3xl p-6 space-y-4 shadow-lg transition-all">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
              <CreditCard size={18} className="text-blue-400" />
              <span>Instrucciones de Pago BBVA</span>
            </div>
            
            <p className="text-slate-400 text-xs font-light leading-relaxed">
              Realiza tu transferencia electrónica directamente a nuestra cuenta corporativa. El RFC del cliente es tu referencia de conciliación obligatoria.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="border border-white/5 bg-slate-950/40 p-3.5 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">Banco Receptor</span>
                  <span className="font-bold text-white text-right">BBVA México</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase text-slate-400 font-medium">Beneficiario</span>
                  <span className="font-bold text-white text-right text-[11px] truncate max-w-[150px]" title="Kevin Barra Consulting S.A.S.">
                    Kevin Barra Consulting S.A.S.
                  </span>
                </div>

                <div className="border-t border-white/5 pt-2.5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase text-slate-400 font-medium">CLABE Interbancaria</span>
                    <button
                      onClick={() => copyPaymentField('012180012345678901', 'clabe')}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 active:scale-95 transition-all text-[10px] font-bold cursor-pointer"
                    >
                      {copiedPaymentField === 'clabe' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <p className="font-mono font-bold text-white tracking-widest text-xs bg-slate-950 p-2 rounded-xl text-center border border-white/5">
                    012180012345678901
                  </p>
                </div>

                <div className="border-t border-white/5 pt-2.5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase text-slate-400 font-medium">Concepto Sugerido</span>
                    <button
                      onClick={() => copyPaymentField(simulatedClient.rfc, 'concept')}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 active:scale-95 transition-all text-[10px] font-bold cursor-pointer"
                    >
                      {copiedPaymentField === 'concept' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <p className="font-mono font-bold text-emerald-400 tracking-wider text-xs bg-slate-950 p-2 rounded-xl text-center border border-white/5 uppercase">
                    {simulatedClient.rfc}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-white/10 bg-[#1e293b]/20 backdrop-blur-md rounded-3xl p-6 h-fit space-y-5 shadow-lg">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-blue-400" />
                Datos Fiscales
              </h2>
              <p className="text-slate-400 text-xs font-light">
                Mantén actualizados tus datos para asegurar la correcta emisión de tus CFDI 4.0.
              </p>
            </div>

            {/* Aviso especial de perfil regular */}
            {clientProfile === 'regular' && (
              <div className="p-3 border border-amber-500/10 bg-amber-500/5 rounded-2xl text-[10px] text-amber-400 flex gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>
                  Estás operando en perfil de <strong>Público General</strong>. Si requieres CFDI del SAT, llena este formulario y solicita el alta fiscal.
                </p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Razón Social */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Razón Social o Nombre Fiscal</label>
                <input
                  type="text"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border ${formErrors.razonSocial ? 'border-rose-500' : 'border-white/10'} focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors`}
                  placeholder="ACME DE MEXICO SA DE CV"
                />
                {formErrors.razonSocial && (
                  <span className="text-[10px] text-rose-500 font-medium">{formErrors.razonSocial}</span>
                )}
              </div>

              {/* RFC */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">RFC del Contribuyente</label>
                <input
                  type="text"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  maxLength={13}
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border ${formErrors.rfc ? 'border-rose-500' : 'border-white/10'} focus:border-blue-500 rounded-xl text-xs text-white tracking-widest uppercase focus:outline-none transition-colors`}
                  placeholder="AME990101AA1"
                />
                {formErrors.rfc && (
                  <span className="text-[10px] text-rose-500 font-medium">{formErrors.rfc}</span>
                )}
              </div>

              {/* Código Postal */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Código Postal Fiscal</label>
                <input
                  type="text"
                  value={cp}
                  onChange={(e) => setCp(e.target.value.replace(/\D/g, ''))}
                  maxLength={5}
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border ${formErrors.cp ? 'border-rose-500' : 'border-white/10'} focus:border-blue-500 rounded-xl text-xs text-white tracking-wider focus:outline-none transition-colors`}
                  placeholder="06000"
                />
                {formErrors.cp && (
                  <span className="text-[10px] text-rose-500 font-medium">{formErrors.cp}</span>
                )}
              </div>

              {/* Régimen Fiscal */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Régimen Fiscal (SAT)</label>
                <select
                  value={regimenFiscal}
                  onChange={(e) => setRegimenFiscal(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales</option>
                  <option value="605 - Sueldos y Salarios e Ingresos Asimilados a Salarios">605 - Sueldos y Salarios</option>
                  <option value="606 - Arrendamiento">606 - Arrendamiento</option>
                  <option value="612 - Personas Físicas con Actividades Empresariales y Profesionales">612 - P. Físicas con Act. Empresarial</option>
                  <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - RESICO</option>
                </select>
              </div>

              {/* Botón de Guardado */}
              <button
                type="submit"
                disabled={isSavingForm}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-500 disabled:border-white/5 border border-blue-400/40 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                {isSavingForm ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    Guardando en Neon...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Guardar Cambios Fiscales
                  </>
                )}
              </button>

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] text-center font-semibold">
                  ¡Datos fiscales sincronizados correctamente!
                </div>
              )}
            </form>
          </section>

          {/* Cargar CSF */}
          {clientProfile === 'fiscal' && (
            <section className="border border-white/10 bg-[#1e293b]/20 backdrop-blur-md rounded-3xl p-6 space-y-4 shadow-lg">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <Upload size={16} className="text-blue-400" />
                  Actualizar Constancia (CSF)
                </h3>
                <p className="text-slate-400 text-[11px] font-light">
                  Sube tu Constancia de Situación Fiscal actualizada en formato PDF.
                </p>
              </div>

              <form onSubmit={handleCsfUpload} className="space-y-3">
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={() => setIsDragOver(false)}
                  className={`relative border border-dashed rounded-xl p-3.5 bg-slate-950/20 text-center transition-all ${
                    isDragOver ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/15 hover:border-blue-500/50'
                  }`}
                >
                  <input
                    id="client-csf-input"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedCsfFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-xs text-slate-400 font-light space-y-1">
                    {selectedCsfFile ? (
                      <p className="font-semibold text-blue-400 truncate px-2">{selectedCsfFile.name}</p>
                    ) : (
                      <>
                        <p className="text-slate-300 font-semibold">Seleccionar CSF PDF</p>
                        <p className="text-[10px] text-slate-500 font-normal">Arrastra o haz clic aquí</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedCsfFile || isUploadingCsf}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-slate-500 disabled:border-white/5 border border-blue-500/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isUploadingCsf ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      Subiendo archivo...
                    </>
                  ) : (
                    <>
                      <Upload size={13} />
                      Subir CSF a Neon
                    </>
                  )}
                </button>

                {csfUploadMessage && (
                  <div className={`p-2.5 rounded-xl border text-[10px] flex gap-1.5 font-medium ${
                    csfUploadMessage.type === 'success'
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                  }`}>
                    <AlertCircle size={13} className="shrink-0" />
                    <p>{csfUploadMessage.text}</p>
                  </div>
                )}
              </form>
            </section>
          )}
        </div>

      </div>

      {/* --- MODAL FLOTANTE DE RECIBO DIGITAL INTERNO (SOLO NO FISCAL) --- */}
      {isReceiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo obscuro */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
            onClick={() => { setIsReceiptModalOpen(false); setSelectedReceipt(null); }}
          />
          
          {/* Caja del Recibo */}
          <div className="relative w-full max-w-md bg-[#090d16]/95 border border-white/10 rounded-3xl p-6 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabecera / Marca */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">K</div>
                  <span className="font-bold text-xs tracking-tight">Kevin<span className="text-blue-400">Consulting</span></span>
                </div>
                <h3 className="text-sm font-bold text-slate-300 mt-2">Comprobante de Pago Electrónico</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[9px] rounded-full font-bold uppercase">
                {selectedReceipt.status}
              </span>
            </div>

            {/* Detalles del Recibo */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 py-1 border-b border-white/5">
                <div>
                  <span className="text-slate-500 text-[10px]">Folio del Recibo</span>
                  <p className="font-bold font-mono uppercase">{selectedReceipt.id.substring(0, 8)}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px]">Fecha de Pago</span>
                  <p className="font-bold">
                    {selectedReceipt.paid_at 
                      ? new Date(selectedReceipt.paid_at).toLocaleDateString('es-MX') 
                      : new Date(selectedReceipt.due_date).toLocaleDateString('es-MX')}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-500 text-[10px]">Cliente Beneficiario</span>
                <p className="font-bold text-white text-sm">{simulatedClient.name}</p>
              </div>

              <div className="space-y-1.5 border-t border-b border-white/5 py-2">
                <span className="text-slate-500 text-[10px]">Concepto de Pago</span>
                <p className="font-light text-white leading-relaxed">
                  {selectedReceipt.concept}
                </p>
              </div>

              {/* Tabla de Importes (OCULTA IMPUESTOS/SAT TOTALMENTE) */}
              <div className="space-y-1 bg-white/[0.01] p-3 border border-white/5 rounded-2xl">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Monto de Consultoría</span>
                  <span className="font-bold text-white">{formatCurrency(parseFloat(selectedReceipt.total || selectedReceipt.amount))}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5 text-sm">
                  <span className="font-bold text-white">Importe Total Recibido</span>
                  <span className="font-black text-emerald-400">{formatCurrency(parseFloat(selectedReceipt.total || selectedReceipt.amount))}</span>
                </div>
              </div>

              {/* Sello / Validación Digital */}
              <div className="space-y-1">
                <span className="text-slate-500 text-[9px] flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-blue-400" />
                  Sello Digital de Validación Interna
                </span>
                <p className="font-mono text-[9px] text-slate-500 break-all leading-normal bg-slate-950 p-2 rounded-lg border border-white/5">
                  kc_internal_sec_{selectedReceipt.id.replace(/-/g, '')}_verify_sha256
                </p>
              </div>
            </div>

            {/* Acción de cierre */}
            <button
              onClick={() => { setIsReceiptModalOpen(false); setSelectedReceipt(null); }}
              className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200 transition-all cursor-pointer text-center"
            >
              Cerrar Comprobante
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
