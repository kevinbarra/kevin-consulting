'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, FileText, AlertCircle, Calculator, Building, User, Upload, Download, RefreshCw } from 'lucide-react';
import { Client, calculateMexicanTaxes } from './mockData';
import { uploadDocumentAction, getClientDocumentsAction } from '@/app/portal/actions/documentActions';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function Drawer({ isOpen, onClose, client }: DrawerProps) {
  // Estado para controlar qué campos han sido copiados (para el feedback visual)
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Estados para la gestión documental real de Neon DB
  const [realDocuments, setRealDocuments] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [uploadType, setUploadType] = useState<'Contrato' | 'Addendum' | 'CSF'>('Contrato');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar documentos desde Neon DB al abrir el Drawer o cambiar de cliente
  useEffect(() => {
    async function loadDocs() {
      if (isOpen && client) {
        setIsLoadingDocs(true);
        setUploadMessage(null);
        setSelectedFile(null);
        try {
          const docs = await getClientDocumentsAction(client.id);
          setRealDocuments(docs);
        } catch (err) {
          console.error('[DRAWER] Error cargando documentos:', err);
        } finally {
          setIsLoadingDocs(false);
        }
      }
    }
    loadDocs();
  }, [isOpen, client]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !client) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('clientId', client.id);
    formData.append('documentType', uploadType);
    formData.append('file', selectedFile);

    try {
      const res = await uploadDocumentAction(formData);
      if (res.success && res.document) {
        setUploadMessage({ type: 'success', text: 'Documento subido y registrado con éxito.' });
        setSelectedFile(null);
        const fileInput = document.getElementById('drawer-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setRealDocuments((prev) => [res.document, ...prev]);
      } else {
        setUploadMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.message || 'Error al subir el archivo.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Escuchar la tecla de Escape para cerrar el Drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Evitar que el cuerpo principal haga scroll cuando el Drawer esté abierto
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000); // 2 segundos de feedback visual
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(val);
  };

  if (!client) return null;

  // Calcular retenciones si aplica
  const taxes = calculateMexicanTaxes(client.subtotal, client.isPersonaMoral);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* --- CAPA DE FONDO / BACKDROP --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* --- CONTENEDOR DEL DRAWER --- */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:max-w-lg border-l border-white/10 bg-[#090d16]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-white overflow-y-auto"
          >
            {/* Cabecera del Drawer */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 sticky top-0 bg-[#090d16]/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${
                  client.status === 'Pagado' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                  client.status === 'Mensualidad Vencida' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                  client.status === 'Instalación Pendiente' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                  'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                }`} />
                <span className="font-semibold text-slate-200">Ficha Fiscal del Cliente</span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido del Drawer */}
            <div className="p-6 space-y-6">
              {/* Sección Nombre e Info General */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Cliente Comercial</div>
                <h2 className="text-2xl font-black tracking-tight text-white leading-tight">{client.name}</h2>
                <p className="text-slate-400 text-xs font-light">ID de Registro: #{client.id.toUpperCase()}</p>
              </div>

              {/* Status de Cobranza */}
              <div className="p-4 border border-white/10 rounded-2xl bg-white/[0.02] flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium">Estado actual de cobro</span>
                  <div className="text-sm font-bold text-white">{client.status}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  client.status === 'Pagado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  client.status === 'Mensualidad Vencida' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  client.status === 'Instalación Pendiente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                }`}>
                  {client.status === 'Mensualidad Vencida' ? 'Requerir Pago' : client.status}
                </span>
              </div>

              {/* DATOS DEL SAT CON CLICK-TO-COPY */}
              {client.isFiscal ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                    <Building size={16} className="text-blue-400" />
                    <span>Datos de Facturación (SAT)</span>
                  </div>

                  <div className="space-y-3">
                    {/* Razón Social */}
                    <div className="group relative border border-white/10 hover:border-blue-500/50 transition-colors rounded-2xl bg-slate-950/40 p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1 pr-4">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Razón Social</label>
                          <div className="text-sm font-bold text-white break-words">{client.razonSocial}</div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(client.razonSocial, 'razonSocial')}
                          className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 border border-white/5 hover:border-blue-500/20 transition-all text-slate-400 active:scale-90"
                          title="Copiar Razón Social"
                        >
                          {copiedField === 'razonSocial' ? (
                            <Check size={16} className="text-emerald-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                      {copiedField === 'razonSocial' && (
                        <div className="absolute right-14 top-4 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/20 px-2 py-0.5 rounded animate-fade-in">
                          ¡Copiado!
                        </div>
                      )}
                    </div>

                    {/* RFC */}
                    <div className="group relative border border-white/10 hover:border-blue-500/50 transition-colors rounded-2xl bg-slate-950/40 p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1 pr-4">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">RFC del Contribuyente</label>
                          <div className="text-sm font-bold text-white tracking-widest">{client.rfc}</div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(client.rfc, 'rfc')}
                          className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 border border-white/5 hover:border-blue-500/20 transition-all text-slate-400 active:scale-90"
                          title="Copiar RFC"
                        >
                          {copiedField === 'rfc' ? (
                            <Check size={16} className="text-emerald-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                      {copiedField === 'rfc' && (
                        <div className="absolute right-14 top-4 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/20 px-2 py-0.5 rounded">
                          ¡Copiado!
                        </div>
                      )}
                    </div>

                    {/* CP y Régimen */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Código Postal */}
                      <div className="group relative border border-white/10 hover:border-blue-500/50 transition-colors rounded-2xl bg-slate-950/40 p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1 pr-2">
                            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Domicilio Fiscal (C.P.)</label>
                            <div className="text-sm font-bold text-white">{client.cp}</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(client.cp, 'cp')}
                            className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 border border-white/5 hover:border-blue-500/20 transition-all text-slate-400 active:scale-90"
                          >
                            {copiedField === 'cp' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                        {copiedField === 'cp' && (
                          <div className="absolute right-12 top-4 text-[9px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            ¡Copiado!
                          </div>
                        )}
                      </div>

                      {/* Régimen Fiscal */}
                      <div className="group relative border border-white/10 hover:border-blue-500/50 transition-colors rounded-2xl bg-slate-950/40 p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1 pr-2 overflow-hidden">
                            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Régimen Fiscal</label>
                            <div className="text-xs font-bold text-white truncate" title={client.regimenFiscal}>
                              {client.regimenFiscal.split(' - ')[0]}
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(client.regimenFiscal, 'regimenFiscal')}
                            className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 border border-white/5 hover:border-blue-500/20 transition-all text-slate-400 active:scale-90"
                          >
                            {copiedField === 'regimenFiscal' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                        {copiedField === 'regimenFiscal' && (
                          <div className="absolute right-12 top-4 text-[9px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            ¡Copiado!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-blue-500/20 rounded-2xl bg-blue-500/5 flex gap-3 text-xs">
                  <User className="text-blue-400 shrink-0" size={18} />
                  <div className="space-y-1 text-slate-300">
                    <div className="font-bold text-white">Perfil No Fiscal (Público General)</div>
                    <p className="font-light">Este cliente opera sin perfil de impuestos del SAT. Se emiten recibos digitales de control interno.</p>
                  </div>
                </div>
              )}

              {/* DESGLOSE CONTABLE Y DE RETENCIONES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                  <Calculator size={16} className="text-blue-400" />
                  <span>Desglose Contable y de Retenciones (México)</span>
                </div>

                <div className="border border-white/10 rounded-2xl bg-slate-950/60 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                        <th className="text-left p-3 font-semibold">Concepto</th>
                        <th className="text-right p-3 font-semibold">Monto / Tasa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      <tr>
                        <td className="p-3 font-light">Subtotal (Servicios de TI/Consultoría)</td>
                        <td className="p-3 text-right font-bold text-white">{formatCurrency(taxes.subtotal)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-light">IVA Trasladado (16%)</td>
                        <td className="p-3 text-right font-bold text-white">{formatCurrency(taxes.iva)}</td>
                      </tr>

                      {/* Mostrar retenciones en pantalla si aplica (Persona Moral Fiscal) */}
                      {client.isFiscal && client.isPersonaMoral ? (
                        <>
                          <tr className="bg-rose-950/20 text-rose-300">
                            <td className="p-3 font-light flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Retención ISR (1.25% RESICO)
                            </td>
                            <td className="p-3 text-right font-bold">-{formatCurrency(taxes.retISR)}</td>
                          </tr>
                          <tr className="bg-rose-950/20 text-rose-300">
                            <td className="p-3 font-light flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Retención IVA (10.667% - 2/3)
                            </td>
                            <td className="p-3 text-right font-bold">-{formatCurrency(taxes.retIVA)}</td>
                          </tr>
                        </>
                      ) : (
                        <tr className="bg-slate-900/50 text-slate-500">
                          <td className="p-3 font-light italic">Sin Retenciones (Física/No-Fiscal)</td>
                          <td className="p-3 text-right">-</td>
                        </tr>
                      )}

                      <tr className="border-t border-white/15 bg-white/[0.04] text-white">
                        <td className="p-3 font-bold text-sm">Total Neto a Depositar</td>
                        <td className="p-3 text-right font-black text-sm text-emerald-400">
                          {formatCurrency(taxes.totalNeto)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Acciones de copiado rápido contable */}
                  <div className="p-3 bg-white/[0.02] border-t border-white/10 flex justify-between gap-2">
                    <button
                      onClick={() => copyToClipboard(taxes.subtotal.toFixed(2), 'subtotalVal')}
                      className="flex-1 py-2 px-3 border border-white/5 hover:border-blue-500/25 bg-slate-900/40 hover:bg-blue-600/10 rounded-xl transition-all text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {copiedField === 'subtotalVal' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      Copiar Subtotal
                    </button>
                    <button
                      onClick={() => copyToClipboard(taxes.totalNeto.toFixed(2), 'totalNetoVal')}
                      className="flex-1 py-2 px-3 border border-emerald-500/10 hover:border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-600/10 rounded-xl transition-all text-[11px] font-semibold text-emerald-400 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {copiedField === 'totalNetoVal' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      Copiar Neto
                    </button>
                  </div>
                </div>

                {client.isFiscal && client.isPersonaMoral && (
                  <div className="flex gap-2 p-3 border border-amber-500/10 bg-amber-500/5 rounded-2xl text-[10px] text-amber-400 font-light">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p>
                      El desglose calcula la retención de IVA del 10.667% (2/3 partes del impuesto trasladado) y la retención del 1.25% de ISR para personas morales que tributan bajo esquemas de servicios profesionales o RESICO.
                    </p>
                  </div>
                )}
              </div>

              {/* Sección Contratos Vinculados */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                  <FileText size={16} className="text-blue-400" />
                  <span>Expediente de Contratos y Documentos</span>
                </div>
                <div className="space-y-2">
                  {isLoadingDocs ? (
                    <div className="text-center text-xs text-slate-500 py-4 flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-blue-500" size={14} />
                      Cargando expediente contable...
                    </div>
                  ) : realDocuments.length === 0 && client.contracts.length === 0 ? (
                    <div className="text-center text-xs text-slate-500 italic py-4 border border-dashed border-white/5 rounded-2xl">
                      No hay archivos registrados.
                    </div>
                  ) : (
                    <>
                      {/* Documentos reales de Neon DB */}
                      {realDocuments.map((doc) => (
                        <a
                          key={`real-${doc.id}`}
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex justify-between items-center p-3 border border-blue-500/10 hover:border-blue-500/30 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-all group cursor-pointer"
                        >
                          <div className="space-y-0.5 flex-1 min-w-0 pr-4">
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                              {doc.file_name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-light">
                              {doc.document_type} • Cargado el {new Date(doc.uploaded_at).toLocaleDateString('es-MX')}
                            </div>
                          </div>
                          <Download size={14} className="text-slate-400 group-hover:text-blue-400 transition-colors shrink-0" />
                        </a>
                      ))}

                      {/* Fallback de simulación frontend */}
                      {client.contracts.map((c, i) => (
                        <div key={`mock-${i}`} className="flex justify-between items-center p-3 border border-white/5 rounded-xl bg-white/[0.01]">
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-white truncate max-w-[250px]" title={c.name}>
                              {c.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-light">
                              {c.size} • Simulado
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                            Mock PDF
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Formulario de Carga de Documentos */}
              <div className="space-y-3 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                  <Upload size={16} className="text-blue-400" />
                  <span>Cargar Nuevo Expediente</span>
                </div>

                <form onSubmit={handleUpload} className="space-y-4 p-4 border border-white/5 rounded-2xl bg-white/[0.01]">
                  {/* Tipo de Documento */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Tipo de Archivo</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as any)}
                      className="w-full text-xs font-semibold bg-slate-900 border border-white/10 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="Contrato">Contrato de Servicios (PDF)</option>
                      <option value="Addendum">Addendum de Proyecto (PDF)</option>
                      <option value="CSF">CSF - Constancia de Situación Fiscal (PDF)</option>
                    </select>
                  </div>

                  {/* Seleccionar Archivo */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Archivo PDF</label>
                    <div className="relative border border-dashed border-white/15 hover:border-blue-500/50 rounded-xl p-4 bg-slate-950/20 text-center transition-colors">
                      <input
                        id="drawer-file-input"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-xs text-slate-400 font-light space-y-1">
                        {selectedFile ? (
                          <p className="font-semibold text-blue-400">{selectedFile.name}</p>
                        ) : (
                          <>
                            <p className="text-slate-300 font-semibold">Seleccionar archivo PDF</p>
                            <p className="text-[10px] text-slate-500">Haz clic o arrastra el archivo aquí</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón de Enviar */}
                  <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 disabled:text-slate-500 disabled:border-white/5 border border-blue-500/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        Cargando archivo...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Subir y Registrar en Neon
                      </>
                    )}
                  </button>

                  {/* Mensajes de Estado */}
                  {uploadMessage && (
                    <div className={`p-3 rounded-xl border text-[10px] flex gap-2 font-medium ${
                      uploadMessage.type === 'success'
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                    }`}>
                      <AlertCircle size={14} className="shrink-0" />
                      <p>{uploadMessage.text}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
