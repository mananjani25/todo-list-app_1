import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/todos/pages/DashboardPage'

export function AppRouter() {
    const { user, loading } = useAuth()

    if (loading) {
        return null
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        user ? <Navigate to="/dashboard" replace /> : <LoginPage />
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="*"
                    element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
                />
            </Routes>
        </BrowserRouter>
    )
}
