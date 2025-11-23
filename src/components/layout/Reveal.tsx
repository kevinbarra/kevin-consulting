'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Props {
    children: React.ReactNode;
    delay?: number;
    width?: 'fit-content' | '100%';
}

export default function Reveal({ children, delay = 0, width = 'fit-content' }: Props) {
    const ref = useRef(null);
    // Ajustamos el margen para que se active un poco antes y sea más seguro
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        // Quitamos overflow:hidden que a veces causa problemas en móvil
        <div ref={ref} style={{ position: 'relative', width }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
}