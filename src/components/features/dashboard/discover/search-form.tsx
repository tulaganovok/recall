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
import { bulkScrapeUrlsFn, searchWebFn } from '#/functions/discover.function'
import type { BulkScrapeProgress } from '#/lib/types'
import { searchSchema } from '#/schemas/discover.schema'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SearchForm() {
  const [isSearchFormSubmitting, setIsSearchFormSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResultWeb[]>([])
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)
  const navigate = useNavigate()

  const searchForm = useForm({
    defaultValues: { query: '' },
    validators: { onSubmit: searchSchema },
    onSubmit: async ({ value }) => {
      setIsSearchFormSubmitting(true)

      try {
        const result = await searchWebFn({ data: value })
        setSearchResults(result as SearchResultWeb[])
        searchForm.reset()
      } catch (error) {
        toast.error('Failed to submit search form')
      } finally {
        setIsSearchFormSubmitting(false)
      }
    },
  })

  function handleSelectAll() {
    if (selectedUrls.size === searchResults.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(searchResults.map((link) => link.url)))
    }
  }

  function handleToggleUrl(url: string) {
    const newSelected = new Set(selectedUrls)

    if (newSelected.has(url)) {
      newSelected.delete(url)
    } else {
      newSelected.add(url)
    }

    setSelectedUrls(newSelected)
  }

  async function handleBulkImport() {
    setIsSearchFormSubmitting(true)

    try {
      if (selectedUrls.size === 0) {
        toast.error('Please select at least one URL to import.')
        return
      }

      setProgress({
        completed: 0,
        total: selectedUrls.size,
        url: '',
        status: 'success',
      })
      let successCount = 0
      let failedCount = 0

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
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsSearchFormSubmitting(false)
      navigate({ to: '/dashboard/items' })
    }
  }

  return (
    <>
      <form
        id="search-form"
        onSubmit={(event) => {
          event.preventDefault()
          searchForm.handleSubmit()
        }}
      >
        <FieldGroup>
          <searchForm.Field
            name="query"
            children={(field) => {
              const { isTouched, isValid, errors } = field.state.meta
              const isInvalid = isTouched && !isValid

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Search query</FieldLabel>

                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isSearchFormSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="e.g., React Server Components tutorial"
                  />

                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              )
            }}
          />

          <Button disabled={isSearchFormSubmitting}>
            <Search /> Search web
          </Button>
        </FieldGroup>
      </form>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Found {searchResults.length} URLs
            </p>

            <Button onClick={handleSelectAll} variant="outline" size="sm">
              {selectedUrls.size === searchResults.length
                ? 'Deselect All'
                : 'Select All'}
            </Button>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4">
            {searchResults.map((link, index) => (
              <label
                key={index}
                className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md p-2"
              >
                <Checkbox
                  checked={selectedUrls.has(link.url)}
                  onCheckedChange={() => handleToggleUrl(link.url)}
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
            disabled={isSearchFormSubmitting}
            onClick={handleBulkImport}
            className="w-full"
            type="button"
          >
            {isSearchFormSubmitting ? (
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
