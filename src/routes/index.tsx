import { createFileRoute } from '@tanstack/react-router'
import { ComponentExample } from '@/components/component-example'
import Navbar from '#/components/shared/navbar'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <>
      <Navbar />
      <ComponentExample />
    </>
  )
}
