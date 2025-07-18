import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Clock,
  TrendingUp,
  Phone,
  CheckCircle,
  AlertCircle,
  Database,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format, isToday } from 'date-fns'
import { useGoogleSheets } from '@/hooks/useGoogleSheets'
import { blink } from '@/blink/client'
import type { DashboardStats, Appointment } from '@/types'

export function Dashboard() {
  const { service, isConnected } = useGoogleSheets()
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    whatsappMessages: 0,
    smsMessages: 0
  })
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    blink.auth.me().then(setUser).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (service && isConnected && user) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [service, isConnected, user])

  const loadDashboardData = async () => {
    if (!service || !user) return
    
    setLoading(true)
    try {
      // Load appointments
      const appointments = await service.getAppointments(user.id)
      
      // Load patients
      const patients = await service.getPatients(user.id)
      
      // Calculate stats
      const today = new Date()
      const todayAppointments = appointments.filter(apt => 
        isToday(new Date(apt.appointmentDate))
      ).length
      
      const pendingAppointments = appointments.filter(apt => 
        apt.status === 'pending'
      ).length

      setStats({
        totalAppointments: appointments.length,
        todayAppointments,
        pendingAppointments,
        totalPatients: patients.length,
        whatsappMessages: appointments.filter(apt => apt.whatsappMessageId).length,
        smsMessages: appointments.filter(apt => apt.smsMessageId).length
      })

      // Set recent appointments (last 5)
      const sortedAppointments = appointments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      
      setRecentAppointments(sortedAppointments)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%'
    },
    {
      title: 'Today\'s Appointments',
      value: stats.todayAppointments,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3'
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-2'
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+8%'
    },
    {
      title: 'WhatsApp Messages',
      value: stats.whatsappMessages,
      icon: MessageSquare,
      color: 'text-[hsl(var(--whatsapp-green))]',
      bgColor: 'bg-green-50',
      change: '+24'
    },
    {
      title: 'SMS Messages',
      value: stats.smsMessages,
      icon: Phone,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: '+5'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your clinic today.</p>
        </div>
        
        <Alert className="max-w-2xl">
          <Database className="w-4 h-4" />
          <AlertDescription>
            Google Sheets integration is not configured. Please go to{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-medium text-blue-600"
              onClick={() => window.location.hash = '#settings'}
            >
              Settings
            </Button>
            {' '}to set up your Google Sheets connection and start managing your clinic data.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your clinic today.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Database className="w-3 h-3 mr-1" />
            Google Sheets Connected
          </Badge>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-lg font-semibold text-gray-900">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {loading ? (
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stat.change}</span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Appointments</CardTitle>
            <div className="flex items-center gap-2">
              {service?.config && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${service.config.spreadsheetId}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-40 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No appointments yet</p>
                <p className="text-sm text-gray-500">Create your first appointment to get started</p>
              </div>
            ) : (
              recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-gray-600">{appointment.serviceType}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(appointment.appointmentDate), 'MMM d')} at {appointment.appointmentTime}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-[hsl(var(--whatsapp-green))] hover:bg-[hsl(var(--whatsapp-dark))]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send WhatsApp Message
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule New Appointment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Phone className="w-4 h-4 mr-2" />
              Send SMS Reminder
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Sheets Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Database className="w-5 h-5 mr-2 text-green-600" />
              Google Sheets Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Connected & Syncing</p>
                  <p className="text-sm text-green-600">Your data is automatically saved to Google Sheets</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {service?.config && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${service.config.spreadsheetId}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open Sheet
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-[hsl(var(--whatsapp-green))]" />
              WhatsApp Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Setup Required</p>
                  <p className="text-sm text-orange-600">Configure WhatsApp Business API to receive messages</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}