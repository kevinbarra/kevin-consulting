'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, CheckCircle, Database, Server, Cpu, Activity, RefreshCw } from 'lucide-react';

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
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-3 sm:p-4 text-[10px] sm:text-xs font-mono w-full max-w-full sm:max-w-sm shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-2.5 border-b border-white/10 pb-2">
        <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase flex items-center gap-1">
          <Database size={9} className="animate-pulse text-blue-400" />
          MONITOR_STOCK
        </span>
        <button onClick={resetAll} className="text-slate-550 hover:text-white transition-colors cursor-pointer" title="Restablecer">
          <RotateCcw size={10} />
        </button>
      </div>

      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-black/20 p-1.5 sm:p-2 rounded border border-white/5 gap-1.5 sm:gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-200 text-[10px] sm:text-xs truncate">{item.name}</div>
              <div className="text-[8px] sm:text-[9px] text-slate-500">Mín: {item.min} u</div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div className="text-right text-[10px] sm:text-xs">
                <span className={`font-bold ${item.status === 'Crítico' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {item.stock} u
                </span>
                <span className="block text-[7px] sm:text-[8px] text-slate-500 leading-none">{item.status}</span>
              </div>

              {item.status === 'Crítico' ? (
                <button
                  onClick={() => handleRestock(item.id)}
                  className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[8px] sm:text-[9px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-0.5 sm:gap-1 shadow-md shadow-blue-500/20"
                >
                  <RefreshCw size={8} className="animate-spin-slow shrink-0" /> Surtir
                </button>
              ) : (
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                  <CheckCircle size={10} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2.5 text-[8px] text-slate-500 text-center italic">
        Haz clic en "Surtir" para ver la simulación.
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
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-3 sm:p-4 text-[10px] sm:text-xs font-mono w-full max-w-full sm:max-w-sm shadow-2xl">
      <div className="flex justify-between items-center mb-2.5 border-b border-white/10 pb-2">
        <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase flex items-center gap-1">
          <Activity size={9} className="text-orange-400 animate-pulse" />
          MONITOR_FILAS
        </span>
        <span className="text-[8px] sm:text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-bold">
          Atendidos: {servedCount}
        </span>
      </div>

      <div className="space-y-1 min-h-[105px]">
        <AnimatePresence mode="popLayout">
          {queue.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[105px] flex flex-col items-center justify-center text-slate-500"
            >
              <CheckCircle size={20} className="text-emerald-400 mb-1.5 animate-bounce" />
              <span className="text-[10px]">Fila vacía</span>
              <span className="text-[8px] mt-0.5 text-slate-655">Todos los clientes atendidos.</span>
            </motion.div>
          ) : (
            queue.map((q, idx) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-between p-1.5 rounded border ${idx === 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-black/20 border-white/5 text-slate-500'}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold flex items-center gap-1 text-[10px] sm:text-xs">
                    <span className="text-[8px] px-1 bg-white/10 rounded">#{q.id}</span>
                    <span className="text-slate-200 truncate">{q.name}</span>
                  </div>
                  <div className="text-[7px] sm:text-[8px] text-slate-500 leading-none mt-0.5">{q.service}</div>
                </div>
                <div className="text-right flex items-center gap-1.5 shrink-0 text-[8px] sm:text-[9px]">
                  <span className="text-slate-550">{q.time} espera</span>
                  {idx === 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex gap-1.5">
        <button
          onClick={handleNext}
          disabled={queue.length === 0}
          className="flex-1 py-1 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded text-[8px] sm:text-[9px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-0.5 shadow-md shadow-orange-500/20"
        >
          <Play size={8} /> Siguiente
        </button>
        <button
          onClick={handleAdd}
          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[8px] sm:text-[9px] font-bold transition-all active:scale-95 cursor-pointer"
        >
          + Fila
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
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-3 sm:p-4 text-[10px] sm:text-xs font-mono w-full max-w-full sm:max-w-sm shadow-2xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2.5 border-b border-white/10 pb-2">
          <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <Cpu size={9} className="text-emerald-400 animate-pulse" />
            RENDIMIENTO_VELOCIDAD
          </span>
        </div>

        {/* Speed Dial Visualizer */}
        <div className="flex items-center gap-2 sm:gap-4 bg-black/30 p-2 sm:p-3 rounded-lg border border-white/5 mb-3">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full border-2 border-white/5 shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke={speedVal >= 90 ? "#10b981" : speedVal >= 80 ? "#f59e0b" : "#ef4444"}
                strokeWidth="3"
                fill="transparent"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * speedVal) / 100}
                className="transition-all duration-500"
              />
            </svg>
            <div className="text-center">
              <div className="text-xs sm:text-sm font-extrabold text-white">{speedVal}</div>
              <div className="text-[5px] sm:text-[6px] text-slate-550 uppercase">Score</div>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-0.5 text-[8px] sm:text-[9px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Carga Inicial</span>
              <span className={`font-bold ${speedVal >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {((100 - speedVal) * 0.04).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estabilidad</span>
              <span className="font-bold text-emerald-400">0.02</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Interactivo</span>
              <span className={`font-bold ${speedVal >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {((100 - speedVal) * 0.05).toFixed(2)}s
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center justify-between p-1.5 bg-black/20 rounded border border-white/5 cursor-pointer hover:bg-black/30 transition-colors text-[8px] sm:text-[9px]">
          <span className="text-slate-300">Activar CDN & Edge Caching</span>
          <input
            type="checkbox"
            checked={cacheEnabled}
            onChange={() => setCacheEnabled(prev => !prev)}
            className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0 h-3 w-3 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-1.5 bg-black/20 rounded border border-white/5 cursor-pointer hover:bg-black/30 transition-colors text-[8px] sm:text-[9px]">
          <span className="text-slate-300">Activar SSR (Servidor Veloz)</span>
          <input
            type="checkbox"
            checked={ssrEnabled}
            onChange={() => setSsrEnabled(prev => !prev)}
            className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0 h-3 w-3 cursor-pointer"
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
      "git_webhook: push trigger on branch 'main'",
      "docker_build: building container image v2...",
      "health_check: testing cluster status... ok",
      "deploy_success: v2.0 online. Zero downtime. 🎉"
    ];

    let currentStep = 0;
    setLogs(["deploy_trigger: starting deployment flow..."]);

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLogs(prev => [...prev.slice(-2), steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
        setClusterState("online");
      }
    }, 900);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-3 sm:p-4 text-[10px] sm:text-xs font-mono w-full max-w-full sm:max-w-sm shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[160px]">
      <div>
        <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
          <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <Server size={9} className="text-purple-400 animate-pulse" />
            CONSOLA_NUBE
          </span>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${clusterState === 'deploying' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span className="text-[7px] sm:text-[8px] text-slate-450 uppercase">{clusterState === 'deploying' ? 'Cargando' : 'Nube OK'}</span>
          </div>
        </div>

        {/* Console logs */}
        <div className="bg-black/50 p-2 rounded border border-white/5 font-mono text-[8px] sm:text-[9px] text-purple-300 leading-relaxed min-h-[64px] flex flex-col justify-end">
          {logs.map((log, i) => (
            <div key={i} className="truncate">
              <span className="text-slate-600 mr-1">$</span>
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5">
        <button
          onClick={triggerDeploy}
          disabled={isDeploying}
          className="w-full py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-650 text-white rounded text-[8px] sm:text-[9px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-purple-500/20"
        >
          {isDeploying ? (
            <>
              <RefreshCw size={8} className="animate-spin shrink-0" /> Procesando...
            </>
          ) : (
            <>
              <Play size={8} /> Despliegue en 1-Clic
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// --- 5. MOCKUP DE CONSOLA DE CÓDIGO INTERACTIVA ---
export function CodeConsoleMockup() {
  const [activeTab, setActiveTab] = useState<'infra.tf' | 'predict.py' | 'api.ts'>('infra.tf');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const files = {
    'infra.tf': `resource "aws_ecs_service" "app" {
  name            = "consulting"
  cluster         = aws_ecs_cluster.main.id
  desired_count   = 3
  launch_type     = "FARGATE"
}`,
    'predict.py': `def calculate_reorder_point(lead, sales_mean, sales_std):
    z_score = stats.norm.ppf(0.95)
    safety = z_score * math.sqrt(lead) * sales_std
    return (lead * sales_mean) + safety`,
    'api.ts': `export async function POST(req: Request) {
  const payload = await req.json();
  if (!verifySignature(payload, req.headers.get("sig"))) {
    return NextResponse.json({ status: 401 });
  }
  return NextResponse.json({ status: "synced" });
}`
  };

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleOutput(["compilando...", "validando infra..."]);
    setTimeout(() => {
      if (activeTab === 'infra.tf') {
        setConsoleOutput(prev => [...prev, "AWS service validated! ✅"]);
      } else if (activeTab === 'predict.py') {
        setConsoleOutput(prev => [...prev, "reorder_point: 54 u (98% acc) ✅"]);
      } else {
        setConsoleOutput(prev => [...prev, "HTTP POST 200 OK (11ms) ✅"]);
      }
      setIsRunning(false);
    }, 1200);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-3 sm:p-4 text-[10px] sm:text-xs font-mono w-full max-w-full sm:max-w-sm shadow-2xl flex flex-col justify-between min-h-[190px]">
      <div>
        <div className="flex border-b border-white/10 pb-1.5 mb-2 gap-1 overflow-x-auto">
          {(['infra.tf', 'predict.py', 'api.ts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setConsoleOutput([]);
              }}
              className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold transition-all cursor-pointer ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <pre className="bg-black/40 p-2 rounded border border-white/5 text-[8px] sm:text-[9px] text-slate-350 overflow-x-auto leading-normal max-h-[85px] select-all">
          <code>{files[activeTab]}</code>
        </pre>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="w-full py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-650 text-white rounded text-[8px] sm:text-[9px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-blue-500/20"
        >
          {isRunning ? <RefreshCw size={8} className="animate-spin" /> : <Play size={8} />}
          Ejecutar Código
        </button>

        {consoleOutput.length > 0 && (
          <div className="bg-black/60 p-1.5 rounded border border-white/5 text-[7px] sm:text-[8px] text-emerald-400 max-h-[45px] overflow-y-auto">
            {consoleOutput.map((out, i) => <div key={i}>&gt; {out}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
