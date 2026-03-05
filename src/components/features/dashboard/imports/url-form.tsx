import { Button } from '#/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { scrapeUrlFn } from '#/functions/imports.function'
import { urlFormSchema } from '#/schemas/imports.schema'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

export default function UrlForm() {
  const [isUrlFormSubmitting, setIsUrlFormSubmitting] = useState(false)
  const navigate = useNavigate()

  const urlForm = useForm({
    defaultValues: { url: '' },
    validators: { onSubmit: urlFormSchema },
    onSubmit: async ({ value }) => {
      setIsUrlFormSubmitting(true)

      try {
        await scrapeUrlFn({ data: value })
        toast.success('URL scrapped successfully')
        navigate({ to: '/dashboard/items' })
        urlForm.reset()
      } catch {
        toast.error('Failed to fetch URL')
      } finally {
        setIsUrlFormSubmitting(false)
      }
    },
  })

  return (
    <form
      id="url-form"
      onSubmit={(event) => {
        event.preventDefault()
        urlForm.handleSubmit()
      }}
    >
      <FieldGroup>
        <urlForm.Field
          name="url"
          children={(field) => {
            const { isTouched, isValid, errors } = field.state.meta
            const isInvalid = isTouched && !isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>URL</FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  disabled={isUrlFormSubmitting}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="https://tanstack.com/start/latest"
                />

                {isInvalid && <FieldError errors={errors} />}
              </Field>
            )
          }}
        />

        <Button disabled={isUrlFormSubmitting}>Import URL</Button>
      </FieldGroup>
    </form>
  )
}
