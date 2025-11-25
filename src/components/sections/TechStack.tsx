'use client';

import { Code2, Database, Cloud, Lock, Smartphone, Cpu, Globe, Zap } from 'lucide-react';

const technologies = [
    { name: "Next.js Enterprise", icon: <Globe size={24} /> },
    { name: "Cloud Infrastructure", icon: <Cloud size={24} /> },
    { name: "AI Integration", icon: <Cpu size={24} /> },
    { name: "Bank-Grade Security", icon: <Lock size={24} /> },
    { name: "Mobile Native", icon: <Smartphone size={24} /> },
    { name: "High Performance", icon: <Zap size={24} /> },
    { name: "Database Systems", icon: <Database size={24} /> },
    { name: "Custom Engineering", icon: <Code2 size={24} /> },
];

export default function TechStack() {
    return (
        <section className="py-10 border-y border-white/5 bg-[#0b1121]/50 overflow-hidden relative">

            {/* Máscaras de desvanecimiento a los lados (Efecto Premium) */}
            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-[#0f172a] to-transparent z-10" />
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#0f172a] to-transparent z-10" />

            <div className="flex w-max">
                {/* Tira 1 */}
                <div className="flex animate-marquee">
                    {technologies.map((tech, index) => (
                        <div key={`t1-${index}`} className="flex items-center gap-3 mx-8 text-slate-500 hover:text-blue-400 transition-colors cursor-default">
                            {tech.icon}
                            <span className="text-sm font-bold uppercase tracking-wider">{tech.name}</span>
                        </div>
                    ))}
                </div>
                {/* Tira 2 (Duplicada para el efecto infinito) */}
                <div className="flex animate-marquee" aria-hidden="true">
                    {technologies.map((tech, index) => (
                        <div key={`t2-${index}`} className="flex items-center gap-3 mx-8 text-slate-500 hover:text-blue-400 transition-colors cursor-default">
                            {tech.icon}
                            <span className="text-sm font-bold uppercase tracking-wider">{tech.name}</span>
                        </div>
                    ))}
                </div>
                {/* Tira 3 (Seguro extra para pantallas anchas) */}
                <div className="flex animate-marquee" aria-hidden="true">
                    {technologies.map((tech, index) => (
                        <div key={`t3-${index}`} className="flex items-center gap-3 mx-8 text-slate-500 hover:text-blue-400 transition-colors cursor-default">
                            {tech.icon}
                            <span className="text-sm font-bold uppercase tracking-wider">{tech.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}