import BulkForm from '#/components/features/dashboard/imports/bulk-form'
import UrlForm from '#/components/features/dashboard/imports/url-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { createFileRoute } from '@tanstack/react-router'
import { Globe, LinkIcon } from 'lucide-react'

export const Route = createFileRoute('/dashboard/import/')({
  component: ImportPage,
})

function ImportPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Import Content</h1>

          <p className="text-muted-foreground pt-1">
            Save web pages to your library for later reading
          </p>
        </div>

        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <LinkIcon className="size-4" />
              Single URL
            </TabsTrigger>

            <TabsTrigger value="bulk" className="gap-2">
              <Globe className="size-4" />
              Bulk Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Import Single URL</CardTitle>

                <CardDescription>
                  Scrape and save content from any web app!😯
                </CardDescription>
              </CardHeader>

              <CardContent>
                <UrlForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import</CardTitle>

                <CardDescription>
                  Discover and import multiple URLs from a website at once🚀
                </CardDescription>
              </CardHeader>

              <CardContent>
                <BulkForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
