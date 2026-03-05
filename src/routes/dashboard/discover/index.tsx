import SearchForm from '#/components/features/dashboard/discover/search-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

export const Route = createFileRoute('/dashboard/discover/')({
  component: DiscoverPage,
})

function DiscoverPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Discover</h1>

          <p className="text-muted-foreground pt-2">
            Search the web for articles on any topic
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Topic Search
            </CardTitle>

            <CardDescription>
              Search the web for content and import what you find interesting
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <SearchForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
