import { PageHeader } from "@/components/layout/page-header"

export default function ProfilePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <PageHeader
        title="Profile Settings"
        description="Manage your personal information, security settings, and preferences."
      />
      <div>{/* Rest of the profile page content */}</div>
    </main>
  )
}
