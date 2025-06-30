import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"

export default function NotificationsPage() {
  return (
    <div className="container relative">
      <PageHeader title="Notifications" description="Manage your notification preferences and view recent alerts.">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </PageHeader>
    </div>
  )
}
