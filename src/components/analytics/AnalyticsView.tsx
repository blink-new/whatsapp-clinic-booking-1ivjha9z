import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Users, 
  MessageSquare, 
  Phone,
  Download,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  format, 
  isWithinInterval,
  parseISO,
  subDays,
  subWeeks,
  subMonths
} from 'date-fns'
import { useGoogleSheets } from '@/hooks/useGoogleSheets'
import { blink } from '@/blink/client'
import type { Appointment, Patient } from '@/types'

interface AnalyticsData {
  totalAppointments: number
  totalPatients: number
  appointmentsByStatus: Record<string, number>
  appointmentsByService: Record<string, number>
  appointmentsByDay: Record<string, number>
  appointmentsByMonth: Record<string, number>
  averageAppointmentsPerDay: number
  patientRetentionRate: number
  mostPopularService: string
  busyDays: string[]
  recentTrends: {
    appointmentsChange: number
    patientsChange: number
    completionRate: number
  }
}

export function AnalyticsView() {
  const { service, isConnected } = useGoogleSheets()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    blink.auth.me().then(setUser).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (service && isConnected && user) {
      loadAnalyticsData()
    } else {
      setLoading(false)
    }
  }, [service, isConnected, user, dateRange])

  const loadAnalyticsData = async () => {
    if (!service || !user) return
    
    setLoading(true)
    try {
      const [appointmentsData, patientsData] = await Promise.all([
        service.getAppointments(user.id),
        service.getPatients(user.id)
      ])
      
      setAppointments(appointmentsData)
      setPatients(patientsData)
      
      // Calculate analytics
      const filteredAppointments = filterAppointmentsByDateRange(appointmentsData, dateRange)
      const analyticsData = calculateAnalytics(filteredAppointments, patientsData, appointmentsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointmentsByDateRange = (appointments: Appointment[], range: string) => {
    const now = new Date()
    let startDate: Date
    
    switch (range) {
      case '7days':
        startDate = subDays(now, 7)
        break
      case '30days':
        startDate = subDays(now, 30)
        break
      case '3months':
        startDate = subMonths(now, 3)
        break
      case '6months':
        startDate = subMonths(now, 6)
        break
      case '1year':
        startDate = subMonths(now, 12)
        break
      default:
        startDate = subDays(now, 30)
    }
    
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.appointmentDate)
      return isWithinInterval(aptDate, { start: startDate, end: now })
    })
  }

  const calculateAnalytics = (
    filteredAppointments: Appointment[], 
    allPatients: Patient[],
    allAppointments: Appointment[]
  ): AnalyticsData => {
    // Basic counts
    const totalAppointments = filteredAppointments.length
    const totalPatients = allPatients.length

    // Appointments by status
    const appointmentsByStatus = filteredAppointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Appointments by service type
    const appointmentsByService = filteredAppointments.reduce((acc, apt) => {
      acc[apt.serviceType] = (acc[apt.serviceType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Appointments by day of week
    const appointmentsByDay = filteredAppointments.reduce((acc, apt) => {
      const day = format(parseISO(apt.appointmentDate), 'EEEE')
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Appointments by month
    const appointmentsByMonth = filteredAppointments.reduce((acc, apt) => {
      const month = format(parseISO(apt.appointmentDate), 'MMM yyyy')
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate averages and trends
    const daysInRange = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
    const averageAppointmentsPerDay = totalAppointments / daysInRange

    // Most popular service
    const mostPopularService = Object.entries(appointmentsByService)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'

    // Busy days (days with most appointments)
    const busyDays = Object.entries(appointmentsByDay)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day)

    // Calculate trends (compare with previous period)
    const previousPeriodStart = dateRange === '7days' ? subDays(new Date(), 14) : 
                               dateRange === '30days' ? subDays(new Date(), 60) : 
                               subMonths(new Date(), 6)
    const previousPeriodEnd = dateRange === '7days' ? subDays(new Date(), 7) : 
                             dateRange === '30days' ? subDays(new Date(), 30) : 
                             subMonths(new Date(), 3)

    const previousPeriodAppointments = allAppointments.filter(apt => {
      const aptDate = parseISO(apt.appointmentDate)
      return isWithinInterval(aptDate, { start: previousPeriodStart, end: previousPeriodEnd })
    })

    const appointmentsChange = previousPeriodAppointments.length > 0 
      ? ((totalAppointments - previousPeriodAppointments.length) / previousPeriodAppointments.length) * 100
      : 0

    const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0

    // Patient retention (patients with multiple appointments)
    const patientAppointmentCounts = allAppointments.reduce((acc, apt) => {
      acc[apt.patientPhone] = (acc[apt.patientPhone] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const returningPatients = Object.values(patientAppointmentCounts).filter(count => count > 1).length
    const patientRetentionRate = totalPatients > 0 ? (returningPatients / totalPatients) * 100 : 0

    return {
      totalAppointments,
      totalPatients,
      appointmentsByStatus,
      appointmentsByService,
      appointmentsByDay,
      appointmentsByMonth,
      averageAppointmentsPerDay,
      patientRetentionRate,
      mostPopularService,
      busyDays,
      recentTrends: {
        appointmentsChange,
        patientsChange: 0, // Could calculate if we had patient creation dates
        completionRate
      }
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Insights and trends for your clinic</p>
        </div>
        
        <Alert className="max-w-2xl">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Google Sheets integration is not configured. Please go to Settings to set up your Google Sheets connection.
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Insights and trends for your clinic</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[hsl(var(--whatsapp-green))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      ) : !analytics ? (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Start booking appointments to see analytics</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalAppointments}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className={`w-4 h-4 mr-1 ${
                        analytics.recentTrends.appointmentsChange >= 0 ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <span className={`text-sm ${
                        analytics.recentTrends.appointmentsChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analytics.recentTrends.appointmentsChange >= 0 ? '+' : ''}
                        {analytics.recentTrends.appointmentsChange.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                    </div>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalPatients}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-600">
                        {analytics.patientRetentionRate.toFixed(1)}% retention rate
                      </span>
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Daily Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.averageAppointmentsPerDay.toFixed(1)}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-600">
                        Based on selected period
                      </span>
                    </div>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.recentTrends.completionRate.toFixed(1)}%</p>
                    <div className="flex items-center mt-2">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      <span className="text-sm text-green-600">
                        {analytics.appointmentsByStatus.completed || 0} completed
                      </span>
                    </div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.appointmentsByStatus).map(([status, count]) => {
                    const percentage = (count / analytics.totalAppointments) * 100
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'confirmed': return 'bg-green-500'
                        case 'pending': return 'bg-orange-500'
                        case 'cancelled': return 'bg-red-500'
                        case 'completed': return 'bg-blue-500'
                        default: return 'bg-gray-500'
                      }
                    }
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                          <span className="text-sm font-medium capitalize">{status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{count}</span>
                          <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Popular Services */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.appointmentsByService)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([service, count]) => {
                      const percentage = (count / analytics.totalAppointments) * 100
                      return (
                        <div key={service} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{service}</span>
                            <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[hsl(var(--whatsapp-green))] h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Busy Days */}
            <Card>
              <CardHeader>
                <CardTitle>Busiest Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.appointmentsByDay)
                    .sort(([,a], [,b]) => b - a)
                    .map(([day, count]) => {
                      const maxCount = Math.max(...Object.values(analytics.appointmentsByDay))
                      const percentage = (count / maxCount) * 100
                      
                      return (
                        <div key={day} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{day}</span>
                            <span className="text-sm text-gray-600">{count} appointments</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Most Popular Service</p>
                    <p className="text-lg font-bold text-green-900">{analytics.mostPopularService}</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Busiest Days</p>
                    <p className="text-sm text-blue-900">{analytics.busyDays.join(', ')}</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">Patient Retention</p>
                    <p className="text-lg font-bold text-purple-900">{analytics.patientRetentionRate.toFixed(1)}%</p>
                    <p className="text-xs text-purple-700">Patients with multiple visits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary for Selected Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalAppointments}</p>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analytics.appointmentsByStatus.completed || 0}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analytics.appointmentsByStatus.pending || 0}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}