'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, AlertTriangle, CheckCircle, Database, Server, Cpu, Activity, RefreshCw } from 'lucide-react';

// --- 1. MOCKUP DE INVENTARIO INTELIGENTE ---
export function InventoryMockup() {
  const [items, setItems] = useState([
    { id: 1, name: "Harina Integral", stock: 12, min: 50, status: "Crítico" },
    { id: 2, name: "Materia Prima B", stock: 110, min: 80, status: "Óptimo" },
    { id: 3, name: "Cajas de Envío", stock: 5, min: 30, status: "Crítico" }
  ]);

  const handleRestock = (id: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, stock: item.min + 20, status: "Óptimo" };
      }
      return item;
    }));
  };

  const resetAll = () => {
    setItems([
      { id: 1, name: "Harina Integral", stock: 12, min: 50, status: "Crítico" },
      { id: 2, name: "Materia Prima B", stock: 110, min: 80, status: "Óptimo" },
      { id: 3, name: "Cajas de Envío", stock: 5, min: 30, status: "Crítico" }
    ]);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-4 text-xs font-mono w-full max-w-sm shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
        <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
          <Database size={10} className="animate-pulse text-blue-400" />
          ERP_STOCK_MANAGER
        </span>
        <button onClick={resetAll} className="text-slate-500 hover:text-white transition-colors" title="Restablecer">
          <RotateCcw size={10} />
        </button>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/5">
            <div className="flex-1">
              <div className="font-bold text-slate-200">{item.name}</div>
              <div className="text-[9px] text-slate-500">Mínimo requerido: {item.min} unidades</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className={`font-bold ${item.status === 'Crítico' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {item.stock} u
                </span>
                <span className="block text-[8px] text-slate-500">{item.status}</span>
              </div>

              {item.status === 'Crítico' ? (
                <button
                  onClick={() => handleRestock(item.id)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[9px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-md shadow-blue-500/20"
                >
                  <RefreshCw size={8} className="animate-spin-slow" /> Reabastecer
                </button>
              ) : (
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                  <CheckCircle size={12} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[9px] text-slate-500 text-center italic">
        Haz clic en "Reabastecer" para ver la automatización de órdenes.
      </div>
    </div>
  );
}

// --- 2. MOCKUP DE FLUJO DE ATENCIÓN E INTELIGENCIA ---
export function QueueMockup() {
  const [queue, setQueue] = useState([
    { id: 104, name: "Carlos Mendoza", time: "12m", service: "Trámite General" },
    { id: 105, name: "María Elena", time: "8m", service: "Soporte Cuentas" },
    { id: 106, name: "Roberto Cruz", time: "3m", service: "Entrega Producto" }
  ]);
  const [servedCount, setServedCount] = useState(24);

  const handleNext = () => {
    if (queue.length === 0) return;
    setQueue(prev => prev.slice(1));
    setServedCount(prev => prev + 1);
  };

  const handleAdd = () => {
    const nextId = queue.length > 0 ? queue[queue.length - 1].id + 1 : 101;
    const names = ["Sofía G.", "Ignacio L.", "Laura V.", "Diego M."];
    const services = ["Asesoría", "Soporte Cuentas", "Entrega Producto"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomService = services[Math.floor(Math.random() * services.length)];
    setQueue(prev => [...prev, { id: nextId, name: randomName, time: "0m", service: randomService }]);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-4 text-xs font-mono w-full max-w-sm shadow-2xl">
      <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
        <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
          <Activity size={10} className="text-orange-400 animate-pulse" />
          QUEUE_FLOW_MANAGER
        </span>
        <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded font-bold">
          Atendidos hoy: {servedCount}
        </span>
      </div>

      <div className="space-y-1.5 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {queue.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[120px] flex flex-col items-center justify-center text-slate-500"
            >
              <CheckCircle size={24} className="text-emerald-400 mb-2 animate-bounce" />
              <span>Fila vacía</span>
              <span className="text-[9px] mt-1 text-slate-600">Todos los clientes atendidos.</span>
            </motion.div>
          ) : (
            queue.map((q, idx) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-between p-2 rounded border ${idx === 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-black/20 border-white/5 text-slate-400'}`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <span className="text-[9px] px-1 bg-white/10 rounded">#{q.id}</span>
                    <span className="text-slate-200">{q.name}</span>
                  </div>
                  <div className="text-[8px] text-slate-500">{q.service}</div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-[9px] text-slate-500">{q.time} de espera</span>
                  {idx === 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleNext}
          disabled={queue.length === 0}
          className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded text-[10px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-orange-500/20"
        >
          <Play size={10} /> Despachar Siguiente
        </button>
        <button
          onClick={handleAdd}
          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
        >
          + Cliente
        </button>
      </div>
    </div>
  );
}

// --- 3. MOCKUP DE RENDIMIENTO Y CONVERSIÓN ---
export function PerformanceMockup() {
  const [speedVal, setSpeedVal] = useState(72);
  const [cacheEnabled, setCacheEnabled] = useState(false);
  const [ssrEnabled, setSsrEnabled] = useState(false);

  useEffect(() => {
    let base = 72;
    if (cacheEnabled) base += 16;
    if (ssrEnabled) base += 11;
    setSpeedVal(base);
  }, [cacheEnabled, ssrEnabled]);

  return (
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-4 text-xs font-mono w-full max-w-sm shadow-2xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
          <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <Cpu size={10} className="text-emerald-400 animate-pulse" />
            CORE_WEB_VITALS_BENCHMARK
          </span>
        </div>

        {/* Speed Dial Visualizer */}
        <div className="flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-white/5 mb-4">
          <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-white/5">
            {/* Circle color dynamically maps based on score */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke={speedVal >= 90 ? "#10b981" : speedVal >= 80 ? "#f59e0b" : "#ef4444"}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="163.3"
                strokeDashoffset={163.3 - (163.3 * speedVal) / 100}
                className="transition-all duration-500"
              />
            </svg>
            <div className="text-center">
              <div className="text-sm font-extrabold text-white">{speedVal}</div>
              <div className="text-[6px] text-slate-500 uppercase">Score</div>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">Largest Contentful Paint</span>
              <span className={`font-bold ${speedVal >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {((100 - speedVal) * 0.04).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">Cumulative Layout Shift</span>
              <span className="font-bold text-emerald-400">0.02</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400">Interactive Time</span>
              <span className={`font-bold ${speedVal >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {((100 - speedVal) * 0.05).toFixed(2)}s
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5 cursor-pointer hover:bg-black/30 transition-colors">
          <span className="text-[10px] text-slate-300">Activar CDN & Edge Caching</span>
          <input
            type="checkbox"
            checked={cacheEnabled}
            onChange={() => setCacheEnabled(prev => !prev)}
            className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
          />
        </label>

        <label className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5 cursor-pointer hover:bg-black/30 transition-colors">
          <span className="text-[10px] text-slate-300">Habilitar Server-Side Rendering (SSR)</span>
          <input
            type="checkbox"
            checked={ssrEnabled}
            onChange={() => setSsrEnabled(prev => !prev)}
            className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
          />
        </label>
      </div>
    </div>
  );
}

// --- 4. MOCKUP DE INFRAESTRUCTURA CLOUD Y DEVOPS AUTÓNOMO ---
export function CloudMockup() {
  const [logs, setLogs] = useState<string[]>([
    "sys_init: Cloud cluster listening on port :443",
    "cluster_status: 3 pods active [healthy]"
  ]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [clusterState, setClusterState] = useState<"idle" | "deploying" | "online">("idle");

  const triggerDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setClusterState("deploying");

    const steps = [
      "git_webhook: Incoming push trigger on branch 'main'",
      "docker_build: Building container image (v2.4.1)...",
      "k8s_deploy: Rolling update started. Spawning new pods...",
      "health_check: Performing HTTP check on target group... ok",
      "traffic_swap: Directing 100% traffic to new cluster",
      "deploy_success: v2.4.1 online. Zero downtime. 🎉"
    ];

    let currentStep = 0;
    setLogs(["deploy_trigger: Initializing automated deployment..."]);

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLogs(prev => [...prev.slice(-3), steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
        setClusterState("online");
      }
    }, 900);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-4 text-xs font-mono w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[180px]">
      <div>
        <div className="flex justify-between items-center mb-2.5 border-b border-white/10 pb-2">
          <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <Server size={10} className="text-purple-400 animate-pulse" />
            AUTONOMOUS_INFRA_STREAM
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${clusterState === 'deploying' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span className="text-[8px] text-slate-400 uppercase">{clusterState === 'deploying' ? 'Deploying' : 'Cluster OK'}</span>
          </div>
        </div>

        {/* Console logs */}
        <div className="bg-black/50 p-2.5 rounded border border-white/5 font-mono text-[9px] text-purple-300 leading-normal min-h-[76px] flex flex-col justify-end">
          {logs.map((log, i) => (
            <div key={i} className="truncate">
              <span className="text-slate-600 mr-1">$</span>
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={triggerDeploy}
          disabled={isDeploying}
          className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded text-[10px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20"
        >
          {isDeploying ? (
            <>
              <RefreshCw size={10} className="animate-spin" /> Compilando...
            </>
          ) : (
            <>
              <Play size={10} /> Simular Despliegue CI/CD
            </>
          )}
        </button>
      </div>
    </div>
  );
}
