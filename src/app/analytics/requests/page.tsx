import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"

export default function AnalyticsRequestsPage() {
  return (
    <div className="container mx-auto py-10">
      <PageHeader
        title="API Requests Analytics"
        description="Monitor API request patterns, performance metrics, and error analysis."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </PageHeader>
      {/* rest of code here */}
    </div>
  )
}
