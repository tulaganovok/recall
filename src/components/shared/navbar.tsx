import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { ThemeToggle } from './theme-toggle'
import { authClient } from '#/lib/auth-client'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()

  const onSignOut = async () => {
    setIsSigningOut(true)

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success('Signed out successfully')
            navigate({ to: '/sign-in' })
          },
          onError: ({ error }) => {
            toast.error(error.message)
          },
        },
      })
    } catch {
      toast.error('Failed to sign out')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img
            src="https://tanstack.com/images/logos/logo-color-banner-600.png"
            alt="TanStack Start Logo"
            className="size-8"
          />

          <h1 className="text-lg font-semibold">TanStack Start</h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isPending ? null : session?.user ? (
            <>
              <Button
                variant={'outline'}
                disabled={isSigningOut}
                onClick={onSignOut}
              >
                Sign out
              </Button>

              <Button asChild disabled={isSigningOut}>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant={'outline'} asChild>
                <Link to="/sign-in">Sign in</Link>
              </Button>

              <Button asChild>
                <Link to="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
