import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AuthCardProps {
    children: ReactNode
    title: string
    subtitle: string
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
        >
            <div className="glass-strong rounded-2xl p-8 glow">
                <div className="mb-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold gradient-text">{title}</h1>
                        <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>
                    </motion.div>
                </div>
                {children}
            </div>
        </motion.div>
    )
}
