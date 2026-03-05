import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { copyItemFn } from '#/functions/items.function'
import type { SavedItem } from '#/generated/prisma/client'
import { Link } from '@tanstack/react-router'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

interface ItemCardProps {
  item: SavedItem
}

export default function ItemCard({ item }: ItemCardProps) {
  const onCopyToClipboard = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault()
    const promise = copyItemFn(item.url)
    toast.promise(promise, {
      loading: 'Copying URL...',
      success: 'URL copied to clipboard',
      error: 'Failed to copy URL to clipboard',
    })
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg pt-0">
      <Link
        to="/dashboard/items/$itemId"
        params={{ itemId: item.id }}
        className="block"
      >
        {item.ogImage && (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={item.ogImage}
              alt={item.title ?? 'Article Thumbnail'}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        <CardHeader className="space-y-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant={item.status === 'COMPLETED' ? 'default' : 'destructive'}
              className="font-semibold"
            >
              {item.status.toLowerCase()}
            </Badge>

            <Button
              size={'icon-sm'}
              variant={'outline'}
              onClick={onCopyToClipboard}
            >
              <Copy className="size-4" />
            </Button>
          </div>

          <CardTitle className="line-clamp-1 text-xl leading-snug group-hover:text-primary transition-colors">
            {item.title}
          </CardTitle>

          {item.author && (
            <p className="text-xs text-muted-foreground">{item.author}</p>
          )}

          {item.summary && (
            <CardDescription className="line-clamp-3 text-sm">
              {item.summary}
            </CardDescription>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {item.tags.slice(0, 4).map((tag, index) => (
                <Badge variant="secondary" key={index} className="text-primary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Link>
    </Card>
  )
}

ItemCard.Skeleton = function ItemCardSkeleton() {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg pt-0">
      <Skeleton className="aspect-video w-full" />

      <CardHeader className="space-y-4 px-4 py-0 m-0 gap-0">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-32" />

          <Skeleton className="size-8" />
        </div>

        <Skeleton className="w-3/4 h-6" />

        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
    </Card>
  )
}
