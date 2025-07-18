import { useState } from 'react'
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Phone,
  Menu,
  X,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'appointments', name: 'Appointments', icon: Calendar },
  { id: 'patients', name: 'Patients', icon: Users },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare },
  { id: 'sms', name: 'SMS', icon: Phone },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'settings', name: 'Settings', icon: Settings },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[hsl(var(--whatsapp-green))] rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">ClinicChat</h1>
            <p className="text-xs text-gray-500">Appointment System</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-medium",
                activeTab === item.id 
                  ? "bg-[hsl(var(--whatsapp-green))] text-white hover:bg-[hsl(var(--whatsapp-dark))]" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => {
                onTabChange(item.id)
                setIsMobileOpen(false)
              }}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.name}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-green-800">WhatsApp Connected</p>
            <p className="text-xs text-green-600">Ready to receive messages</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  )
}