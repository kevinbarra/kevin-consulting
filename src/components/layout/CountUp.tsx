'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface Props {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

export default function CountUp({
    value,
    prefix = "",
    suffix = "",
    decimals = 0,
    className = ""
}: Props) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                // Formateo de números (comas y decimales)
                ref.current.textContent = prefix + latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
            }
        });
    }, [springValue, decimals, prefix, suffix]);

    return <span ref={ref} className={className} />;
}