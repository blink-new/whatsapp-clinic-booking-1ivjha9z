import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useGoogleSheets } from '@/hooks/useGoogleSheets'
import { blink } from '@/blink/client'
import type { Appointment } from '@/types'

export function AppointmentsView() {
  const { service, isConnected } = useGoogleSheets()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    appointmentDate: '',
    appointmentTime: '',
    serviceType: '',
    notes: ''
  })

  useEffect(() => {
    // Get current user
    blink.auth.me().then(setUser).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (service && isConnected && user) {
      loadAppointments()
    } else {
      setLoading(false)
    }
  }, [service, isConnected, user])

  const loadAppointments = async () => {
    if (!service || !user) return
    
    setLoading(true)
    try {
      const data = await service.getAppointments(user.id)
      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('Failed to load appointments from Google Sheets')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAppointment = async () => {
    if (!service || !user) return

    if (!newAppointment.patientName || !newAppointment.patientPhone || 
        !newAppointment.appointmentDate || !newAppointment.appointmentTime || 
        !newAppointment.serviceType) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const appointment = await service.createAppointment({
        ...newAppointment,
        status: 'pending',
        userId: user.id
      })
      
      setAppointments(prev => [appointment, ...prev])
      setIsNewAppointmentOpen(false)
      setNewAppointment({
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        appointmentDate: '',
        appointmentTime: '',
        serviceType: '',
        notes: ''
      })
      
      toast.success('Appointment created successfully!')
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Failed to create appointment')
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    if (!service || !user) return

    try {
      await service.updateAppointment(appointmentId, { 
        status: newStatus as any,
        userId: user.id
      })
      
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus as any, updatedAt: new Date().toISOString() }
          : apt
      ))
      
      toast.success(`Appointment ${newStatus}`)
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patientPhone.includes(searchQuery) ||
      appointment.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  }

  if (!isConnected) {
    return (
      <div className="p-6">
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
            {' '}to set up your Google Sheets connection.
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
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage and track all patient appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Database className="w-3 h-3 mr-1" />
            Google Sheets Connected
          </Badge>
          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[hsl(var(--whatsapp-green))] hover:bg-[hsl(var(--whatsapp-dark))]">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
                <DialogDescription>
                  Add a new appointment to your Google Sheets database.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      value={newAppointment.patientName}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientPhone">Phone Number *</Label>
                    <Input
                      id="patientPhone"
                      value={newAppointment.patientPhone}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, patientPhone: e.target.value }))}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientEmail">Email (Optional)</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={newAppointment.patientEmail}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, patientEmail: e.target.value }))}
                    placeholder="john.doe@email.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Date *</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={newAppointment.appointmentDate}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Time *</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={newAppointment.appointmentTime}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, appointmentTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select 
                    value={newAppointment.serviceType} 
                    onValueChange={(value) => setNewAppointment(prev => ({ ...prev, serviceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Consultation">General Consultation</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Specialist Consultation">Specialist Consultation</SelectItem>
                      <SelectItem value="Dental Checkup">Dental Checkup</SelectItem>
                      <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                      <SelectItem value="Lab Tests">Lab Tests</SelectItem>
                      <SelectItem value="Vaccination">Vaccination</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the appointment..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAppointment} className="bg-[hsl(var(--whatsapp-green))] hover:bg-[hsl(var(--whatsapp-dark))]">
                  Create Appointment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-all hover:shadow-md ${
              statusFilter === status ? 'ring-2 ring-[hsl(var(--whatsapp-green))]' : ''
            }`}
            onClick={() => setStatusFilter(status)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{status === 'all' ? 'Total' : status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            All Appointments
            {service?.config && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${service.config.spreadsheetId}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Google Sheets
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[hsl(var(--whatsapp-green))] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Loading appointments...</p>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by creating your first appointment.'}
              </p>
              <Button 
                onClick={() => setIsNewAppointmentOpen(true)}
                className="bg-[hsl(var(--whatsapp-green))] hover:bg-[hsl(var(--whatsapp-dark))]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Appointment
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[hsl(var(--whatsapp-green))] rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {appointment.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.patientName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-1" />
                          {appointment.patientPhone}
                        </div>
                        {appointment.patientEmail && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 mr-1" />
                            {appointment.patientEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                          {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-3 h-3 mr-1 text-gray-400" />
                          {appointment.appointmentTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{appointment.serviceType}</p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {appointment.notes || 'No notes'}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'confirmed')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'completed')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'cancelled')}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="w-4 h-4 mr-2" />
                            View Patient
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}