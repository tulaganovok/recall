import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import type { SavedItem } from '#/generated/prisma/client'
import type { ItemsSearchSchema } from '#/lib/types'
import { Inbox } from 'lucide-react'
import ItemCard from './item-card'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { use } from 'react'

interface ItemsListProps {
  itemsPromise: Promise<SavedItem[]>
  searchParams: ItemsSearchSchema
}

export default function ItemsList({
  itemsPromise,
  searchParams,
}: ItemsListProps) {
  const items = use(itemsPromise)

  const filteredItems = items.filter((item) => {
    const { query, status } = searchParams

    const matchesQuery =
      query === '' ||
      item.title?.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))

    const matchesStatus = status === 'all' || item.status === status

    return matchesQuery && matchesStatus
  })

  if (filteredItems.length === 0)
    return (
      <Empty className="border rounded-lg h-full">
        <EmptyHeader>
          <EmptyMedia variant={'icon'}>
            <Inbox className="size-12" />
          </EmptyMedia>

          <EmptyTitle>
            {items.length === 0 ? 'No items saved yet' : 'No items found'}
          </EmptyTitle>

          <EmptyDescription>
            {items.length === 0
              ? 'Import a URL to get started with saving your content.'
              : 'No items match your current search filters.'}
          </EmptyDescription>
        </EmptyHeader>

        {items.length == 0 && (
          <EmptyContent>
            <Button asChild>
              <Link to="/dashboard/import">Import URL</Link>
            </Button>
          </EmptyContent>
        )}
      </Empty>
    )

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {filteredItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}

ItemsList.Skeleton = function ItemsListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <ItemCard.Skeleton key={index} />
      ))}
    </div>
  )
}
