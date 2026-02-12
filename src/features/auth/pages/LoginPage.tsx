import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
            </div>

            <AnimatePresence mode="wait">
                {isLogin ? (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AuthCard
                            title="Welcome Back"
                            subtitle="Sign in to your TaskFlow account"
                        >
                            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
                        </AuthCard>
                    </motion.div>
                ) : (
                    <motion.div
                        key="register"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AuthCard
                            title="Create Account"
                            subtitle="Start managing your tasks with TaskFlow"
                        >
                            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
                        </AuthCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
