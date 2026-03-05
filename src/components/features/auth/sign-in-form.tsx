import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '../../ui/button'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'
import { useState } from 'react'
import { signInFormSchema } from '#/schemas/auth.schema'

export default function SignInForm() {
  const [isSignInFormSubmitting, setIsSignInFormSubmitting] = useState(false)
  const navigate = useNavigate()

  const signInForm = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: signInFormSchema },
    onSubmit: async ({ value }) => {
      setIsSignInFormSubmitting(true)

      try {
        await authClient.signIn.email({
          ...value,
          fetchOptions: {
            onSuccess: () => {
              toast.success('Logged in successfully')
              navigate({ to: '/dashboard' })
              signInForm.reset()
            },
            onError: ({ error }) => {
              toast.error(error.message)
            },
          },
        })
      } catch {
        toast.error('Failed to sign in')
      } finally {
        setIsSignInFormSubmitting(false)
      }
    },
  })

  return (
    <form
      id="sign-in-form"
      onSubmit={(event) => {
        event.preventDefault()
        signInForm.handleSubmit()
      }}
    >
      <FieldGroup>
        <signInForm.Field
          name="email"
          children={(field) => {
            const { isTouched, isValid, errors } = field.state.meta
            const isInvalid = isTouched && !isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email address</FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  disabled={isSignInFormSubmitting}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                />

                {isInvalid && <FieldError errors={errors} />}
              </Field>
            )
          }}
        />

        <signInForm.Field
          name="password"
          children={(field) => {
            const { isTouched, isValid, errors } = field.state.meta
            const isInvalid = isTouched && !isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  disabled={isSignInFormSubmitting}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                {isInvalid && <FieldError errors={errors} />}
              </Field>
            )
          }}
        />

        <Field className="gap-4">
          <Button type="submit" disabled={isSignInFormSubmitting}>
            Login
          </Button>

          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
