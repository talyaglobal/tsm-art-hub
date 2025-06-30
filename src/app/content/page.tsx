import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"

export default function Page() {
  return (
    <main className="container relative">
      <PageHeader title="Content Management" description="Manage documents, knowledge base, and content resources.">
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
      </PageHeader>
    </main>
  )
}
