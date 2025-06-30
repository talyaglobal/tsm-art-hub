import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"

export default function BillingPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Billing & Usage"
        description="Manage your subscription, view usage metrics, and billing history."
      >
        <div className="flex items-center gap-2">
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </PageHeader>
      {/* rest of code here */}
    </div>
  )
}
