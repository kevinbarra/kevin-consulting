'use client';

import { useRef, useState } from 'react';

interface Props {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}

export default function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(59, 130, 246, 0.25)" // Azul por defecto
}: Props) {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setOpacity(1);
    };

    const handleBlur = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleFocus}
            onMouseLeave={handleBlur}
            // Agregamos 'active:scale-[0.98]' para que en móvil se sienta táctil al tocar
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#1e293b]/50 transition-transform active:scale-[0.98] duration-200 ${className}`}
        >
            {/* --- CAPA 1: LUZ AMBIENTAL (SOLO MÓVIL) --- */}
            {/* Esta capa es visible siempre en móvil (block) y se oculta en desktop (md:hidden).
          Crea un brillo fijo en la parte superior para que la tarjeta no se vea plana. */}
            <div
                className="pointer-events-none absolute inset-0 md:hidden"
                style={{
                    background: `radial-gradient(circle at 50% -20%, ${spotlightColor}, transparent 70%)`,
                    opacity: 0.6 // Brillo sutil permanente
                }}
            />

            {/* --- CAPA 2: SPOTLIGHT INTERACTIVO (SOLO DESKTOP) --- */}
            {/* Esta capa sigue al mouse. En móvil no hace falta porque tenemos la Capa 1. */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 hidden md:block"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
            />

            {/* Contenido Real */}
            <div className="relative h-full z-10">{children}</div>
        </div>
    );
}