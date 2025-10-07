import DashboardLayout from "@/components/dashboard-layout"

export default function LockedFundsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-white text-3xl font-bold mb-4">Locked Funds</h1>
        <p className="text-gray-400">View and manage your locked funds here.</p>
      </div>
    </DashboardLayout>
  )
}
