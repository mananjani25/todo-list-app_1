import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AppRouter } from '@/routes/index'
import './index.css'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(18, 18, 26, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#e8e8ed',
                fontSize: '13px',
              },
            }}
            richColors
          />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
