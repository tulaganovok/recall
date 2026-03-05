import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Progress } from '#/components/ui/progress'
import { bulkScrapeUrlsFn } from '#/functions/discover.function'
import { mapUrlFn } from '#/functions/imports.function'
import type { BulkScrapeProgress } from '#/lib/types'
import { bulkFormSchema } from '#/schemas/imports.schema'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function BulkForm() {
  const [isBulkFormSubmitting, setIsBulkFormSubmitting] = useState(false)
  const [discoveredLinks, setDiscoveredLinks] = useState<SearchResultWeb[]>([])
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)
  const navigate = useNavigate()

  const bulkForm = useForm({
    defaultValues: { url: '', search: '' },
    validators: { onSubmit: bulkFormSchema },
    onSubmit: async ({ value }) => {
      setIsBulkFormSubmitting(true)

      try {
        const data = await mapUrlFn({ data: value })
        setDiscoveredLinks(data)
        bulkForm.reset()
      } catch {
        toast.error('Failed to fetch bulk')
      } finally {
        setIsBulkFormSubmitting(false)
      }
    },
  })

  const onSelectAll = () => {
    if (selectedUrls.size === discoveredLinks.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(discoveredLinks.map((link) => link.url)))
    }
  }

  const onToggleUrl = (url: string) => {
    const newSelected = new Set(selectedUrls)

    if (newSelected.has(url)) {
      newSelected.delete(url)
    } else {
      newSelected.add(url)
    }

    setSelectedUrls(newSelected)
  }

  const onBulkImport = async () => {
    if (selectedUrls.size === 0) {
      toast.error('Please select at least one URL to import.')
      return
    }

    setIsBulkFormSubmitting(true)

    setProgress({
      completed: 0,
      total: selectedUrls.size,
      url: '',
      status: 'success',
    })
    let successCount = 0
    let failedCount = 0

    try {
      for await (const update of await bulkScrapeUrlsFn({
        data: { urls: Array.from(selectedUrls) },
      })) {
        setProgress(update)

        if (update.status === 'success') {
          successCount++
        } else {
          failedCount++
        }
      }

      setProgress(null)

      if (failedCount > 0) {
        toast.success(`Imported ${successCount} Urls (${failedCount} failed)`)
      } else {
        toast.success(`Successfully imported ${successCount} URLs`)
        navigate({ to: '/dashboard/items' })
      }
    } catch (error) {
      toast.error('Failed to import')
    } finally {
      setIsBulkFormSubmitting(false)
    }
  }

  return (
    <>
      <form
        id="bulk-form"
        onSubmit={(event) => {
          event.preventDefault()
          bulkForm.handleSubmit()
        }}
      >
        <FieldGroup>
          <bulkForm.Field
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
                    disabled={isBulkFormSubmitting}
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

          <bulkForm.Field
            name="search"
            children={(field) => {
              const { isTouched, isValid, errors } = field.state.meta
              const isInvalid = isTouched && !isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Filter (optional)
                  </FieldLabel>

                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isBulkFormSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="e.g. Blog, docs, tutorial"
                  />

                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              )
            }}
          />

          <Button disabled={isBulkFormSubmitting}>Import URLs</Button>
        </FieldGroup>
      </form>

      {/* Discovered URLs list */}
      {discoveredLinks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Found {discoveredLinks.length} URLs
            </p>

            <Button onClick={onSelectAll} variant="outline" size="sm">
              {selectedUrls.size === discoveredLinks.length
                ? 'Deselect All'
                : 'Select All'}
            </Button>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4">
            {discoveredLinks.map((link) => (
              <label
                key={link.url}
                className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md p-2"
              >
                <Checkbox
                  checked={selectedUrls.has(link.url)}
                  onCheckedChange={() => onToggleUrl(link.url)}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {link.title ?? 'Title has not been found'}
                  </p>

                  <p className="text-muted-foreground truncate text-xs">
                    {link.description ?? 'Description has not been found'}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {link.url}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Importing: {progress.completed} / {progress.total}
                </span>
                <span className="font-medium">
                  {Math.round(progress.completed / progress.total) * 100}
                </span>
              </div>
              <Progress value={(progress.completed / progress.total) * 100} />
            </div>
          )}

          <Button
            disabled={isBulkFormSubmitting}
            onClick={onBulkImport}
            className="w-full"
            type="button"
          >
            {isBulkFormSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {progress
                  ? `Importing ${progress.completed}/${progress.total}...`
                  : 'Starting...'}
              </>
            ) : (
              `Import ${selectedUrls.size} URLs`
            )}
          </Button>
        </div>
      )}
    </>
  )
}
