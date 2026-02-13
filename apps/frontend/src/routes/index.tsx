import { createFileRoute, Link, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem('auth_token')
    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: App,
})

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Selamat Datang di Antrol Service
        </h1>
        <p className="text-lg text-muted-foreground">Aplikasi Antrean Online</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Masuk ke Dashboard
        </Link>
      </div>
    </div>
  )
}
