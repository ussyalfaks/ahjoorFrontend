import DashboardLayout from "@/components/dashboard-layout"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-white text-3xl font-bold mb-4">Settings</h1>
        <p className="text-gray-400">Configure your application preferences.</p>
      </div>
    </DashboardLayout>
  )
}
