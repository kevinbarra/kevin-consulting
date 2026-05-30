'use client';

import React, { useState, useEffect } from 'react';
import { usePortalSim } from '../layout';
import { ClientSkeleton } from '@/components/portal/Skeleton';
import { 
  FileText, 
  Download, 
  CreditCard, 
  Building2, 
  FileCode, 
  ShieldCheck, 
  ExternalLink,
  Save,
  CheckCircle,
  AlertCircle,
  Upload,
  RefreshCw
} from 'lucide-react';
import { uploadDocumentAction, getClientDocumentsAction } from '@/app/portal/actions/documentActions';

export default function ClientPage() {
  const { clientProfile, isSimLoading, clientData, updateClientInfo } = usePortalSim();

  // Obtener el cliente simulado actual según el perfil activo
  // Usamos Acme de México (c1) para simulador fiscal y Juan Pérez (c3) para simulador regular
  const simulatedClient = clientData.find(c => c.id === (clientProfile === 'fiscal' ? 'c1' : 'c3')) || clientData[0];

  // Estado del formulario
  const [rfc, setRfc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [cp, setCp] = useState('');
  const [regimenFiscal, setRegimenFiscal] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Estado para simular progreso de descarga
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Estado para el modal de recibo interno
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Estados para documentos reales de Neon DB
  const [realDocuments, setRealDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedCsfFile, setSelectedCsfFile] = useState<File | null>(null);
  const [isUploadingCsf, setIsUploadingCsf] = useState(false);
  const [csfUploadMessage, setCsfUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      } else {
        setCsfUploadMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setCsfUploadMessage({ type: 'error', text: err.message || 'Error al procesar el archivo.' });
    } finally {
      setIsUploadingCsf(false);
    }
  };

  // Sincronizar campos del formulario al cambiar de cliente simulado
  useEffect(() => {
    if (simulatedClient) {
      setRfc(simulatedClient.rfc);
      setRazonSocial(simulatedClient.razonSocial);
      setCp(simulatedClient.cp);
      setRegimenFiscal(simulatedClient.regimenFiscal);
      setFormErrors({});
    }
  }, [simulatedClient]);

  // Manejar descargas simuladas
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
          }, 1000); // Dar 1 segundo de éxito
          return 100;
        }
        return prev + 20; // Progreso rápido
      });
    }, 150);
  };

  // Validaciones del formulario fiscal
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // Validar RFC (Patrón general mexicano simplificado: 12 o 13 caracteres alfanuméricos)
    const rfcRegex = /^[A-Z&Ña-z&ñ]{3,4}\d{6}[A-V1-9a-v1-9][A-Z0-9a-z]\d$/;
    if (!rfc) {
      errors.rfc = 'El RFC es requerido';
    } else if (rfc.length < 12 || rfc.length > 13) {
      errors.rfc = 'El RFC debe tener 12 o 13 caracteres';
    }

    // Validar Razón Social
    if (!razonSocial.trim()) {
      errors.razonSocial = 'La Razón Social es requerida';
    }

    // Validar CP (Exactamente 5 números)
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
    // Guardar cambios en el contexto de simulación global
    updateClientInfo(simulatedClient.id, {
      rfc: rfc.toUpperCase(),
      razonSocial: razonSocial.toUpperCase(),
      cp,
      regimenFiscal
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(val);
  };

  // Mostrar esqueleto en carga
  if (isSimLoading) {
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
              ) : (
                <>
                  {/* Documentos reales de Neon DB */}
                  {realDocuments.map((doc) => (
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
                  ))}

                  {/* Fallback de simulación frontend */}
                  {simulatedClient.contracts.map((c, i) => (
                    <div 
                      key={`mock-${i}`} 
                      className="flex justify-between items-center p-4 border border-white/5 rounded-2xl bg-slate-900/20 hover:bg-slate-900/40 transition-all group"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden mr-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.1)]">
                          <FileText size={20} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate" title={c.name}>
                            {c.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-light">
                            {c.size} • Simulado
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownload(c.name)}
                        disabled={downloadingFile !== null}
                        className="flex items-center justify-center p-2.5 rounded-full bg-white/5 hover:bg-blue-600 border border-white/5 hover:border-blue-400/30 transition-all text-slate-400 hover:text-white cursor-pointer active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        title="Descargar Contrato PDF"
                      >
                        {downloadingFile === c.name ? (
                          <div className="relative w-5 h-5 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-white animate-spin" />
                            <span className="text-[8px] font-bold">{downloadProgress}%</span>
                          </div>
                        ) : (
                          <Download size={14} />
                        )}
                      </button>
                    </div>
                  ))}
                </>
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
              {/* Registro de Pago de Mayo */}
              <div className="py-4 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    Consultoría e Ingeniería de Software - Mayo 2026
                    <span className="px-2 py-0.25 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] rounded-full font-bold">
                      Pagado
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-light flex items-center gap-1.5">
                    <span>Transacción: #KC-026-9812</span>
                    <span>•</span>
                    <span>Pagado el: {simulatedClient.lastPaymentDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <div className="text-right hidden sm:block">
                    {/* Sumarle IVA si es fiscal para mostrar total en cuenta */}
                    <div className="text-xs font-black text-white">
                      {formatCurrency(simulatedClient.subtotal * (clientProfile === 'fiscal' ? 1.16 : 1.0))}
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">
                      {clientProfile === 'fiscal' ? 'Total Neto Facturado' : 'Monto Recibido'}
                    </div>
                  </div>

                  {/* RENDER CONDICIONAL DE BOTONES SEGÚN EL PERFIL (FISCAL VS NO FISCAL) */}
                  {clientProfile === 'fiscal' ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDownload('Factura_XML.xml')}
                        className="py-1.5 px-3 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/20 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-blue-400 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <FileCode size={12} />
                        XML
                      </button>
                      <button
                        onClick={() => handleDownload('Factura_PDF.pdf')}
                        className="py-1.5 px-3 bg-white/5 hover:bg-emerald-600/20 border border-white/5 hover:border-emerald-500/20 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-emerald-400 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Download size={12} />
                        PDF
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsReceiptModalOpen(true)}
                      className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 border border-blue-400/30 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <ShieldCheck size={13} />
                      Ver Recibo Digital
                    </button>
                  )}
                </div>
              </div>

              {/* Registro de Pago de Abril (Histórico) */}
              <div className="py-4 flex justify-between items-center gap-4 last:pb-0">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    Consultoría e Ingeniería de Software - Abril 2026
                    <span className="px-2 py-0.25 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] rounded-full font-bold">
                      Pagado
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-light flex items-center gap-1.5">
                    <span>Transacción: #KC-026-9214</span>
                    <span>•</span>
                    <span>Pagado el: 2026-04-15</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-black text-white">
                      {formatCurrency(simulatedClient.subtotal * (clientProfile === 'fiscal' ? 1.16 : 1.0))}
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">
                      {clientProfile === 'fiscal' ? 'Total Neto Facturado' : 'Monto Recibido'}
                    </div>
                  </div>

                  {clientProfile === 'fiscal' ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDownload('Factura_XML_Abril.xml')}
                        className="py-1.5 px-3 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white border border-white/5 rounded-xl text-[10px] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <FileCode size={12} />
                        XML
                      </button>
                      <button
                        onClick={() => handleDownload('Factura_PDF_Abril.pdf')}
                        className="py-1.5 px-3 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white border border-white/5 rounded-xl text-[10px] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Download size={12} />
                        PDF
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsReceiptModalOpen(true)}
                      className="py-1.5 px-3.5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 border border-white/5 hover:border-white/10 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <ShieldCheck size={13} />
                      Ver Recibo Digital
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Columna Derecha: Formulario Fiscal Autónomo */}
        <div className="space-y-6">
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
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Razón Social o Nombre Completo</label>
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
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">RFC del Contribuyente</label>
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
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Código Postal de Facturación</label>
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
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Régimen Fiscal (SAT)</label>
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
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 border border-blue-400/40 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Save size={14} />
                Guardar Cambios Fiscales
              </button>
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
                <div className="relative border border-dashed border-white/15 hover:border-blue-500/50 rounded-xl p-3.5 bg-slate-950/20 text-center transition-colors">
                  <input
                    id="client-csf-input"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedCsfFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-xs text-slate-400 font-light space-y-1">
                    {selectedCsfFile ? (
                      <p className="font-semibold text-blue-400 truncate px-2">{selectedCsfFile.name}</p>
                    ) : (
                      <>
                        <p className="text-slate-300 font-semibold">Seleccionar CSF PDF</p>
                        <p className="text-[10px] text-slate-500">Arrastra o haz clic aquí</p>
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
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo obscuro */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsReceiptModalOpen(false)}
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
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[9px] rounded-full font-bold">
                PAGADO
              </span>
            </div>

            {/* Detalles del Recibo */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 py-1 border-b border-white/5">
                <div>
                  <span className="text-slate-500 text-[10px]">Folio del Recibo</span>
                  <p className="font-bold font-mono">KC-2026-9812</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px]">Fecha de Pago</span>
                  <p className="font-bold">{simulatedClient.lastPaymentDate}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-500 text-[10px]">Cliente Beneficiario</span>
                <p className="font-bold text-white text-sm">{simulatedClient.name}</p>
              </div>

              <div className="space-y-1.5 border-t border-b border-white/5 py-2">
                <span className="text-slate-500 text-[10px]">Concepto de Pago</span>
                <p className="font-light text-white leading-relaxed">
                  Consultoría de Software, Desarrollo e Integración de Sistemas a la Medida
                </p>
              </div>

              {/* Tabla de Importes (OCULTA IMPUESTOS/SAT TOTALMENTE) */}
              <div className="space-y-1 bg-white/[0.01] p-3 border border-white/5 rounded-2xl">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-light">Monto de Consultoría</span>
                  <span className="font-bold text-white">{formatCurrency(simulatedClient.subtotal)}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5 text-sm">
                  <span className="font-bold text-white">Importe Total Recibido</span>
                  <span className="font-black text-emerald-400">{formatCurrency(simulatedClient.subtotal)}</span>
                </div>
              </div>

              {/* Sello / Validación Digital */}
              <div className="space-y-1">
                <span className="text-slate-500 text-[9px] flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-blue-400" />
                  Sello Digital de Validación Interna
                </span>
                <p className="font-mono text-[9px] text-slate-500 break-all leading-normal bg-slate-950 p-2 rounded-lg border border-white/5">
                  kc_internal_sec_9f7d2a8b3c4e5f6a7b8c9d0e1f2a3b4c5d6e_verify_sha256
                </p>
              </div>
            </div>

            {/* Acción de cierre */}
            <button
              onClick={() => setIsReceiptModalOpen(false)}
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
