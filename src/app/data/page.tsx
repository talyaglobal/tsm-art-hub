import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"

export default function DataPage() {
  return (
    <div className="container mx-auto py-10">
      <PageHeader title="Data Management" description="Manage databases, tables, and data operations.">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            New Database
          </Button>
        </div>
      </PageHeader>
    </div>
  )
}
