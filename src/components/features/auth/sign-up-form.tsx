import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'
import { useState } from 'react'
import { signUpFormSchema } from '#/schemas/auth.schema'

export default function SignUpForm() {
  const [isSignUpFormSubmitting, setIsSignUpFormSubmitting] = useState(false)
  const navigate = useNavigate()

  const signUpForm = useForm({
    defaultValues: { fullName: '', email: '', password: '' },
    validators: { onSubmit: signUpFormSchema },
    onSubmit: async ({ value }) => {
      setIsSignUpFormSubmitting(true)

      try {
        await authClient.signUp.email({
          name: value.fullName,
          email: value.email,
          password: value.password,
          fetchOptions: {
            onSuccess: () => {
              toast.success('Account created successfully')
              navigate({ to: '/dashboard' })
              signUpForm.reset()
            },
            onError: ({ error }) => {
              toast.error(error.message)
            },
          },
        })
      } catch {
        toast.error('Failed to sign up')
      } finally {
        setIsSignUpFormSubmitting(false)
      }
    },
  })

  return (
    <form
      id="sign-up-form"
      onSubmit={(event) => {
        event.preventDefault()
        signUpForm.handleSubmit()
      }}
    >
      <FieldGroup>
        <signUpForm.Field
          name="fullName"
          children={(field) => {
            const { isTouched, isValid, errors } = field.state.meta
            const isInvalid = isTouched && !isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  disabled={isSignUpFormSubmitting}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />

                {isInvalid && <FieldError errors={errors} />}
              </Field>
            )
          }}
        />

        <signUpForm.Field
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
                  disabled={isSignUpFormSubmitting}
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

        <signUpForm.Field
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
                  disabled={isSignUpFormSubmitting}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                />

                {isInvalid && <FieldError errors={errors} />}
              </Field>
            )
          }}
        />

        <FieldGroup>
          <Field className="gap-4">
            <Button type="submit" disabled={isSignUpFormSubmitting}>
              Create Account
            </Button>

            <FieldDescription className="px-6 text-center">
              Already have an account? <Link to="/sign-in">Sign in</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldGroup>
    </form>
  )
}
