import { Button } from '#/components/ui/button'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/(auth)')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen">
      <div className="absolute top-8 left-8">
        <Button variant={'secondary'} asChild>
          <Link to="/" className="flex items-center text-lg">
            <ArrowLeft />
            Back to home
          </Link>
        </Button>
      </div>

      <div className="min-h-screen flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  )
}
