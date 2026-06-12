import Sidebar from './Sidebar'
import NotificationBell from '../NotificationBell'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-52 flex flex-col">
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          <NotificationBell />
        </div>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}