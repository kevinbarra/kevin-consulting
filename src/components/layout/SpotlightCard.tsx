'use client';

import { useRef, useState } from 'react';

interface Props {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
    isHighlighted?: boolean;
}

export default function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(59, 130, 246, 0.25)", // Azul por defecto
    isHighlighted = false
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
            // Agregamos 'active:scale-[0.98]' para que en móvil se sientan táctiles
            className={`relative overflow-hidden rounded-3xl border transition-all duration-300 active:scale-[0.98] ${
                isHighlighted 
                  ? 'border-white/20 bg-[#1e293b]/75 shadow-[0_0_25px_rgba(59,130,246,0.06)] scale-[1.03]' 
                  : 'border-white/10 bg-[#1e293b]/50'
            } ${className}`}
        >
            {/* --- CAPA 1: LUZ AMBIENTAL (SOLO MÓVIL) --- */}
            {/* Esta capa es visible siempre en móvil (block) y se oculta en desktop (md:hidden). */}
            <div
                className="pointer-events-none absolute inset-0 md:hidden transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at 50% -20%, ${spotlightColor}, transparent 70%)`,
                    opacity: isHighlighted ? 0.95 : 0.6 // Brillo más fuerte si está activo
                }}
            />

            {/* --- CAPA 2: SPOTLIGHT INTERACTIVO (SOLO DESKTOP) --- */}
            {/* Esta capa sigue al mouse o se centra si está destacado. */}
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300 hidden md:block"
                style={{
                    opacity: isHighlighted ? 0.45 : opacity,
                    background: isHighlighted
                        ? `radial-gradient(350px circle at center, ${spotlightColor}, transparent 65%)`
                        : `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
            />

            {/* Contenido Real */}
            <div className="relative h-full z-10">{children}</div>
        </div>
    );
}