import { getItemsFn } from '#/functions/items.function'
import { itemsSearchSchema } from '#/schemas/items.schema'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { ItemStatus } from '#/generated/prisma/enums'
import { Suspense, useEffect, useState } from 'react'
import ItemsList from '#/components/features/dashboard/items/items-list'

export const Route = createFileRoute('/dashboard/items/')({
  component: ItemsPage,
  loader: () => ({ itemsPromise: getItemsFn() }),
  validateSearch: zodValidator(itemsSearchSchema),
})

function ItemsPage() {
  const data = Route.useLoaderData()
  const searchParams = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [searchInput, setSearchInput] = useState(searchParams.query)

  useEffect(() => {
    if (searchInput === searchParams.query) return

    const timeoutId = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, query: searchInput }) })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchInput, searchParams.query, navigate])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <div className="text-2xl font-bold">Saved Items</div>
        <p className="text-muted-foreground">
          Your saved articles and content!
        </p>
      </div>

      <div className="flex gap-4">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by title or tags..."
        />

        <Select
          value={searchParams.status}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({
                ...prev,
                status: value as typeof searchParams.status,
              }),
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>

            {Object.values(ItemStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Suspense fallback={<ItemsList.Skeleton />}>
        <ItemsList
          itemsPromise={data.itemsPromise}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}
