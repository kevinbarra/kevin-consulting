'use client';

import { motion } from 'framer-motion';

interface Props {
    children: React.ReactNode;
    delay?: number;
    width?: 'fit-content' | '100%';
}

export default function Reveal({ children, delay = 0, width = 'fit-content' }: Props) {
    return (
        <div style={{ position: 'relative', width, overflow: 'hidden' }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 50 }, // Bajamos un poco el desplazamiento (de 75 a 50) para que sea más sutil
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                whileInView="visible" // Esto hace que se anime cada vez que entra en vista
                viewport={{
                    once: false, // <--- CLAVE: Permitimos que se repita
                    margin: "-100px", // Tiene que entrar 100px en la pantalla para activarse (evita disparos accidentales)
                    amount: 0.3 // El 30% del elemento debe ser visible para activarse
                }}
                transition={{ duration: 0.6, delay: delay, ease: "easeOut" }} // Un poco más rápido (0.6s) para sentirse ágil
            >
                {children}
            </motion.div>
        </div>
    );
}